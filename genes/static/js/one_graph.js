// const $ = require('jquery')
// const d3 = require('d3')
// Hardcode first setting of checkConds to prevent initialization errors
window.sessionStorage.setItem('checkConds', '1.6,13--0,1.8--6.2,13')
const PERC_DIV = 15064 / 100
const vennMargin = { top: 30, bottom: 0, left: 30, right: 30 };
const vennWidth = 1000 - vennMargin.left - vennMargin.right;
const vennHeight = 1000 - vennMargin.top - vennMargin.bottom;
// //console.log(("HERE");
// Fix empty selection upon
const IV = 0.01
const DECIMALS = 2
const MAX_X_RANGE = 650
const MAX_X_DOMAIN = 13
const DATA_IV = 0.01
const X_IV = 0.4
var CHARTS = []
var CHARTS_to_be_made= []
var ACTIVE_ID_NAME2CURRENT_SELECTION = new Object()

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[parseFloat(key)];
        var y = b[parseFloat(key)]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0))
    })
}

function round_to_n_decimals(n, decimals) {
    var multi = 10 ** decimals
    return Math.round(n * multi) / multi
}

function range(min, max, step, decimal) {
    var arr = [];
    var cur = min;
    var current_mult = min / step
    arr.push(min)
    while (true) {
        arr.push(round_to_n_decimals(((current_mult += 1) * step), decimal))
        if ((current_mult * step) >= max) {
            break
        }
    }
    return arr
}

function update_brush_handles(brush_handle_node) {
    var s = d3.event.selection
    s[0] = Math.max(s[0], 0)
    s[1] = Math.min(s[1], MAX_X_RANGE)
    brush_handle_node
        .attr('display', null)
        .attr('transform', function(d, i) {
            return 'translate(' + s[i] + ',' + 0 + ')'
        })
}
// Given range (or extent) of brush, returns limited range to prevent values
// out-of-range to be registered, e.g. [1.6, 10]
function filter_range(aloi) {
    aloi.sort(function(a, b) {
        return a - b
    })
    aloi[0] = Math.max(0, aloi[0])
    aloi[1] = Math.min(MAX_X_DOMAIN, aloi[1])
    if (aloi[0] == aloi[1]) {
        if (aloi[1] == MAX_X_DOMAIN) {
            aloi[0] -= DATA_IV
        } else {
            aloi[1] += DATA_IV // Increment max range to prevent non-existent
        }
    }
    return aloi
}
var findYatXbyBisection = function(x, path, error) {
    var length_end = path.getTotalLength()
    var length_start = 0
    var point = path.getPointAtLength((length_end + length_start) / 2) // get the middle point
    var bisection_iterations_max = 50
    var bisection_iterations = 0

    error = error || 0.01

    while (x < point.x - error || x > point.x + error) {
        // get the middle point
        point = path.getPointAtLength((length_end + length_start) / 2)

        if (x < point.x) {
            length_end = (length_start + length_end) / 2
        } else {
            length_start = (length_start + length_end) / 2
        }

        // Increase iteration
        if (bisection_iterations_max < ++bisection_iterations) {
            break
        }
    }
    return point.y
}

function round(n) {
    return Math.round(n / IV) * IV
}

function format(n) {
    // Use to access data from tsv files
    return parseFloat(Math.round(n / IV) * IV).toFixed(2)
}
// //console.log(("U")
function default_type(d) {
    Object.keys(d).forEach(function(key) {
        if ((key == '#H:hugo') || (key == 'probeset')) {
        } else {
            d[k] = +d[k]
        }
        // ////console.log((key, d[0][key]);
    })
}

function max_metric(arr) {
    arr.reduce(function(a, b) {
        return Math.max(a, b)
    })
}

function compute_metric(fname, metric) {
    var out = {}
    d3.tsv(fname, default_type, function(data) {
        data.forEach(function(d) {
            out[d.probeset] = metric(Object.values(d).filter(function(x) {
                typeof x === 'number'
            }))
        })
    })
    return out
}

// GRAPHS-----------------------------------------------------------------------
// Start drawing of graphs
const margin = {
    top: 30,
    left: 50,
    right: 50,
    bottom: 50
}
// var margin = {top: 20, left: 33, right: 33, bottom: 33}
var width = 750 - margin.left - margin.right
var height = 250 - margin.top - margin.bottom

function make_x_gridlines(x) {
    return d3.axisBottom(x)
        .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
        .tickSizeOuter(0)
}

function make_y_gridlines(scale, yaxis) {
    return d3.axisLeft(scale)
        .tickValues(yaxis.tickValues())
}

class histo {
    constructor(id_name) {
        this.id_name = id_name
        var current_n = 0
        this.set_data()
        this.set_axes()
        this.set_line()
        this.set_area()
        this.set_svg()
        this.fill(this.actual_data)
        this.set_brush()
        this.set_input_range_listener()
        // this.add_venn_circle()
    }

    set_input_range_listener() {
        var this_id_name = this.id_name
        var this_brush = this.brush
        var this_x = this.x
        d3.selectAll(`.input_range_${this_id_name}`).on('change', function() {
            var newRange = d3.selectAll(`.input_range_${this_id_name}`).nodes().map(function(e) {
                return round(e.value)
            })
            newRange = filter_range(newRange)
            newRange.map(this_x).sort(function(a, b) {
                return a - b
            })
            d3.select(`#brush_${this_id_name}`).call(this_brush.move,
                                                     newRange.map(this_x).sort(function(a, b) {
                                                         return a - b
                                                     }))
        })
    }

    set_data() {
        var data
        var x2nofgenes = new Object()
        var x2genes = new Object() // maps xvalue to genes within that interval's x-value
        var x2nofgenes_under = new Object()
        var id_name = this.id_name
        var cur = 0
        var relevant_range = range(0, MAX_X_DOMAIN, IV, 2)
        var current_number_of_genes = 0
        var actual_data = Array()

        $.ajax({
            method: 'GET',
            url: 'api/',
            async: false,
            success: function(output) {
                // Recieve data in order of set size 1, 4, 6, 7
                // ////console.log(("GETTING THAT DATA");
                // ////console.log((output);
                data = JSON.parse(output)
                relevant_range.forEach(function(val) {
                    x2genes[val] = []
                    x2nofgenes[val] = 0
                    x2nofgenes_under[val] = 0
                })
                // //console.log((x2genes);
                Object.keys(data).forEach(function(gene) {
                    var rounded_value = round_to_n_decimals(parseFloat(data[gene].expr), DECIMALS)
                    // ////console.log((rounded_value, typeof(rounded_value), typeof(data[gene]['expr']));
                    x2nofgenes[parseFloat(rounded_value)] = x2genes[rounded_value].push(gene)
                })

                // //console.log(('typeof', typeof(actual_data));;
                relevant_range.forEach(function(x_value) {
                    // //console.log((x_value);
                    current_number_of_genes += x2nofgenes[x_value]
                    x2nofgenes_under[x_value] = current_number_of_genes
                    actual_data.push({
                        x_value: x_value,
                        expr: x2nofgenes[x_value]
                    })
                })
            }
        })
        // //console.log(('here', data);
        this.gene2expr = data

        // ////console.log(('typeof', typeof(actual_data));
        this.actual_data = actual_data

        this.x2nofgenes = x2nofgenes
        this.x2genes = x2genes
        this.x2nofgenes_under = x2nofgenes_under
        this.nofgenes_total = Object.values(x2nofgenes_under).reduce(function(a, b) {
            return Math.max(a, b)
        })
        this.PERC_DIV = this.nofgenes_total / 100
    }

    set_axes() {
        // ////console.log((this.id_name, 'fdsaf')
        this.set_x()
        this.set_xAxis()
        this.set_y()
        this.set_yAxis()
        this.set_tickAxis()
    }

    set_x() {
        this.x = d3.scaleLinear()
            .range([0, width])
    }

    set_xAxis() {
        this.xAxis = d3.axisBottom(this.x)
            .tickFormat(d3.format('.2'))
            .tickValues(d3.range(0, MAX_X_DOMAIN, X_IV))
    }

    set_tickAxis() {
        this.tickAxis = d3.axisBottom(this.x)
            .tickFormat('')
            .tickSize(4)
            .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
    }

    set_y() {
        this.y = d3.scaleLinear()
            .range([height, 0])
    }

    set_yAxis() {
        this.yAxis = d3.axisLeft().scale(this.y)
            .tickSizeOuter(0)
    }

    set_line() {
        // ////console.log(('hoi', this);
        var x = this.x
        var y = this.y
        var id_name = this.id_name
        this.line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) {
                return x(d.x_value)
            })
            .y(function(d) {
                return y(d.expr)
            })
    }

    set_area() {
        // id_name = this.id_name;
        var this_x = this.x
        var this_y = this.y
        var id_name = this.id_name
        this.area = d3.area()
            .curve(d3.curveBasis)
            .x(function(d) {
                return this_x(d.x_value)
            })
            .y0(height)
            .y1(function(d) {
                return this_y(d.expr)
            })
        // .y1(function(d) { return y(d[`expr`]); });
    }

    set_svg() {
        this.main_svg = d3.select(`#expr_${this.id_name}`)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.bottom + margin.top)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    }

    fill(loaded_data) {
        var id_name = this.id_name //, 'heRE')
        // ////console.log((id_name);
        // id_name = this.id_name;
        var max_expr = d3.max(loaded_data, function(d) {
            return d.expr
        })
        this.yAxis
            .tickValues(d3.range(0, Math.ceil(max_expr / 100) * 100, 100).concat(
                Math.ceil(max_expr / 100) * 100 + 100))

        this.yAxis
            .tickValues(d3.range(0, Math.ceil(max_expr / 100) * 100, 100).concat(
                Math.ceil(max_expr / 100) * 100 + 100))

        this.y.domain([0, max_expr])
        this.x.domain([0, d3.max(loaded_data, function(d) {
            return d.x_value
        })])

        this.main_svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('y', 0)
            .attr('x', '-2.2em')
            .attr('dy', '.35em')
            .attr('transform', 'rotate(270)')
            .style('text-anchor', 'start')

        this.main_svg.append('g')
            .attr('class', 'ticks axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(this.tickAxis)

        // Add vertical gridlines
        this.main_svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(make_x_gridlines(this.x)
                  .tickSize(-height)
                  .tickFormat(''))

        // Add horizontal gridlines
        this.main_svg.append('g')
            .attr('class', 'grid jan')
        // .attr("transform", "translate("+width+",0)")
            .call(make_y_gridlines(this.y, this.yAxis)
                  .tickSize(-width)
                  .tickFormat(''))

        // Add y axis
        this.main_svg.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis)

        // Add area
        this.main_svg.append('path')
            .attr('class', 'area')
            .attr('id', `area_${id_name}`)

        // Add line
        this.main_svg.append('path')
            .attr('class', 'line')
            .attr('id', `line_${id_name}`)
            .attr('d', this.line(loaded_data))

        // .attr("data-legend", function(d) {
        //     return "Gene expression in germ cells"}
        //      )
        // .attr("data-legend-icon", "line");

        // Add title to axis

        this.main_svg.append('text')
            .attr('class', 'ylabel')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .text('Number of genes')

        // Add x-axis and ticks
        this.main_svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('y', 0)
            .attr('x', '-2.2em')
            .attr('dy', '.35em')
            .attr('transform', 'rotate(270)')
            .style('text-anchor', 'start')

        this.main_svg.append('g')
            .attr('class', 'ticks axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(this.tickAxis)

        // Add vertical gridlines
        this.main_svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(make_x_gridlines(this.x)
                  .tickSize(-height)
                  .tickFormat(''))

        // Add horizontal gridlines
        this.main_svg.append('g')
            .attr('class', 'grid jan')
        // .attr("transform", "translate("+width+",0)")
            .call(make_y_gridlines(this.y, this.yAxis)
                  .tickSize(-width)
                  .tickFormat(''))

        // Add y axis
        this.main_svg.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis)

        // Add line
        this.main_svg.append('path')
            .attr('class', 'line')
            .attr('id', `line_${id_name}`)
            .attr('d', this.line(loaded_data))

        // Add title to axis

        this.main_svg.append('text')
            .attr('class', 'ylabel')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .text('Number of genes')

        // Add chart title

        this.main_svg.append('text')
            .attr('x', width / 2)
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
        // .style("text-decoration", "")
            .text('Max. gene expression in selected tissues (log\u2082 scale)')
        // this.line = line;
        // add_brush(this);
    }

    set_brush() {
        var this_id_name = this.id_name
        var this_x = this.x
        var this_y = this.y
        var this_main_svg = this.main_svg
        //  this_data = this.x2nofgenes;
        var this_data = this.actual_data
        // //console.log(("THIS IS ACTUAL", this_data);
        var this_area = this.area
        var this_x2nofgenes = this.x2nofgenes
        var this_x2genes = this.x2genes
        var this_x2nofgenes_under = this.x2nofgenes_under
        var brushResizePath = function(d) {
            // //console.log(("called");
            var e = +(d.type == 'e')
            var x = e ? 1 : -1
            var y = height / 3
            var out = ('M' + (0.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) +
                       ',' + (y + 6) + 'V' + (2 * y - 6) + 'A6,6 0 0 ' + e + ' ' +
                       (0.5 * x) + ',' + (2 * y) + 'Z' + 'M' + (2.5 * x) + ',' + (y + 8) +
                       'V' + (2 * y - 8) + 'M' + (4.5 * x) + ',' + (y + 8) + 'V' +
                       (2 * y - 8) + 'M0,0' + 'l0,' + height)
            // ////console.log((out);
            return out
        }
        this.brushResizePath = brushResizePath
        var this_brushResizePath = this.brushResizePath
        var this_nofgenes_total = this.nofgenes_total
        var this_PERC_DIV = this.PERC_DIV
        this.brush = d3.brushX()
            .extent([
                [0, 0],
                [width, height]
            ])
            .on('brush', function(d) {
                // //console.log(('brushing atm')
                // Set input range values accordingly
                var dom_cur_range = d3.brushSelection(this)
                var cur_range = filter_range(dom_cur_range.map(this_x.invert))

                var dom_min_x = Math.max(Math.min(dom_cur_range[0], dom_cur_range[1]),
                                         0)
                var dom_max_x = Math.min(Math.max(dom_cur_range[0], dom_cur_range[1]),
                                         MAX_X_RANGE)
                var min_x = cur_range[0];
                var // Math.max(Math.min(cur_range[0], cur_range[1]),0),
                max_x = cur_range[1] // Math.min(Math.max(cur_range[0], cur_range[1]),13);
                // //console.log((min_x, max_x);
                if (max_x >= 13) {
                    d3.select(`#max_range_max_${this_id_name}`).attr('crossed-out',
                                                                     'true')
                    d3.select(`#input_max_${this_id_name}`).attr('crossed-out',
                                                                 'true')
                } else {
                    d3.select(`#max_range_max_${this_id_name}`).attr('crossed-out',
                                                                     'false')
                    d3.select(`#input_max_${this_id_name}`).attr('crossed-out',
                                                                 'false')
                    d3.select(`#max_range_max_${this_id_name}`).style('visibility', 'initial')
                }

                var line_node = document.getElementById(`line_${this_id_name}`)

                // Start building array with data points with x_min, x_max as outermost
                // elements, and all other datapoints within x_min and x_max inbetween
                // var templ_str = `expr_${this_id_name}`
                /// here is where it goes wrong !!!
                // var newAreaData = [{x_value: min_x, //perhaps precompute this?
                //                     expr: this_y.invert(findYatXbyBisection(
                //                         dom_min_x,line_node, 0))}],
                var newAreaData = [ // {x_value: min_x, //perhaps precompute this?
                    //  expr: this_y.invert(findYatXbyBisection(
                    //      dom_min_x,line_node, 0))}
                ]
                // Get indices that correspond to indices of data points contained
                // within min and max x values
                var start = Math.ceil(min_x / DATA_IV)
                var end = Math.floor(max_x / DATA_IV) + 1
                // //console.log((dom_min_x, start, end)
                newAreaData = newAreaData.concat(this_data.slice(start, end))
                // Draw new area
                this_main_svg.select('.area')
                    .attr('d', this_area(newAreaData))
                document.getElementById(`input_min_${this_id_name}`).value = format(min_x)
                document.getElementById(`input_max_${this_id_name}`).value = format(max_x)

                // Update number of genes selected
                // ////console.log((this_x2nofgenes)
                var nofgenes_at_x_min = this_x2nofgenes_under[round_to_n_decimals(min_x, DECIMALS)]
                if (isNaN(nofgenes_at_x_min)) {
                    nofgenes_at_x_min = 0
                }
                var nofgenes_at_x_max = this_x2nofgenes_under[
                    round_to_n_decimals(max_x, DECIMALS)]
                if (isNaN(nofgenes_at_x_max)) {
                    nofgenes_at_x_max = this_nofgenes_total
                }
                var nofgenes = (nofgenes_at_x_max -
                                nofgenes_at_x_min)
                // //console.log((nofgenes, max_x, min_x);
                if (!isNaN(nofgenes)) {
                    // Update number of genes selected
                    d3.select(`#nofgenes_${this_id_name}`).text(function() {
                        d3.select(`#percgenes_${this_id_name}`).text(' (' +
                                                                     format(nofgenes /
                                                                            this_PERC_DIV) +
                                                                     '%)')
                        return nofgenes
                    })
                }
                ;

                // ////console.log((d3.selectAll(".handle--custom"));
                // update_brush_handles(d3.selectAll(`.handle--custom-${this_id_name}`));
                update_brush_handles(d3.selectAll(`#handle--custom_${this_id_name}`))
            })
            .on('end', function() {
                // //console.log("END", d3.brushSelection(this))
                var curRange = d3.event.selection
                if (curRange == null) {
                    //console.log('NULL-RANGE')
                    // get values from range inputs in case end is range is not defined
                    curRange = d3.selectAll(`.input_range_${this_id_name}`).nodes().map(function(e) {
                        return round(e.value)
                    })
                    //console.log(curRange)
                    d3.select(`#brush_${this_id_name}`).call(this_brush.move,
                                                             curRange.map(this_x)
                                                            )
                }
                stop_previous_and_update_venn()
                ;

                var current_selection = []
                var x_values = this_x.invert(curRange)
                var min_x_val = Math.ceil(this_x.invert(curRange[0]) / DATA_IV) * DATA_IV
                var max_x_val = Math.floor(this_x.invert(curRange[1]) / DATA_IV) * DATA_IV
                // //console.log(min_x_val, max_x_val)
                range(min_x_val, max_x_val,
                      DATA_IV, DECIMALS).forEach(function(x_val) {
                          // //console.log(x_val, this_x2genes[x_val]);
                          current_selection = current_selection.concat(this_x2genes[x_val])
                          // Array.prototype.push.apply(current_selection, this_x2nofgenes[x_val]);
                      })
                ACTIVE_ID_NAME2CURRENT_SELECTION[this_id_name] = new Set(current_selection)
                // this_current_selection = current_selection;
            })

        var this_brush = this.brush
        this.brush_node = this.main_svg.append('g')
            .attr('class', 'brush')
            .attr('id', `brush_${this_id_name}`)
            .call(this_brush)

        this.brush_handle = this.brush_node.selectAll('.handle--custom')
            .data([{
                type: 'w'
            }, {
                type: 'e'
            }])
            .enter().append('path')
            .attr('class', 'handle--custom')
            .attr('id', `handle--custom_${this_id_name}`)
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr('stroke', '#000')
            .attr('cursor', 'ew-resize')
            .attr('d', brushResizePath)

        this.brush_node
            .call(this_brush.move, [6.2, MAX_X_DOMAIN].map(this_x))
            .selectAll('.overlay')
            .on('mousedown touchstart', function() { // if click outside of
                // cur sel, re-set current selection to prevent deselection
                d3.event.stopImmediatePropagation()
                d3.select(this.parentNode).transition().call(
                    this_brush.move, d3.brushSelection(this.parentNode))
            })
    }
}

var vennDiv = d3.select('#venn')
        .attr('width', vennWidth + vennMargin.left + vennMargin.right)
        .attr('height', vennHeight + vennMargin.bottom, vennMargin.top)

function init_venn () {
    var vennDiv = d3.select('#venn')
        .attr('width', vennWidth + vennMargin.left + vennMargin.right)
        .attr('height', vennHeight + vennMargin.bottom, vennMargin.top);
    // vennChart = venn.VennDiagram(setSizeAbbrevs);

    // vennDiv.datum(sets).call(vennChart);
    // vennDiv.datum(newsets).call(venn.VennDiagram(setSizeAbbrevs))

    stop_previous_and_update_venn();
}
init_venn()

var histo_object_checking = add_histo('checking')
var histo_object_checking = add_histo('tcgan')
var histo_object_gtex = add_histo('gte')
var histo_object_gtex = add_histo('jan')
stop_previous_and_update_venn()


// looks at ACTIVE_ID_NAME2CURRENT_SELECTION to update venn diagram


function add_histo(id_name) {
    // yaad kun jij dit miss even properly doen?
    var chartwrapper = $('#chartwrapper')
    chartwrapper.append(`<div id="div_chart_${id_name}" class="chart_div">
          <svg class="chart" id="expr_${id_name}"></svg>
          <div class="chart_status">
            <p>Selected
              <span class="nofgenes" id="nofgenes_${id_name}">13468</span>
              <span class="percgenes" id="percgenes_${id_name}">(89.14%)</span>

              genes whose max. expression in tumors is above <input class="input_range_${id_name}" id="input_min_${id_name}" type="number" step="0.01" min="0" max="13">&nbsp;</p><p id="max_range_max_${id_name}">and below <input class="input_range_${id_name}" id="input_max_${id_name}" type="number" step="0.01" min="0" max="13"></p>
          </div>
        </div>`)
    CHARTS_to_be_made.push(id_name)
    var out = new histo(id_name)
    CHARTS.push(out)
    return out
}


// sets is is an array with objects, each object has a sets and size attribute
// see example:
// const setSizeAbbrevs = {'a' : 2, // size of 'a' circle
//                         'b': 2, // size of 'b' cirlce
//                         'a,b': 1, // size of a AND b intersection circle
//                        }
// var sets = [
//     // Variable
//     {sets: ['a'], size: 2},
//     {sets: ['b'], size: 2},
//     {sets: [['a'],['b']], size: 1},
// ]

// uses global CHARTS variable to determine relevant set info
function getCombinations(array) { var result = [];
                                  var f = function(prefix=[], array)
                                  { for (var i = 0; i < array.length; i++)
                                    {
                                        result.push([...prefix,array[i]]);
                                        f([...prefix,array[i]], array.slice(i + 1));
                                    } }
                                  f([], array);
                                  return result;
                                }


function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


function set_intersection_arbitrary(sets) {
    // //console.log(sets);
    var smallest_set = sets.reduce(function(s0, s1) {if (s0.size < s1.size) { return s0 } else { return s1} })
    return new Set( [...smallest_set].filter(function(x) {
        for (var i = 0; i < sets.length; ++i ) {
            if (sets[i].has(x))
            {continue}
            else {
                return false;
            }}
            return true
    }))
}


function set_intersection_binary(A, B) {

    return new Set( [...A].filter(x => B.has(x)));
}

function get_set_info() {
    var id_names = Object.keys(ACTIVE_ID_NAME2CURRENT_SELECTION);
    if (id_names.length == 0) {
        return
    }
    var set_combinations = getCombinations(id_names);
    //console.log(set_combinations)
    previous_comb = set_combinations[0]
    previous_intersection = ACTIVE_ID_NAME2CURRENT_SELECTION[previous_comb[0]] // assuming first combination is always singleton
    var sets = new Array;
    var setSizeAbbrevs = new Object;
    //console.log(previous_intersection)
    // var previous_intersection = new Set;
    var new_intersection;
    for (var i = 0; i < set_combinations.length; ++i) {
        var this_comb = set_combinations[i];
        //console.log(i, this_comb)
        if (arraysEqual(this_comb.slice(0,previous_comb.length), previous_comb)) {
            //console.log('this route')
            var new_id_name = this_comb[this_comb.length-1];
            var new_set = ACTIVE_ID_NAME2CURRENT_SELECTION[new_id_name];
            new_intersection = set_intersection_binary(previous_intersection, new_set);
        } else {
            var sets_this_comb = this_comb.map(function(id_name) { return ACTIVE_ID_NAME2CURRENT_SELECTION[id_name]
                                                                 });
            new_intersection = set_intersection_arbitrary(sets_this_comb);
        }
        //console.log(this_comb.join(','))
        //console.log('new intersection', new_intersection)
        setSizeAbbrevs[this_comb.join(',')] = new_intersection.size;
        sets.push({size: new_intersection.size, 'sets': this_comb})
        previous_comb = this_comb;
        previous_intersectoin = new_intersection;

    }
    //console.log(setSizeAbbrevs, sets)
    return [setSizeAbbrevs, sets];
}
function update_venn() {
    if (CHARTS_to_be_made.length != CHARTS.length){
        //console.log('not updaing yet')
        return;
    };
    var sets_data = get_set_info(CHARTS);
    //console.log(sets_data)
    if (sets_data == null) {
        return
    }

    var setSizeAbbrevs =  sets_data[0], sets = sets_data[1];
    vennChart = venn.VennDiagram(setSizeAbbrevs);
    vennDiv.datum(sets).call(vennChart);

    // vennDiv.datum(newsets).call(venn.VennDiagram(setSizeAbbrevs))
}
var timeout =  setTimeout(update_venn, 1000);
function stop_previous_and_update_venn() {
    clearTimeout(timeout);
    console.log("CLEARING")
    update_venn();
}
