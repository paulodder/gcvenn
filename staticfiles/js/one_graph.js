// const $ = require('jquery')
// const d3 = require('d3')
// Hardcode first setting of checkConds to prevent initialization errors
window.sessionStorage.setItem('checkConds', '1.6,13--0,1.8--6.2,13');
PERC_DIV = 15064/100
console.log("HERE")
//Fix empty selection upon
IV = 0.01;
MAX_X_RANGE = 650;
MAX_X_DOMAIN = 13;
DATA_IV = 0.2;
X_IV = 0.4;

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[parseFloat(key)]; var y = b[parseFloat(key)];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
function round_to_n_decimals(n, decimals) {
    var multi = 10**decimals;
    return Math.round(n*multi)/multi;
}


function range(min, max, step, decimal) {
    var arr = [], cur = min, current_mult = min/step;
    arr.push(min)
  while (true) {
      arr.push(round_to_n_decimals(((current_mult += 1) * step), decimal));
      if ((current_mult * step) >= max)  {
          break
      }
  }
  return arr;
}

function update_brush_handles(brush_handle_node) {
        var s = d3.event.selection;
        s[0] = Math.max(s[0], 0);
        s[1] = Math.min(s[1], MAX_X_RANGE);
        brush_handle_node
            .attr("display", null)
            .attr("transform", function(d, i) {
                return "translate(" + s[i] + "," + 0 + ")";
            });
    }
// Given range (or extent) of brush, returns limited range to prevent values
// out-of-range to be registered, e.g. [1.6, 10]
function filter_range(aloi) {
    aloi.sort(function(a, b) {
        return a-b;})
    aloi[0] = Math.max(0, aloi[0]);
    aloi[1] = Math.min(MAX_X_DOMAIN, aloi[1]);
    if (aloi[0] == aloi[1]) {
        if (aloi[1] == MAX_X_DOMAIN) {
            aloi[0] -= IV;
        } else {
            aloi[1] += IV; // Increment max range to prevent non-existent
        }
    }
    return aloi;
}
var findYatXbyBisection = function(x, path, error){
    var length_end = path.getTotalLength()
    , length_start = 0
    , point = path.getPointAtLength((length_end + length_start) / 2) // get the middle point
    , bisection_iterations_max = 50
    , bisection_iterations = 0

    error = error || 0.01

    while (x < point.x - error || x > point.x + error) {
        // get the middle point
        point = path.getPointAtLength((length_end + length_start) / 2)

        if (x < point.x) {
            length_end = (length_start + length_end)/2
        } else {
            length_start = (length_start + length_end)/2
        }

        // Increase iteration
        if(bisection_iterations_max < ++ bisection_iterations)
            break;
    }
    return point.y
};

function round(n) {
    return Math.round(n/IV)*IV;
}

function format(n) {
    // Use to access data from tsv files
    return parseFloat(Math.round(n/IV)*IV).toFixed(2)
}
console.log("U")
function default_type(d) {
    Object.keys(d).forEach(function(key) {
        if ((key == "#H:hugo") || (key == "probeset")) {
        } else
            d[k] = +d[k]
    // console.log(key, d[0][key]);
    });
}

function max_metric(arr) {
    arr.reduce(function(a, b) { return Math.max(a,b)}
              )
}

function compute_metric(fname, metric) {
    var out = {};
    d3.tsv(fname, default_type, function(data) {
        data.forEach(function(d) {
            out[d.probeset] = metric(Object.values(d).filter(function(x) { typeof x == 'number'}))
        })
    })
    return out
}




// Initialize hashtable that for each value reports number of genes with jan_expr
// below that value
function Ftype_max(d) {
    d.nofgenes_jan = +d.nofgenes_jan;
    d.nofgenes_gte = +d.nofgenes_gte;
    d.nofgenes_tcgan = +d.nofgenes_tcgan;

    d.interval = d.interval;
    return d;
}

// Read tsv and load dictionaries that map expression value to number of genes
// with less than or equal expression values (easily compute number of genes
// selected by doing F(expr_max) - F(expr_min)
F_jan_max= {};
F_gte_max = {};
F_tcgan_max = {};
d3.tsv("/static/cumulative_max.txt", Ftype_max, function(error, cumul_data) {
    cumul_data.forEach(function(d) {
        F_jan_max[d.interval] = d.nofgenes_jan;
        F_gte_max[d.interval] = d.nofgenes_gte;
        F_tcgan_max[d.interval] = d.nofgenes_tcgan;
    })
})






// GRAPHS-----------------------------------------------------------------------
// Start drawing of graphs
var margin = {top: 30, left: 50, right: 50, bottom: 50}
// var margin = {top: 20, left: 33, right: 33, bottom: 33}
var width = 750 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;


function make_x() {
    return d3.scaleLinear()
    .range([0, width]);
}
var x = d3.scaleLinear()
    .range([0, width]);

// Set y-scales for specific graphs (ranges are same for all)

function make_xAxis(x) {
    return d3.axisBottom(x)
    .tickFormat(d3.format(".2"))
    .tickValues(d3.range(0, MAX_X_DOMAIN, X_IV))
}

// Define axes Possibly make 2 axis, one for right number of ticks and one for
// right value display
var xAxis = d3.axisBottom(x)
    .tickFormat(d3.format(".2"))
    .tickValues(d3.range(0, MAX_X_DOMAIN, X_IV))


function make_tickAxis(x) {
    return d3.axisBottom(x)
        .tickFormat("")
        .tickSize(4)
        .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
}

var tickAxis = d3.axisBottom(x)
    .tickFormat("")
    .tickSize(4)
    .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))

function make_x_gridlines(x) {
    return d3.axisBottom(x)
        .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
        .tickSizeOuter(0);
}

function make_y_gridlines(scale, yaxis) {
    return d3.axisLeft(scale)
        .tickValues(yaxis.tickValues());
}


// var brushResizePath = function(d) {
//     console.log('called');
//     var e = +(d.type == "e"),
//         x = e ? 1: - 1,
//         y = height / 3;
//     return ("M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) +
//             "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " +
//             (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8)
//             + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" +
//             (2 * y - 8) + "M0,0" +"l0," + height);
// };


// grabs svg element based on id name and initialize
function select_svg(id_name) {
    return d3.select(`#expr_${id_name}`)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

    // d3.select('#expr_tcgan')
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.bottom + margin.top)
    // .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function make_y() {
    return d3.scaleLinear()
    .range([height, 0]);
}
var y_tcgan = d3.scaleLinear()
    .range([height, 0]);

function make_yAxis(y) {
    return d3.axisLeft().scale(y)
        .tickSizeOuter(0);
}
var yAxis_tcgan = d3.axisLeft().scale(y_tcgan)
    .tickSizeOuter(0);

function make_line(id_name) {
    return d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.x_value); })
        .y(function(d) { return y_tcgan(d[`expr`]); });

}
function make_area(id_name) {
    return d3.area()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.x_value); })
        .y0(height)
        .y1(function(d) { return y_tcgan(d[`expr`]); });

}

var line_tcgan = make_line('tcgan');
var line_gte = make_line('gte');

var area_tcgan = make_area('tcgan')
var area_gte = make_area('gte')

// requires div with id #expr_{id_name} to be present to be present


class histo {
    constructor(id_name, data) {
        this.id_name = id_name;
        var relevant_data = []
        var current_n = 0;
        this.set_data(data) // set data-related attributes
        // sortByKey(data, 'x_value').forEach( function(d, index) {
        //     // data[d.interval] = {}
        //     // data[index]['expr'] = d[`expr_${id_name}`];
        //     current_n += d[`expr_${id_name}`]

        // }
        //             )
        // this.data = data;
        // this.set_relevant_data();
        // this.set_x2nofgenes(data);
        this.set_axes();
        // this.set_line(id_name, this.x, this.y);
        this.set_line();
        // this.set_area(id_name, this.x, this.y)
        this.set_area()
        this.set_svg()
        this.fill(this.x2nofgenes)
        this.set_brush()
        this.set_input_range_listener()

    }
    set_input_range_listener() {
        var this_id_name = this.id_name,
            this_brush = this.brush,
            this_x = this.x
        d3.selectAll(`.input_range_${this_id_name}`).on("change", function() {
            var newRange = d3.selectAll(`.input_range_${this_id_name}`).nodes().map(
                function (e) {
                    return round(e.value);
                });
            newRange = filter_range(newRange);
            newRange.map(this_x).sort(
                function(a, b) { return a-b;});
            d3.select(`#brush_${this_id_name}`).call(this_brush.move,
                                                     newRange.map(this_x).sort(
                                                         function(a, b) { return a-b;}))
        })
    }
    set_data(data) {
        var x2nofgenes = [];
        var x2nofgenes_under = {};
        var id_name = this.id_name
        var cur = 0;
        sortByKey(data, 'x_value').forEach(function(d) {
            var nofgenes = d[`expr_${id_name}`]
            // console.log(nofgenes)
            x2nofgenes.push({x_value: d.x_value, expr: nofgenes});
            x2nofgenes_under[format(d.x_value)] = (cur += nofgenes);
        }
                                          )
        // console.log(x2nofgenes)
        this.x2nofgenes = x2nofgenes;
        this.x2nofgenes_under = x2nofgenes_under;
    }
    set_axes() {
        // console.log(this.id_name, 'fdsaf')
        this.set_x();
        this.set_xAxis();
        this.set_y()
        this.set_yAxis()
        this.set_tickAxis();
    }
    set_x() {
        this.x = d3.scaleLinear()
            .range([0, width])
    }
    set_xAxis = () => {
        this.xAxis = d3.axisBottom(this.x)
            .tickFormat(d3.format(".2"))
            .tickValues(d3.range(0, MAX_X_DOMAIN, X_IV))
    }
    set_tickAxis = () => {
        this.tickAxis = d3.axisBottom(this.x)
        .tickFormat("")
        .tickSize(4)
        .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
    }
    set_y() {
        this.y = d3.scaleLinear()
            .range([height, 0]);

    }
    set_yAxis = () => {
        this.yAxis = d3.axisLeft().scale(this.y)
            .tickSizeOuter(0);
    }
    set_line =() =>{
        // console.log('hoi', this);
        var x= this.x;
        var y= this.y;
        var id_name = this.id_name;
        this.line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d.x_value); })
            .y(function(d) { return y(d[`expr`]); });
    }
    // set_relevant_data = () => {

    // set_line(id_name, x, y) {
    //     // console.log('hoi', this);
    //     this.line = d3.line()
    //         .curve(d3.curveBasis)
    //         .x(function(d) { return x(d.x_value); })
    //         .y(function(d) { return y(d[`expr_${id_name}`]); });
    // }
    // set_area(id_name, x, y) {
    //     // id_name = this.id_name;
    //     this.area = d3.area()
    //     .curve(d3.curveBasis)
    //     .x(function(d) { return x(d.x_value); })
    //     .y0(height)
    //     .y1(function(d) { return y(d[`expr_${id_name}`]); });

    // }
    set_area = () => {
        // id_name = this.id_name;
        var x = this.x;
        var y = this.y;
        var id_name = this.id_name;
        this.area = d3.area()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d.x_value); })
            .y0(height)
            .y1(function(d) { return y(d[`expr`]); });
            // .y1(function(d) { return y(d[`expr`]); });

    }
    set_svg() {
    this.main_svg = d3.select(`#expr_${this.id_name}`)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }
    fill = (loaded_data) => {
        var id_name = this.id_name;//, 'heRE')
        // console.log(id_name);
        // id_name = this.id_name;
        var max_expr = d3.max(loaded_data, function(d) {return d[`expr`]; })
        this.yAxis
            .tickValues(d3.range(0, Math.ceil(max_expr/100)*100, 100).concat(
                Math.ceil(max_expr/100)*100 + 100))

        this.yAxis
            .tickValues(d3.range(0, Math.ceil(max_expr/100)*100, 100).concat(
                Math.ceil(max_expr/100)*100 + 100))

        this.y.domain([0, max_expr]);
        this.x.domain([0, d3.max(loaded_data, function(d) {return d.x_value; })]);

        this.main_svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height+ ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", "-2.2em")
            .attr("dy", ".35em")
            .attr("transform", "rotate(270)")
            .style("text-anchor", "start");

        this.main_svg.append("g")
            .attr("class", "ticks axis")
            .attr("transform", "translate(0," + height + ")")
            .call(this.tickAxis)


        // Add vertical gridlines
        this.main_svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.x)
                  .tickSize(-height)
                  .tickFormat(""));

        // Add horizontal gridlines
        this.main_svg.append("g")
            .attr("class", "grid jan")
        // .attr("transform", "translate("+width+",0)")
            .call(make_y_gridlines(this.y, this.yAxis)
                  .tickSize(-width)
                  .tickFormat(""))

        // Add y axis
        this.main_svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);

        // Add area
        this.main_svg.append("path")
            .attr("class", "area")
            .attr("id", `area_${id_name}`)


        // Add line
        this.main_svg.append("path")
            .attr("class", "line")
            .attr("id", `line_${id_name}`)
            .attr("d", this.line(loaded_data))

        // .attr("data-legend", function(d) {
        //     return "Gene expression in germ cells"}
        //      )
        // .attr("data-legend-icon", "line");

        // Add title to axis

        this.main_svg.append("text")
            .attr("class", "ylabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .text("Number of genes")


        // Add x-axis and ticks
        this.main_svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height+ ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", "-2.2em")
            .attr("dy", ".35em")
            .attr("transform", "rotate(270)")
            .style("text-anchor", "start");

        this.main_svg.append("g")
            .attr("class", "ticks axis")
            .attr("transform", "translate(0," + height + ")")
            .call(this.tickAxis)


        // Add vertical gridlines
        this.main_svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.x)
                  .tickSize(-height)
                  .tickFormat(""));

        // Add horizontal gridlines
        this.main_svg.append("g")
            .attr("class", "grid jan")
        // .attr("transform", "translate("+width+",0)")
            .call(make_y_gridlines(this.y, this.yAxis)
                  .tickSize(-width)
                  .tickFormat(""))

        // Add y axis
        this.main_svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);


        // Add line
        this.main_svg.append("path")
            .attr("class", "line")
            .attr("id", `line_${id_name}`)
            .attr("d", this.line(loaded_data))

        // Add title to axis

        this.main_svg.append("text")
            .attr("class", "ylabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .text("Number of genes")



        // Add chart title

        this.main_svg.append("text")
            .attr("x", width/2)
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
        // .style("text-decoration", "")
            .text("Max. gene expression in selected tissues (log\u2082 scale)")
        // this.line = line;
        // add_brush(this);


    }

    set_brush = () => {
        var this_id_name = this.id_name;
        var this_x = this.x;
        var this_y = this.y;
        var this_main_svg = this.main_svg;
        var this_data = this.x2nofgenes;
        var this_area = this.area;
        var this_x2nofgenes = this.x2nofgenes;
        var this_x2nofgenes_under = this.x2nofgenes_under;
        var brushResizePath = function(d) {
            console.log("called")

            var e = +(d.type == "e"),
                x = e ? 1: - 1,
                y = height / 3;
            var out = ("M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) +
                "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " +
                (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" +
                       (2 * y - 8) + "M0,0" +"l0," + height);
            // console.log(out);
            return out;
        }
        this.brushResizePath = brushResizePath;
        var this_brushResizePath = this.brushResizePath;
        this.brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("brush", function(d) {
                // Set input range values accordingly
                var dom_cur_range = d3.brushSelection(this),
                    cur_range = filter_range(dom_cur_range.map(this_x.invert)),

                    dom_min_x = Math.max(Math.min(dom_cur_range[0], dom_cur_range[1]),
                                         0),
                    dom_max_x = Math.min(Math.max(dom_cur_range[0], dom_cur_range[1]),
                                         MAX_X_RANGE),
                    min_x = cur_range[0],//Math.max(Math.min(cur_range[0], cur_range[1]),0),
                    max_x = cur_range[1];//Math.min(Math.max(cur_range[0], cur_range[1]),13);
                if (max_x >= 13) {

                    d3.select(`#max_range_max_${this_id_name}`).attr("crossed-out",
                                                                "true");
                    d3.select(`#input_max_${this_id_name}`).attr("crossed-out",
                                                            "true");

                } else {

                    d3.select(`#max_range_max_${id_name}`).attr("crossed-out",
                                                                "false");
                    d3.select(`#input_max_${id_name}`).attr("crossed-out",
                                                            "false");
                    d3.select(`#max_range_max_${id_name}`).style("visibility", "initial");
                }

                var line_node = document.getElementById(`line_${this_id_name}`);

                // Start building array with data points with x_min, x_max as outermost
                // elements, and all other datapoints within x_min and x_max inbetween
                // var templ_str = `expr_${this_id_name}`
                /// here is where it goes wrong !!!
                var newAreaData = [{x_value: min_x, //perhaps precompute this?
                                    expr: this_y.invert(findYatXbyBisection(
                                        dom_min_x,line_node, 0))}],
                    // Get indices that correspond to indices of data points contained
                    // within min and max x values
                    start = Math.ceil(min_x/DATA_IV),
                    end = Math.floor(max_x/DATA_IV) + 1;
                // console.log(dom_min_x)
                newAreaData = newAreaData.concat(this_data.slice(start, end))
                newAreaData = newAreaData.concat({x_value: max_x,
                                                  expr: this_y.invert(findYatXbyBisection(
                                                      dom_max_x,line_node, 0))})
                // console.log(newAreaData)

                // Draw new area
                // this.main_svg.select(".area")
                this_main_svg.select(".area")
                    .attr("d", this_area(newAreaData))


                document.getElementById(`input_min_${this_id_name}`).value = format(min_x);
                document.getElementById(`input_max_${this_id_name}`).value = format(max_x);

                // Update number of genes selected
                // console.log(this_x2nofgenes)
                var nofgenes = (this_x2nofgenes_under[format(max_x)]
                            - this_x2nofgenes_under[format(min_x)])
                if (!isNaN(nofgenes)) {
                    // Update number of genes selected
                    d3.select(`#nofgenes_${this_id_name}`).text(function() {
                        d3.select(`#percgenes_${this_id_name}`).text( ' (' +
                                                            format(nofgenes/
                                                                   PERC_DIV)
                                                            + '%)');
                        return nofgenes;
                    })};

                // console.log(d3.selectAll(".handle--custom"));
                // update_brush_handles(d3.selectAll(`.handle--custom-${this_id_name}`));
                update_brush_handles(d3.selectAll(`#handle--custom_${this_id_name}`));



            })
            .on("end", function () {
                var curRange = d3.event.selection;
                if (curRange == null) {
                    // get values from range inputs in case end is range is not defined
                    curRange = d3.selectAll(`.input_range_${this_id_name}`).nodes().map(
                        function(e) {
                            return round(e.value); });
                    d3.select(`#brush_${this_id_name}`).call(this_brush.move,
                                                   curRange.map(this.x)
                                                  )};
            })
        var this_brush = this.brush;
        this.brush_node = this.main_svg.append("g")
        .attr("class", "brush")
            .attr("id", `brush_${this_id_name}`)
            .call(this_brush);

        this.brush_handle = this.brush_node.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("id", `handle--custom_${this_id_name}`)
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("stroke", "#000")
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath)



        this.brush_node
            .call(this_brush.move, [6.2, MAX_X_DOMAIN].map(this_x))
            .selectAll(".overlay")
            .on("mousedown touchstart", function() { // if click outside of
                // cur sel, re-set current selection to prevent deselection
            d3.event.stopImmediatePropagation();
            d3.select(this.parentNode).transition().call(
                this_brush.move, d3.brushSelection(this.parentNode))});


    }


}

// histo.prototype.set_line = function(// x, y
//                                    ) {
//         this.line = d3.line()
//             .curve(d3.curveBasis)
//             .x(function(d) { return this.x(d.x_value); })
//             .y(function(d) { return this.y(d[`expr_${this.id_name}`]); });
//     }

function init_histo_object(id_name) {
    // var out = new Object();
    out.id_name = id_name;
    out.y = y_tcgan; //make_y()
    out.x = make_x();;// make_x()
    out.yAxis = yAxis_tcgan;//make_yAxis(out.y)
    out.xAxis = make_xAxis(out.x)
    out.tickAxis = make_tickAxis(out.x)
    out.main_svg = select_svg(id_name);
    out.line = make_line(id_name);
    out.area = make_area(id_name);
    return out
}


// var histo_object_tcgan = init_histo_object('tcgan')
// histo_object_tcgan = new ('tcgan')


// svg_tcgan = histo_object_tcgan.main_svg
// function add_brush(histo_object, loaded_data) {


function add_brush(histo_object) {
    main_svg = histo_object.main_svg;
    data = histo_object.data;


}

// sets histo
// function fill_histo(histo_object, loaded_data) {
//     // histo_object_tcgan = new histo('tcgan', loaded_data)
//     histo_object.data = loaded_data;

//     id_name = histo_object.id_name;
//     histo_svg = histo_object.main_svg;
//     line = histo_object.line;

//     max_expr = d3.max(loaded_data, function(d) {return d[`expr_${id_name}`]; })
//     histo_object.yAxis
//         .tickValues(d3.range(0, Math.ceil(max_expr/100)*100, 100).concat(
//             Math.ceil(max_expr/100)*100 + 100))

//     histo_object.y.domain([0, max_expr]);
//     histo_object.x.domain([0, d3.max(loaded_data, function(d) {return d.x_value; })]);

//     histo_svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height+ ")")
//         .call(histo_object.xAxis)
//         .selectAll("text")
//         .attr("y", 0)
//         .attr("x", "-2.2em")
//         .attr("dy", ".35em")
//         .attr("transform", "rotate(270)")
//         .style("text-anchor", "start");

//     histo_svg.append("g")
//         .attr("class", "ticks axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(histo_object.tickAxis)


//     // Add vertical gridlines
//     histo_svg.append("g")
//         .attr("class", "grid")
//         .attr("transform", "translate(0," + height + ")")
//         .call(make_x_gridlines(histo_object.x)
//               .tickSize(-height)
//               .tickFormat(""));

//     // Add horizontal gridlines
//     histo_svg.append("g")
//         .attr("class", "grid jan")
//     // .attr("transform", "translate("+width+",0)")
//         .call(make_y_gridlines(histo_object.y, histo_object.yAxis)
//               .tickSize(-width)
//               .tickFormat(""))

//     // Add y axis
//     histo_svg.append("g")
//         .attr("class", "y axis")
//         .call(histo_object.yAxis);

//     // Add area
//     histo_svg.append("path")
//         .attr("class", "area")
//         .attr("id", `area_${id_name}`)


//     // Add line
//     histo_svg.append("path")
//         .attr("class", "line")
//         .attr("id", `line_${id_name}`)
//         .attr("d", histo_object.line(loaded_data))

//     // .attr("data-legend", function(d) {
//     //     return "Gene expression in germ cells"}
//     //      )
//     // .attr("data-legend-icon", "line");

//     // Add title to axis

//     histo_svg.append("text")
//         .attr("class", "ylabel")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - margin.left)
//         .attr("x", 0 - (height / 2))
//         .attr("dy", "1em")
//         .text("Number of genes")


//     // Add x-axis and ticks
//     histo_svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + height+ ")")
//         .call(histo_object.xAxis)
//         .selectAll("text")
//         .attr("y", 0)
//         .attr("x", "-2.2em")
//         .attr("dy", ".35em")
//         .attr("transform", "rotate(270)")
//         .style("text-anchor", "start");

//     histo_svg.append("g")
//         .attr("class", "ticks axis")
//         .attr("transform", "translate(0," + height + ")")
//         .call(histo_object.tickAxis)


//     // Add vertical gridlines
//     histo_svg.append("g")
//         .attr("class", "grid")
//         .attr("transform", "translate(0," + height + ")")
//         .call(make_x_gridlines(histo_object.x)
//               .tickSize(-height)
//               .tickFormat(""));

//     // Add horizontal gridlines
//     histo_svg.append("g")
//         .attr("class", "grid jan")
//     // .attr("transform", "translate("+width+",0)")
//         .call(make_y_gridlines(histo_object.y, histo_object.yAxis)
//               .tickSize(-width)
//               .tickFormat(""))

//     // Add y axis
//     histo_svg.append("g")
//         .attr("class", "y axis")
//         .call(histo_object.yAxis);


//     // Add line
//     histo_svg.append("path")
//         .attr("class", "line")
//         .attr("id", `line_${id_name}`)
//         .attr("d", histo_object.line(loaded_data))

//     // Add title to axis

//     histo_svg.append("text")
//         .attr("class", "ylabel")
//         .attr("text-anchor", "middle")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - margin.left)
//         .attr("x", 0 - (height / 2))
//         .attr("dy", "1em")
//         .text("Number of genes")



//     // Add chart title

//     histo_svg.append("text")
//         .attr("x", width/2)
//         .attr("y", 0 - (margin.top / 2))
//         .attr("text-anchor", "middle")
//         .style("font-size", "16px")
//     // .style("text-decoration", "")
//         .text("Max. gene expression in selected tissues (log\u2082 scale)")
//     // histo_object.line = line;
//     // add_brush(histo_object);
// }



d3.tsv('static/js/expr_02.tsv', type, function(error, data_raw) {
// d3.tsv(expr_tsv_path, type, function(error, data_chart) {
    // Set domain of x-scale (invariant to all graphs)
    // do some logic on data_raw to
    histo_object_tcgan = new  histo('tcgan', data_raw)
    histo_object_gte = new  histo('gte', data_raw)
    console.log('here');
    data_chart = data_raw;
    loaded_data = data_raw;

    // line_tcgan_data = line_tcgan(data_chart);
    // fill_histo(histo_object_tcgan, data_chart)
    // add_brush(histo_object_tcgan)
    // fill_histo(init_histo_object('gte'), data_chart)
    // Add brushes

            // update_venn()
    // });
    histo_object = histo_object_tcgan;
    id_name = 'tcgan';
    brush_tcgan = histo_object.brush;
    // brush_tcgan = d3.brushX()
    //     .extent([[0, 0], [width, height]])
    //     .on("brush", function(d) {
    //         // Set input range values accordingly
    //         var dom_cur_range = d3.brushSelection(this),
    //             cur_range = filter_range(dom_cur_range.map(histo_object.x.invert)),

    //             dom_min_x = Math.max(Math.min(dom_cur_range[0], dom_cur_range[1]),
    //                                  0),
    //             dom_max_x = Math.min(Math.max(dom_cur_range[0], dom_cur_range[1]),
    //                                  MAX_X_RANGE),
    //             min_x = cur_range[0],//Math.max(Math.min(cur_range[0], cur_range[1]),0),
    //             max_x = cur_range[1];//Math.min(Math.max(cur_range[0], cur_range[1]),13);
    //         console.log(dom_min_x, dom_max_x);
    //         if (max_x >= 13) {

    //             d3.select(`#max_range_max_${id_name}`).attr("crossed-out",
    //                                                    "true");
    //             d3.select(`#input_max_${id_name}`).attr("crossed-out",
    //                                                "true");

    //         } else {

    //             d3.select(`#max_range_max_${id_name}`).attr("crossed-out",
    //                                                    "false");
    //             d3.select(`#input_max_${id_name}`).attr("crossed-out",
    //                                                "false");
    //             d3.select(`#max_range_max_${id_name}`).style("visibility", "initial");
    //         }

    //         line_tcgan_node = document.getElementById(`line_${id_name}`);

    //         // Start building array with data points with x_min, x_max as outermost
    //         // elements, and all other datapoints within x_min and x_max inbetween
    //         var newAreaData = [{x_value: min_x,
    //                             expr_tcgan: histo_object.y.invert(findYatXbyBisection(
    //                                 dom_min_x,line_tcgan_node, 0))}],
    //             // Get indices that correspond to indices of data points contained
    //             // within min and max x values
    //             start = Math.ceil(min_x/DATA_IV),
    //             end = Math.floor(max_x/DATA_IV) + 1;
    //         newAreaData = newAreaData.concat(histo_object.data.slice(start, end))
    //         newAreaData = newAreaData.concat({x_value: max_x,
    //                                           expr_tcgan: histo_object.y.invert(findYatXbyBisection(
    //                                               dom_max_x,line_tcgan_node, 0))})

    //         // Draw new area
    //         // histo_object.main_svg.select(".area")
    //         histo_object.main_svg.select(".area")
    //             .attr("d", histo_object.area(newAreaData))


    //         document.getElementById('input_min_tcgan').value = format(min_x);
    //         document.getElementById('input_max_tcgan').value = format(max_x);

    //         // Update number of genes selected
    //         nofgenes = (F_tcgan_max[format(max_x)]
    //                     - F_tcgan_max[format(min_x)])
    //         if (!isNaN(nofgenes)) {
    //             // Update number of genes selected
    //             d3.select("#nofgenes_tcgan").text(function() {
    //                 d3.select("#percgenes_tcgan").text( ' (' +
    //                                                   format(nofgenes/
    //                                                          PERC_DIV)
    //                                                   + '%)');
    //                 return nofgenes;
    //             })};


    //         update_brush_handles_tcgan();



    //     })
    //     .on("end", function () {
    //         var curRange = d3.event.selection;
    //         if (curRange == null) {
    //             // get values from range inputs in case end is range is not defined
    //             curRange = d3.selectAll(".input_range_tcgan").nodes().map(
    //                 function(e) {
    //                     return round(e.value); });
    //             d3.select("#brush_tcgan").call(brush_tcgan.move,
    //                                            curRange.map(histo_object.x)
    //                                           )};
    //     })





    // Append brush to chart_tcgan
    // brush_node_tcgan = histo_object.main_svg.append("g")
    //     .attr("class", "brush")
    //     .attr("id", "brush_tcgan")
    //     .call(brush_tcgan);

    // brush_handle_tcgan = brush_node_tcgan.selectAll(".handle--custom")
    //     .data([{type: "w"}, {type: "e"}])
    //     .enter().append("path")
    //     .attr("class", "handle--custom")
    // // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .attr("stroke", "#000")
    //     .attr("cursor", "ew-resize")
    //     .attr("d", brushResizePath)



    // brush_node_tcgan
    //     .call(brush_tcgan.move, [6.2, MAX_X_DOMAIN].map(histo_object.x))
    //     .selectAll(".overlay")
    //     .on("mousedown touchstart", function() { // if click outside of
    //         // cur sel, re-set current selection to prevent deselection
    //         d3.event.stopImmediatePropagation();
    //         d3.select(this.parentNode).transition().call(
    //             brush_tcgan.move, d3.brushSelection(this.parentNode))});


    // Gets range or takes previous range (which is still in stored in localstorage
    // in case user clikced outside of brush and "deselected"
    function get_or_retrieve_range(brush_id) {
        try {
            var vals = filter_range(d3.brushSelection(
                d3.select(brush_id).node()).map(
                    histo_object.x.invert).map(round));
        } catch(ReferenceError){ // In case current brush seleciton = 0
            prev_conds = window.sessionStorage.getItem('checkConds').split('--');
            // Take comma-separated range that was most recently registered
            if (brush_id.endsWith('jan')) {
                var str_vals = prev_conds[0];
            } else if (brush_id.endsWith('gte')) {
                var str_vals = prev_conds[1];
            } else if (brush_id.endsWith('tcgan')) {
                var str_vals = prev_conds[2];
            }
            // Convert to list with two numbers
            var vals = str_vals.split(',').map(function(x)
                                               { return round(+x); })
        }
        // Set ranges correctly to prevent out-of-range values to be registered
        // console.log(vals);
        vals = filter_range(vals);
        return vals.join(',')
    };

})
    //Place in ready to prevent execution before initalization of all brushes
    // function update_venn(set_sizes) {
    //     // Check if all charts have been loaded, if not, dont draw venn yet
    //     if (d3.selectAll(".brush").nodes().length < 3){
    //         return;
    //     };

    //     var vals_jan = get_or_retrieve_range("#brush_jan"),
    //         vals_gte = get_or_retrieve_range("#brush_gte"),
    //         vals_tcgan = get_or_retrieve_range("#brush_tcgan");
    //     var checkConds = vals_jan + '--' + vals_gte + '--' + vals_tcgan;

    //     if (window.sessionStorage.getItem('checkConds') == checkConds) {
    //         // Means nothing has changed, probably due to reset button being pressed
    //         return;
    //     } else {
    //         window.sessionStorage.setItem('checkConds', checkConds);
    //     };

    //     // console.log("THIS IS DATA", data);
    //     $.ajax({
    //         method: "GET",
    //         url: "requests/?conds="+checkConds,
    //         async: true,
    //         success: function(data) {
    //             // Recieve data in order of set size 1, 4, 6, 7
    //             set_sizes = JSON.parse(data)
    //             // Replace (n=x) expression for bruggeman genes
    //             // setAbbrevs['1'] = ["Current selection\nBruggeman et al." +
    //             //		   ];
    //             if (checkConds ==  '1.6,13--0,1.8--6.2,13') {
    //                 setAbbrevs['1'][0] = setAbbrevs['1'][0].replace(
    //                     setAbbrevs['1'][0].slice(0, setAbbrevs['1'][0].indexOf('(')),
    //                     "Bruggeman et al. ")
    //             } else if (setAbbrevs['1'][0].includes('Bruggeman')) {
    //                 setAbbrevs['1'][0] = setAbbrevs['1'][0].replace(
    //                     setAbbrevs['1'][0].slice(0, setAbbrevs['1'][0].indexOf('(')),
    //                     "Current selection ")

    //             }


    //             setAbbrevs['1'][0] = setAbbrevs['1'][0].replace(setAbbrevs['1'][0].slice(
    //                 setAbbrevs['1'][0].indexOf('(')),
    //                                                             '(n = ' + set_sizes[0] + ')');
    //             var newsets = [
    //                 // Variable
    //                 {sets: setAbbrevs['1'], size: set_sizes[0]},
    //                 {sets: setAbbrevs['4'], size: set_sizes[1]},
    //                 {sets: setAbbrevs['6'], size: set_sizes[2]},
    //                 {sets: setAbbrevs['7'], size: set_sizes[3]},

    //                 // Fixed size
    //                 {sets: setAbbrevs['2'], size: 255},
    //                 {sets: setAbbrevs['3'], size: 1019},
    //                 {sets: setAbbrevs['5'], size: 146},
    //             ];


    //             var setSizeAbbrevs = {[setAbbrevs['1'].join(',')] : set_sizes[0],
    //                                   [setAbbrevs['4'].join(',')]: set_sizes[1] - set_sizes[3],
    //                                   [setAbbrevs['6'].join(',')]: set_sizes[2] - set_sizes[3],
    //                                   [setAbbrevs['7'].join(',')]: set_sizes[3],


    //                                   [setAbbrevs['5'].join(',')]: 146 - set_sizes[3],
    //                                  }

    //             vennDiv.datum(newsets).call(venn.VennDiagram(setSizeAbbrevs));
    //         }
    //     })




    // }






// Define data type
function type(d) {
    d.expr_jan = +d.expr_jan; // convert string to number repr
    d.expr_gte = +d.expr_gte;
    d.expr_tcgan = +d.expr_tcgan;
    d.x_value = +d.x_value;
    return d;
}




d3.select("#downloadCurSel").on("click", function() {
    try {

        var vals_jan = d3.brushSelection(
            d3.select("#brush_jan").node()).map(x.invert),
            vals_gte = d3.brushSelection(
                d3.select("#brush_gte").node()).map(x.invert),
            vals_tcgan = d3.brushSelection(
                d3.select("#brush_tcgan").node()).map(histo_object.x.invert);
    }
    catch(ReferenceError){
        return; // In case not all are defined, yet, no need to update
        // venn diagram as has already been drawn at top
    }
    $.ajax({
        method: "GET",
        url: "download/?conds="+vals_jan[0]+","+vals_jan[1]+"--"+vals_gte[0]+","+vals_gte[1]+"--"+vals_tcgan[0]+","+vals_tcgan[1],
        async: false,
        success: function() {
            window.location = "download/?conds="+vals_jan[0]+","+vals_jan[1]+"--"+vals_gte[0]+","+vals_gte[1]+"--"+vals_tcgan[0]+","+vals_tcgan[1]; //
        }
    });
});


// Reset button to original settings
d3.select("#reset_original").on("click", function() {

    d3.select("#brush_jan").call(brush_jan.move,
                                 [1.6, MAX_X_DOMAIN].map(histo_object.x));
    d3.select("#brush_gte").call(brush_gte.move, [0, 1.8].map(histo_object.x));
    d3.select("#brush_tcgan").call(brush_tcgan.move, [6.2, MAX_X_DOMAIN].map(histo_object.x));
})

// Add listeners to changes in input
d3.selectAll(".input_range_jan").on("change", function() {
    var newRange = d3.selectAll(".input_range_jan").nodes().map(
        function (e) {
            return round(e.value);
        });
    newRange = filter_range(newRange);
    d3.select("#brush_jan").call(brush_jan.move,
                                 newRange.map(x).sort(function(a, b) {
                                     return a-b;}))
})

d3.selectAll(".input_range_gte").on("change", function() {
    var newRange = d3.selectAll(".input_range_gte").nodes().map(
        function (e) {
            return round(e.value);
        })
    newRange = filter_range(newRange);
    d3.select("#brush_gte").call(brush_gte.move,
                                 newRange.map(x).sort(function(a, b) {
                                     return a-b;}))
})

d3.selectAll(".input_range_tcgan").on("change", function() {
    console.log('input range change');
    var newRange = d3.selectAll(".input_range_tcgan").nodes().map(
        function (e) {
            return round(e.value);
        });
    console.log(newRange);
    newRange = filter_range(newRange);
    d3.select("#brush_tcgan").call(brush_tcgan.move,
                                   newRange.map(histo_object.x).sort(function(a, b) {
                                       return a-b;}))
})
