
IV = 0.01;

MAX_X_DOMAIN = 13;
X_IV = 0.4;
function round(n) {
    return Math.round(n/IV)*IV;
}

function format(n) {
    // Use to access data from tsv files
    return parseFloat(Math.round(n/IV)*IV).toFixed(2)
}

// Initialize hashtable that for each value reports number of genes with jan_expr
// below that value
function Ftype_jan_max(d) {
    d.nofgenes = +d.nofgenes;
    d.interval = d.interval;
    return d;
}

function Ftype_gte_max(d) {
    d.nofgenes = +d.nofgenes;
    d.interval = d.interval;
    return d;
}

function Ftype_tcgan_max(d) {
    d.nofgenes = +d.nofgenes;
    d.interval = d.interval;
    return d;
}

// Read tsv and load dictionaries that map expression value to number of genes
// with less than or equal expression values (easily compute number of genes
// selected by doing F(expr_max) - F(expr_min)

d3.tsv("/static/cumulative_jan_max.txt", Ftype_jan_max, function(error, cumul_data) {
    F_jan_max= {};
    cumul_data.forEach(function(d) {
	F_jan_max[d.interval] = d.nofgenes;
    })
})

d3.tsv("/static/cumulative_gte_max.txt", Ftype_gte_max, function(error, cumul_data) {
    F_gte_max = {};
    cumul_data.forEach(function(d) {
	F_gte_max[d.interval] = d.nofgenes;
    })
})

d3.tsv("/static/cumulative_tcgan_max.txt", Ftype_tcgan_max, function(error, cumul_data) {
    F_tcgan_max = {};
    cumul_data.forEach(function(d) {
	F_tcgan_max[d.interval] = d.nofgenes;
    })
})

// Initialize dictionary that maps stringified integers to
// lists with full set names so venn diagram can be drawn
// yet save space in dataset by allowing integers to reprsent
// set integers
setAbbrevs = {};
setAbbrevs['1'] = ["Current selection\nBruggeman et al."];
setAbbrevs['2'] = ["CT database (n = 255)"];
setAbbrevs['3'] = ["CT genes\nWang et al. (n = 1019)"];
setAbbrevs['4'] = [setAbbrevs['1'], setAbbrevs['2']];
setAbbrevs['5'] = [setAbbrevs['2'], setAbbrevs['3']];
setAbbrevs['6'] = [setAbbrevs['3'], setAbbrevs['1']];
setAbbrevs['7'] = [setAbbrevs['1'], setAbbrevs['2'], setAbbrevs['3']];
setSize = {};
// Default setsize
setSize['1'] = 756;
setSize['4'] = 26;
setSize['6'] = 123;
setSize['7'] = 3;
// Update name of bruggeman circle with variable (n= x)
setAbbrevs['1'][0] = setAbbrevs['1'][0] + ' (n = ' + setSize['1'] + ')'
var sets = [
    // Variable
    {sets: setAbbrevs['1'], size: setSize['1']},
    {sets: setAbbrevs['4'], size: setSize['4']},
    {sets: setAbbrevs['6'], size: setSize['6']},
    {sets: setAbbrevs['7'], size: setSize['7']},

    // Fixed size
    {sets: setAbbrevs['2'], size: 255},
    {sets: setAbbrevs['3'], size: 1019},
    {sets: setAbbrevs['5'], size: 146},
    
];
vennMargin = {top: 30, bottom: 30, left: 30, right: 30}
var vennWidth = 1000 - vennMargin.left - vennMargin.right,
    vennHeight = 1000 - vennMargin.top - vennMargin.bottom;


sn1 = setAbbrevs['1'].join(','),
sn2 = setAbbrevs['2'].join(','),
sn3 = setAbbrevs['3'].join(','),
sn4 = setAbbrevs['4'].join(','),
sn5 = setAbbrevs['5'].join(','),
sn6 = setAbbrevs['6'].join(','),
sn7 = setAbbrevs['7'].join(',');


var setSizeAbbrevs = {[sn1] : setSize['1'],
		      [sn4]: setSize['4'],
		      [sn6]: setSize['6'],
		      [sn7]: setSize['7'],
		      
		      [sn2]: 255,
		      [sn3]: 1019,
		      [sn5]: 146,
		     }

// var vennSVG = d3.select("#vennsvg")
//     .attr("width", vennWidth + vennMargin.left + vennMargin.right)
//     .attr("height", vennHeight + vennMargin.bottom + vennMargin.top)

var vennDiv = d3.select("#venn")
    .attr("width", vennWidth + vennMargin.left + vennMargin.right)
    .attr("height", vennHeight + vennMargin.bottom, vennMargin.top)


// // draw venn diagram
// var div = d3.select("#venn")
vennChart = venn.VennDiagram(setSizeAbbrevs);
vennDiv.datum(sets).call(vennChart);

// add a tooltip
var tooltip = d3.select("#rightbox").append("div")
    .attr("class", "venntooltip");

// add listeners to all the groups to display tooltip on mouseover
vennDiv.selectAll("g")
    .on("mouseover", function(d, i) {
        // sort all the areas relative to the current item
        venn.sortAreas(vennDiv, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", .9);
        tooltip.text(d.size + " genes");
        
        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 3)
            .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
            .style("stroke-opacity", 1);
    })

    .on("mousemove", function() {
        tooltip.style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
    })
    
    .on("mouseout", function(d, i) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 0)
            .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
            .style("stroke-opacity", 0);
    });



// //Add tooltips
// var tooltip = d3.select("body").append("div")
//     .attr("class", "venntooltip");

// // Add listners to all the groups to display tooltip on mouseover
// vennDiv.selectAll("g")
//     .on("mouseover", function(d, i) {
// 	// Sort areas relative to current item
// 	// console.log(d.size, i);
// 	venn.sortAreas(vennDiv, d);
// 	// Display tooltip with current size
// 	tooltip.transition().duration(400).style("opacity", 0.9);
// 	tooltip.attr("text", d.size+" genes.");
// 	//the current path
// 	var selection = d3.select(this).transition("tooltip")
// 	    .duration(400).select("path")
// 	    .style("stroke-width", 3)
// 	    .style("fill-opacity", d.sets.length == 1 ? .4: .1)
// 	    .style("stroke-opacity", 1);
// 	console.log(tooltip.attr("text"));
//     })
//     .on("mousemove", function() {
// 	tooltip.style("left", (d3.event.pageX) + "px")
// 	    .style("top", (d3.event.pageY - 28) + "px");
// 	console.log(d3.event.pageY, d3.event.pageX);
//     })
//     .on("mouseout", function(d, i) {
// 	tooltip.transition().duration(400).style("opacity", 0.9);
// 	var selection = d3.select(this).transition("tooltip").duration(400);
// 	selection.select("path")
// 	    .style("stroke-width", 0)
// 	    .style("fill-opacity", d.sets.length == 1? .25 : .0)
// 	    .style("stroke-opacity", 0);
//     });
// vennDiv.datum(sets).call(venn.VennDiagram());
// Initial visualization of graph with default values, from hereon altered by
// update_venn
// var chart = venn.VennDiagram();
// d3.select("#venn")
//     .datum(sets)
//     .call(chart);


// GRAPHS-----------------------------------------------------------------------
// Start drawing of graphs
var margin = {top: 30, left: 50, right: 50, bottom: 50}
var width = 750 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]);

// Set y-scales for specific graphs (ranges are same for all)



// .range([height, 0]);    
// .domain([0, d3.max(data)])

// Grab charts 

// Define axes Possibly make 2 axis, one for right number of ticks and one for
// right value display
var xAxis = d3.axisBottom(x)
    .tickFormat(d3.format(".2"))
    .tickValues(d3.range(0, MAX_X_DOMAIN, X_IV))


var tickAxis = d3.axisBottom(x)
    .tickFormat("")
    .tickSize(4)
    .tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))

function make_x_gridlines(scale, axis) {
    return d3.axisBottom(x)
	.tickValues(d3.range(0, MAX_X_DOMAIN, 0.2))
	.tickSizeOuter(0);
}

function make_y_gridlines(scale, yaxis) {
    return d3.axisLeft(scale)
	.tickValues(yaxis.tickValues());
}
        

// [0.4, 0.8, 1.2, 1.6, 2, 2.4, 2.8, 3.2, 3.6, 4, 4.4, 4.8, 5.2,
		 // 5.6, 6, 6.4, 6.8, 7.2, 7.6, 8, 8.4, 8.8, 9.2, 9.6, 10, 10.4,
		 // 10.8, 11.2, 11.6, 12, 12.4, 12.8, MAX_X_DOMAIN])
    // .selectAll("text")
    // .attr("dy", ".35em")
    // .attr("transform", "rotate(90)")
    // .style("text-anchor", "start")
// Chart-specific axes


//GTE

// var chart_gte = d3.select('#expr_gte')
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.bottom+margin.top)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var y_gte = d3.scaleLinear()
//     .range([height, 0]);

// var yAxis_gte = d3.axisLeft().scale(y_gte)
//     .ticks(5);

// var line_gte = d3.line()
//     .curve(d3.curveBasis)
//     .x(function(d) { return x(d.x_value); })
//     .y(function(d) { return y_gte(d.expr_gte); });


// var area_gte = d3.area()
//     .curve(d3.curveBasis)    
//     .x(function(d) { return x(d.x_value); })
//     .y0(height)
//     .y1(function(d) { return y_gte(d.expr_gte); });



// TCGAN
var y_tcgan = d3.scaleLinear()
    .range([height, 0]);    

var chart_tcgan = d3.select('#expr_tcgan')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom+margin.top)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yAxis_tcgan = d3.axisLeft().scale(y_tcgan)
    .ticks(5);

var line_tcgan = d3.line()
    .curve(d3.curveBasis)    
    .x(function(d) { return x(d.x_value); })
    .y(function(d) { return y_tcgan(d.expr_tcgan); });

var area_tcgan = d3.area()
    .curve(d3.curveBasis)    
    .x(function(d) { return x(d.x_value); })
    .y0(height)
    .y1(function(d) { return y_tcgan(d.expr_tcgan); });


// var data_chart;
d3.tsv(expr_tsv_path, type, function(error, data_chart) {

    // Jan max Set domains of y scales_
    

    // var max_gte = d3.max(data_chart, function(d) {return d.expr_gte; })

    // y_gte.domain([0, max_gte]);// d3.max(data_chart, function(d) {return d.expr_gte; })]);

    var max_tcgan = d3.max(data_chart, function(d) {return d.expr_tcgan; })

    y_tcgan.domain([0, max_tcgan]);//d3.max(data_chart, function(d) {return d.expr_tcgan; })]);






    
		       
    
    // .tickValues(d3.range(0, MAX_X_DOMAIN, 0.4))

    // Set domain of x-scale (invariant to all graphs)
    x.domain([0, d3.max(data_chart, function(d) {return d.x_value; })]);

    //JAN---------------------------------------------------------------------------------
// Jan expression
    var chart_jan = d3.select('#expr_jan')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom + margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y_jan = d3.scaleLinear()
	.range([height, 0]);

    var yAxis_jan = d3.axisLeft().scale(y_jan)
	.tickSizeOuter(0);

    var line_jan = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y(function(d) { return y_jan(d.expr_jan); });

    var area_jan = d3.area()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y0(height)
	.y1(function(d) { return y_jan(d.expr_jan); });

    max_jan = d3.max(data_chart, function(d) {return d.expr_jan; })

    y_jan.domain([0, max_jan]);

    yAxis_jan
	.tickValues(d3.range(0, Math.ceil(max_jan/100)*100, 100).concat(
	    Math.ceil(max_jan/100)*100 + 100))

    
    chart_jan.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height+ ")")
	.call(xAxis)
        .selectAll("text")
	.attr("y", 0)
	.attr("x", "-2.2em")
	.attr("dy", ".35em")
	.attr("transform", "rotate(270)")
	.style("text-anchor", "start");

    chart_jan.append("g")
	.attr("class", "ticks axis")
	.attr("transform", "translate(0," + height + ")")
    	.call(tickAxis)


    // Add vertical gridlines
    chart_jan.append("g")
	.attr("class", "grid")
	.attr("transform", "translate(0," + height + ")")
	.call(make_x_gridlines() 
	      .tickSize(-height)
	      .tickFormat(""));

    // Add horizontal gridlines
    chart_jan.append("g")
	.attr("class", "grid jan")
	// .attr("transform", "translate("+width+",0)")
	.call(make_y_gridlines(y_jan, yAxis_jan)
	      .tickSize(-width)
	      .tickFormat(""))
    
    // Add y axis
    chart_jan.append("g")
	.attr("class", "y axis")
	.call(yAxis_jan);

    // Add area
    chart_jan.append("path")
	.attr("class", "area")
	.attr("id", "area_jan")
	.attr("d", area_jan(data_chart));

    // Add line
    chart_jan.append("path")
	.attr("class", "line")
	.attr("id", "line_jan")
	.attr("d", line_jan(data_chart))
	// .attr("data-legend", function(d) {
	//     return "Gene expression in germ cells"}
	//      )
	// .attr("data-legend-icon", "line");
    
    // Add title to axis

    chart_jan.append("text")
	.attr("class", "ylabel")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x", 0 - (height / 2))
	.attr("dy", "1em")
	.text("Number of genes")

    chart_jan.append("text")
	.attr("class", "xlabel")
	.attr("transform", "translate(" + (width/2) + " ," +
	      (height + margin.top + 15) + ")")
	.style("text-anchor", "middle")
	.text("Gene expression (2log)")


    // Add x-axis and ticks
    chart_jan.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height+ ")")
	.call(xAxis)
        .selectAll("text")
	.attr("y", 0)
	.attr("x", "-2.2em")
	.attr("dy", ".35em")
	.attr("transform", "rotate(270)")
	.style("text-anchor", "start");

    chart_jan.append("g")
	.attr("class", "ticks axis")
	.attr("transform", "translate(0," + height + ")")
    	.call(tickAxis)


    // Add vertical gridlines
    chart_jan.append("g")
	.attr("class", "grid")
	.attr("transform", "translate(0," + height + ")")
	.call(make_x_gridlines() 
	      .tickSize(-height)
	      .tickFormat(""));

    // Add horizontal gridlines
    chart_jan.append("g")
	.attr("class", "grid jan")
	// .attr("transform", "translate("+width+",0)")
	.call(make_y_gridlines(y_jan, yAxis_jan)
	      .tickSize(-width)
	      .tickFormat(""))
    
    // Add y axis
    chart_jan.append("g")
	.attr("class", "y axis")
	.call(yAxis_jan);

    // Add area
    chart_jan.append("path")
	.attr("class", "area")
	.attr("id", "area_jan")
	.attr("d", area_jan(data_chart));

    // Add line
    chart_jan.append("path")
	.attr("class", "line")
	.attr("id", "line_jan")
	.attr("d", line_jan(data_chart))
    
    // Add title to axis

    chart_jan.append("text")
	.attr("class", "ylabel")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x", 0 - (height / 2))
	.attr("dy", "1em")
	.text("Number of genes")

    // chart_jan.append("text")
    // 	.attr("class", "xlabel")
    // 	.attr("transform", "translate(" + (width/2) + " ," +
    // 	      (height + margin.top + 20) + ")")
    // 	.style("text-anchor", "middle")
    // 	.text("Gene expression (2log)")

    // Add chart title

    chart_jan.append("text")
	.attr("x", width/2)
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.style("font-size", "16px")
	.style("text-decoration", "underline")
	.text("Gene expression in germ cells (2log scale)")

    // Add brushes
    brush_jan = d3.brushX()
	.extent([[0, 0], [width, height]])
	.on("brush", function(d) {
	    // Set input range values accordingly
 	    var cur_range = d3.brushSelection(this).map(x.invert);
	    // Set custom attribute which is formatted in main.css
	    if (cur_range[1] >= 13) {
		d3.select("#max_range_max_jan").attr("crossed-out",
						      "true");
		d3.select("#input_max_jan").attr("crossed-out",
						      "true");

	    } else {
		d3.select("#max_range_max_jan").attr("crossed-out",
						      "false");
		d3.select("#input_max_jan").attr("crossed-out",
						      "false");		
		// d3.select("#max_range_max_jan").style("visibility", "initial");
	    }	    
	    d3.select("#input_min_jan").attr("value", format(cur_range[0]));
	    d3.select("#input_max_jan").attr("value", format(cur_range[1]));
	    d3.select("#nofgenes_jan").text((F_jan_max[format(cur_range[1])]
					     - F_jan_max[format(cur_range[0])]));
	    update_brush_handles();
	    


	})
	.on("end", update_venn);

    // Append brush to chart_jan
    brush_area_jan = chart_jan.append("g")
	.attr("class", "brush")
	.attr("id", "brush_jan")
	.call(brush_jan)

    var brushResizePath = function(d) {
    	var e = +(d.type == "e"),
    	    x = e ? 1: - 1,
    	    y = height / 2;
    	console.log(x, y);
    	return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    };
    
    brush_handle_jan = brush_area_jan.selectAll(".handle--custom")
    	.data([{type: "w"}, {type: "e"}])
    	.enter().append("path")
    	.attr("class", "handle--custom")
    	.attr("stroke", "#000")
    	.attr("cursor", "ew-resize")
    	.attr("d", brushResizePath)



    brush_area_jan
	.call(brush_jan.move, [1.6, MAX_X_DOMAIN].map(x))
	.selectAll(".overlay")
	// .each(function(d) {d.type = "selection"; })


    function update_brush_handles() {
	var s = d3.event.selection;
	brush_handle_jan.attr("display", null).attr("transform", function(d, i) { return "translate(" + s[i] + "," + -height /4 + ")"; });
    };
	

// GTE---------------------------------------------------------------    
    var chart_gte = d3.select('#expr_gte')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom + margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y_gte = d3.scaleLinear()
	.range([height, 0]);

    var yAxis_gte = d3.axisLeft().scale(y_gte)
	.tickSizeOuter(0);

    var line_gte = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y(function(d) { return y_gte(d.expr_gte); });

    var area_gte = d3.area()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y0(height)
	.y1(function(d) { return y_gte(d.expr_gte); });

    max_gte = d3.max(data_chart, function(d) {return d.expr_gte; })

    y_gte.domain([0, max_gte]);

    yAxis_gte
	.tickValues(d3.range(0, Math.ceil(max_gte/100)*100, 100).concat(
	    Math.ceil(max_gte/100)*100))

    
    chart_gte.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height+ ")")
	.call(xAxis)
        .selectAll("text")
	.attr("y", 0)
	.attr("x", "-2.2em")
	.attr("dy", ".35em")
	.attr("transform", "rotate(270)")
	.style("text-anchor", "start");

    chart_gte.append("g")
	.attr("class", "ticks axis")
	.attr("transform", "translate(0," + height + ")")
    	.call(tickAxis)


    // Add vertical gridlines
    chart_gte.append("g")
	.attr("class", "grid")
	.attr("transform", "translate(0," + height + ")")
	.call(make_x_gridlines() 
	      .tickSize(-height)
	      .tickFormat(""));

    // Add horizontal gridlines
    chart_gte.append("g")
	.attr("class", "grid jan")
	// .attr("transform", "translate("+width+",0)")
	.call(make_y_gridlines(y_gte, yAxis_gte)
	      .tickSize(-width)
	      .tickFormat(""))
    
    // Add y axis
    chart_gte.append("g")
	.attr("class", "y axis")
	.call(yAxis_gte);

    // Add area
    chart_gte.append("path")
	.attr("class", "area")
	.attr("id", "area_gte")
	.attr("d", area_gte(data_chart));

    // Add line
    chart_gte.append("path")
	.attr("class", "line")
	.attr("id", "line_gte")
	.attr("d", line_gte(data_chart))
	// .attr("data-legend", function(d) {
	//     return "Gene expression in germ cells"}
	//      )
	// .attr("data-legend-icon", "line");
    
    // Add title to axis

    chart_gte.append("text")
	.attr("class", "ylabel")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x", 0 - (height / 2))
	.attr("dy", "1em")
	.text("Number of genes")

    chart_gte.append("text")
	.attr("class", "xlabel")
	.attr("transform", "translate(" + (width/2) + " ," +
	      (height + margin.top + 15) + ")")
	.style("text-anchor", "middle")
	.text("Gene expression (2log)")


    // Add x-axis and ticks
    chart_gte.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height+ ")")
	.call(xAxis)
        .selectAll("text")
	.attr("y", 0)
	.attr("x", "-2.2em")
	.attr("dy", ".35em")
	.attr("transform", "rotate(270)")
	.style("text-anchor", "start");

    chart_gte.append("g")
	.attr("class", "ticks axis")
	.attr("transform", "translate(0," + height + ")")
    	.call(tickAxis)


    // Add vertical gridlines
    chart_gte.append("g")
	.attr("class", "grid")
	.attr("transform", "translate(0," + height + ")")
	.call(make_x_gridlines() 
	      .tickSize(-height)
	      .tickFormat(""));

    // Add horizontal gridlines
    chart_gte.append("g")
	.attr("class", "grid jan")
	// .attr("transform", "translate("+width+",0)")
	.call(make_y_gridlines(y_gte, yAxis_gte)
	      .tickSize(-width)
	      .tickFormat(""))
    
    // Add y axis
    chart_gte.append("g")
	.attr("class", "y axis")
	.call(yAxis_gte);

    // Add area
    chart_gte.append("path")
	.attr("class", "area")
	.attr("id", "area_gte")
	.attr("d", area_gte(data_chart));

    // Add line
    chart_gte.append("path")
	.attr("class", "line")
	.attr("id", "line_gte")
	.attr("d", line_gte(data_chart))
	// .attr("data-legend", function(d) {
	//     return "Gene expression in germ cells"}
	//      )
	// .attr("data-legend-icon", "line");
    
    // Add title to axis

    chart_gte.append("text")
	.attr("class", "ylabel")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x", 0 - (height / 2))
	.attr("dy", "1em")
	.text("Number of genes")

    // Add title
    
    chart_gte.append("text")
	.attr("x", width/2)
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.style("font-size", "16px")
	.style("text-decoration", "underline")
	.text("Gene expression in germ cells (2log scale)")
    

    // Add brushes
    brush_gte = d3.brushX()
	.extent([[0, 0], [width, height]])
	.on("brush", function(d) {
	    // Set input range values accordingly
 	    var cur_range = d3.brushSelection(this).map(x.invert);
	    d3.select("#input_min_gte").attr("value", format(cur_range[0]));
	    d3.select("#input_max_gte").attr("value", format(cur_range[1]));
	    d3.select("#nofgenes_gte").text((F_gte_max[format(cur_range[1])]
					     - F_gte_max[format(cur_range[0])]))
	    ;
	})
	.on("end", update_venn);

    // Append brush to chart_gte
    brush_area_gte = chart_gte.append("g")
	.attr("class", "brush")
	.attr("id", "brush_gte")
	.call(brush_gte)
	.call(brush_gte.move, [0, 1.6].map(x))
	.selectAll(".overlay")
	.each(function(d) {d.type = "selection"; })
    // .on("mousedown touchstart", null);






    // ///----------------------------
    // chart_gte.append("g")
    // 	.attr("class", "x axis")
    // 	.attr("transform", "translate(0," + height+ ")")
    // 	.call(xAxis);

    // chart_gte.append("g")
    // 	.attr("class", "y axis")
    // 	.call(yAxis_gte);
    
    // chart_gte.append("path")
    // 	.attr("class", "area")
    // 	.attr("id", "area_gte")
    // 	.attr("d", area_gte(data_chart));

    // chart_gte.append("path")
    // 	.attr("class", "line")
    // 	.attr("id", "line_gte")
    // 	.attr("d", line_gte(data_chart));

    // // // Add brushes
    // // brush_jan = d3.brushX()
    // // 	.extent([[0, 0], [width, height]])
    // // 	.on("brush", function(d) {
    // // 	    // Set input range values accordingly
    // // 	    var cur_range = d3.brushSelection(this).map(x.invert);
    // // 	    d3.select("#input_min_jan").attr("value", format(cur_range[0]));
    // // 	    d3.select("#input_max_jan").attr("value", format(cur_range[1]));
    // // 	    d3.select("#nofgenes_jan").text((F_jan_max[format(cur_range[1])]
    // // 					     - F_jan_max[format(cur_range[0])]))
    // // 	    ;
    // // 	})
    // // 	.on("end", update_venn);    
    
    // Add x Axis, line, and area to tcgan
    chart_tcgan.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height+ ")")
	.call(xAxis);

    chart_tcgan.append("g")
	.attr("class", "y axis")
	.call(yAxis_tcgan);
    
    chart_tcgan.append("path")
	.attr("class", "area")
	.attr("id", "area_tcgan")
	.attr("d", area_tcgan(data_chart));

    chart_tcgan.append("path")
	.attr("class", "line")
	.attr("id", "line_tcgan")
	.attr("d", line_tcgan(data_chart));


// GTE---------------------------------------------------------------        
    

    // brush_gte = d3.brushX()
    // 	.extent([[0, 0], [width, height]])
    // 	.on("end", update_venn)
    // 	.on("brush", function(d) {
    // 	    // Set input range values accordingly
    // 	    var cur_range = d3.brushSelection(this).map(x.invert);
    // 	    d3.select("#input_min_gte").attr("value", round(cur_range[0]));
    // 	    d3.select("#input_max_gte").attr("value", round(cur_range[1]));}
    // 	   )
    // ;// (this))
    // var x_min = x.invert(d3.brushSelection(this)[0]),
    //     x_max = x.invert(d3.brushSelection(this)[1]);
    // console.log(x_min, x_max);


    brush_tcgan = d3.brushX()
	.extent([[0, 0], [width, height]])
	.on("end", update_venn)
	.on("brush", function(d) {
	    // Set input range values accordingly
 	    var cur_range = d3.brushSelection(this).map(x.invert);
	    d3.select("#input_min_tcgan").attr("value",
					       round(cur_range[0]));
	    d3.select("#input_max_tcgan").attr("value",
					       round(cur_range[1]));}
	   )

    // chart_gte.append("g")
    // 	.attr("class", "brush")
    // 	.attr("id", "brush_gte")	
    // 	.call(brush_gte)
    // 	.call(brush_gte.move, [0, 1.8].map(x))
    // 	.selectAll(".overlay")
    // 	.each(function(d) {d.type = "selection"; })
    // .on("mousedown touchstart", null);
    
    
    chart_tcgan.append("g")
	.attr("class", "brush")
	.attr("id", "brush_tcgan")	
	.call(brush_tcgan)
	.call(brush_tcgan.move, [6.2, MAX_X_DOMAIN].map(x))
	.selectAll(".overlay")
	.each(function(d) {d.type = "selection"; })
    // .on("mousedown touchstart", null);

    function brushed() {
	var cur_range = d3.brushSelection(this).map(x.invert);

	d3.select("#input_min_jan").attr("value", round(cur_range[0]));
	d3.select("#input_max_jan").attr("value", round(cur_range[1]));
    };
    
    // console.log(x_values);

    // WHY DOES THIS NOT WORK?!
    //     var brush_jan = d3.select("#brush_jan");
    //     console.log(d3.select("#div_chart_jan"));
    //     d3.select("#expr_jan").call(brush_jan)
    // 	.call(brush_jan.move, [3, 5].map(x));
    // });


    



    // brush_area_jan// make sure to select right div to allow moving, heck bubse
    // 	.select("#brush_jan").remove()
    // d3.select("#brush_jan").call(
    // chart_jan
    // 	.call(brush_jan)

    // brush_area_jan// make sure to select right div to allow moving, heck bubse
    // 	.select("#brush_jan").remove()
    // d3.select("#brush_jan").call(
    // chart_jan
    // 	.call(brush_ja    
    // d3.select("chart_jan").call(brush_jan.move, [ranges[0], ranges[1]].map(x));
    // console.log(ranges)



    //Place in ready to prevent execution before initalization of all brushes
    function update_venn(set_sizes) {

	// var extent_jan=  d3.brushSelection(this).map(x.invert);
 	// console.log(extent_jan);
	// var extent_jan = d3.brushSelection(this),
	try {
	    
	    var vals_jan = d3.brushSelection(
		d3.select("#brush_jan").node()).map(x.invert),
		vals_gte = d3.brushSelection(
		    d3.select("#brush_gte").node()).map(x.invert),
		vals_tcgan = d3.brushSelection(
		    d3.select("#brush_tcgan").node()).map(x.invert);
	}
	catch(ReferenceError){
	    return; // In case not all are defined, yet, no need to update
	    // venn diagram as has already been drawn at top
	}
	var checkConds = (vals_jan[0]+","+vals_jan[1]+"-"+vals_gte[0]
			  +","+vals_gte[1]+"-"+vals_tcgan[0]+","+vals_tcgan[1]);
	if (window.sessionStorage.getItem('checkConds') == checkConds) {
	    // Means nothing has changed, probably due to reset button being pressed
	    console.log("stop");
	    return;
	} else {
	    window.sessionStorage.setItem('checkConds', checkConds);
	};
	       

	$.ajax({
	    method: "GET",
	    url: "requests/?conds="+checkConds,
	    async: true,
	    success: function(data) {
	    	// Recieve data in order of set size 1, 4, 6, 7
	    	console.log(data)
	    	set_sizes = JSON.parse(data)
		// Replace (n=x) expression for bruggeman genes
		setAbbrevs['1'][0] = setAbbrevs['1'][0].replace(setAbbrevs['1'][0].slice(
		    setAbbrevs['1'][0].indexOf('(')),
					   '(n = ' + set_sizes[0] + ')');
		var newsets = [
		    // Variable
		    {sets: setAbbrevs['1'], size: set_sizes[0]},
		    {sets: setAbbrevs['4'], size: set_sizes[1]},
		    {sets: setAbbrevs['6'], size: set_sizes[2]},
		    {sets: setAbbrevs['7'], size: set_sizes[3]},
		    
		    // Fixed size
		    {sets: setAbbrevs['2'], size: 255},
		    {sets: setAbbrevs['3'], size: 1019},
		    {sets: setAbbrevs['5'], size: 146},
		];
		console.log(setAbbrevs['1']);
		// Cannot directly link to setAbbrevs in dict belowfor some
		// reason
		// var sn1 = setAbbrevs['1'].join(','),
		//     sn2 = setAbbrevs['2'].join(','),
		//     sn3 = setAbbrevs['3'].join(','),
		//     sn4 = setAbbrevs['4'].join(','),
		//     sn5 = setAbbrevs['5'].join(','),
		//     sn6 = setAbbrevs['6'].join(','),
		//     sn7 = setAbbrevs['7'].join(',');


		var setSizeAbbrevs = {[setAbbrevs['1'].join(',')] : set_sizes[0],
				      [setAbbrevs['4'].join(',')]: set_sizes[1],
				      [setAbbrevs['6'].join(',')]: set_sizes[2],
				      [setAbbrevs['7'].join(',')]: set_sizes[3],


				      [setAbbrevs['5'].join(',')]: 146,
				     }
		
		console.log(vennDiv, vennChart);
		vennDiv.datum(newsets).call(venn.VennDiagram(setSizeAbbrevs));
		
		

		// add a tooltip
		// var tooltip = d3.select("#venn").append("div")
		//     .attr("class", "tooltip");

		// // add listeners to all the groups to display tooltip on mouseover
		// vennDiv.selectAll("g")
		//     .on("mouseover", function(d, i) {
		// 	// sort all the areas relative to the current item
		// 	venn.sortAreas(vennDiv, d);

		// 	// Display a tooltip with the current size
		// 	tooltip.transition().duration(400).style("opacity", .9);
		// 	tooltip.text(d.size + " genes");
		// 	// highlight the current path
		// 	var selection = d3.select(this).transition("tooltip").duration(400);
		// 	selection.select("path")
		// 	    .style("stroke-width", 3)
		// 	    .style("fill-opacity", d.sets.length == 1 ? .4 : .1)
		// 	    .style("stroke-opacity", 1);
		//     })

		//     .on("mousemove", function() {
		// 	console.log(d3.event.pageY, d3.event.pageX);
		// 	tooltip.style("left", (d3.event.pageX) + 'px')
		// 	    .style("top", (d3.event.pageY) - 28 + "px");
		// 	console.log(tooltip.style('left'), tooltip.style('top')); 
		//     })
		
		//     .on("mouseout", function(d, i) {
		// 	tooltip.transition().duration(400).style("opacity", 0);
		// 	var selection = d3.select(this).transition("tooltip").duration(400);
		// 	selection.select("path")
		// 	    .style("stroke-width", 0)
		// 	    .style("fill-opacity", d.sets.length == 1 ? .25 : .0)
		// 	    .style("stroke-opacity", 0);
		//     });






	    }
	})
	
	


    }


    // chart_jan.append("path")
    //     .attr("class", "area")
    //     .attr("id", "area_jan")
    //     .attr("d", area_jan(data));	
    // xinv(
    // console.log(d3.select(this));
    // 	// console.log(d3.brushSelection(this));
    // .on("end", function()  {
    // 	console.log(d3.brushSelection(this))
    // 		   });
    
    
    // chart_jan.append("g")
    //     .attr("class", "brush")
    //     .call(brush_jan);

    // TODO:
    // Given domain pixels and current node, fills area accordingly
    function fillArea(curNode) {
	console.log(d3.brushSelection(curNode));
    }

})


// Define data type
function type(d) {
    d.expr_jan = +d.expr_jan; // convert string to number repr
    d.expr_gte = +d.expr_gte;
    d.expr_tcgan = +d.expr_tcgan;
    d.x_value = +d.x_value;
    return d;
}	


// d3.tsv(expr_tsv_path,  type, function(error, data) {
// 	y.domain([0, d3.max(data, function(d) {return d.value;})]);
// 	// chart.attr("height", barHeight * data.length);
// 	var barWidth = width / data.length;

// 	var bar = chart.selectAll("g")
// 	    .data(data)
// 	    .enter().append("g")
// 	    .attr("transform", function(d, i) {
// 		return "translate("+i*barWidth+",0)";
// 	    });

// 	bar.append("rect")
// 	    .attr("width", function(d) { return x(d.value); })
// 	    .attr("height", barHeight - 1);

// 	bar.append("text")
// 	    .attr("x", function(d) { return x(d.value) - 3; })
// 	    .attr("y", barHeight / 2)
// 	    .attr("dy", ".35em")
// 	    .text(function(d) {return d.value; });
//     });
// });


// previous work
// $(document).ready(function() {
//     // var data = [4, 8, 15, 16, 23, 42];

//     var width = 420, barHeight = 20;

//     var x = d3.scaleLinear()
// 	.range([0, width]);    
// 	// .domain([0, d3.max(data)])


//     var chart = d3.select('.chart')
// 	.attr("width", width);

//     d3.tsv(path,  type, function(error, data) {
// 	x.domain([0, d3.max(data, function(d) {return d.value;})]);
// 	chart.attr("height", barHeight * data.length);

// 	var bar = chart.selectAll("g")
// 	    .data(data)
// 	    .enter().append("g")
// 	    .attr("transform", function(d, i) { return "translate(0,"+i*barHeight+")"; });

// 	bar.append("rect")
// 	    .attr("width", function(d) { return x(d.value); })
// 	    .attr("height", barHeight - 1);

// 	bar.append("text")
// 	    .attr("x", function(d) { return x(d.value) - 3; })
// 	    .attr("y", barHeight / 2)
// 	    .attr("dy", ".35em")
// 	    .text(function(d) {return d.value; });
//     });
// });

// function type(d) {
//     d.value = +d.value; // convert string to number repr
//     return d;
// }


// Add listener that responds to changes in values in any of the inputs



d3.select("#downloadCurSel").on("click", function() {
    try {
	
	var vals_jan = d3.brushSelection(
	    d3.select("#brush_jan").node()).map(x.invert),
	    vals_gte = d3.brushSelection(
		d3.select("#brush_gte").node()).map(x.invert),
	    vals_tcgan = d3.brushSelection(
		d3.select("#brush_tcgan").node()).map(x.invert);
    }
    catch(ReferenceError){
	return; // In case not all are defined, yet, no need to update
	// venn diagram as has already been drawn at top
    }
    $.ajax({
	method: "GET",
	url: "download/?conds="+vals_jan[0]+","+vals_jan[1]+"-"+vals_gte[0]+","+vals_gte[1]+"-"+vals_tcgan[0]+","+vals_tcgan[1],
	async: false,
	success: function() {
	    window.location = "download/?conds="+vals_jan[0]+","+vals_jan[1]+"-"+vals_gte[0]+","+vals_gte[1]+"-"+vals_tcgan[0]+","+vals_tcgan[1];
	}
    });
});


// Reset button to original settings
d3.select("#reset_original").on("click", function() {
    d3.select("#brush_jan").call(brush_jan.move,
				 [1.6, MAX_X_DOMAIN].map(x));
    d3.select("#brush_gte").call(brush_gte.move, [0, 1.8].map(x));
    d3.select("#brush_tcgan").call(brush_tcgan.move, [6.2, MAX_X_DOMAIN].map(x));
})


d3.selectAll("input").on("change", function() {
    console.log('changing input')
    var ranges = d3.selectAll(".input_range").nodes().map(
    	function(e) {
    	    return parseFloat(e.value);
    	});
    d3.select("#brush_jan").call(brush_jan.move,
				 [ranges[0], ranges[1]].map(x));
    // d3.select("#brush_gte").call(brush_gte.move, [0, 1.8].map(x));
    // d3.select("#brush_tcgan").call(brush_tcgan.move, [6.2, MAX_X_DOMAIN].map(x));
})
// d3.select("#saveVenn").on("click", function() {
//     var html = this.svg
//         .attr("version", 1.1)
//         .attr("xmlns", "http://www.w3.org/2000/svg")
//         .node().parentNode.innerHTML;
//     let imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
//     let img = '<img src="' + imgsrc + '">';
//     self.D3.select("#svgdataurl").html(img);
// })
