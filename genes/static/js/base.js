
IV = 0.01;

function round(n) {
    return Math.round(n/IV)*IV;
}	// Initialize dictionary that maps stringified integers to
	// lists with full set names so venn diagram can be drawn
	// yet save space in dataset by allowing integers to reprsent
	// set integers
	setAbbrevs = {};
	setAbbrevs['1'] = ["Current selection\nBruggeman et al."];
	setAbbrevs['2'] = ["CT database"];
	setAbbrevs['3'] = ["CT genes\nWang et al."];
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

var vennDiv = d3.select("#venn");
vennDiv.datum(sets).call(venn.VennDiagram());

//Add tooltips
var tooltip = d3.select("body").append("div")
    .attr("class", "venntooltip");

// Add listners to all the groups to display tooltip on mouseover
vennDiv.selectAll("g")
    .on("mouseover", function(d, i) {
	// Sort areas relative to current item
	// console.log(d.size, i);
	venn.sortAreas(vennDiv, d);
	// Display tooltip with current size
	tooltip.transition().duration(400).style("opacity", 0.9);
	tooltip.attr("text", d.size+" genes.");
	//the current path
	var selection = d3.select(this).transition("tooltip")
	    .duration(400).select("path")
	    .style("stroke-width", 3)
	    .style("fill-opacity", d.sets.length == 1 ? .4: .1)
	    .style("stroke-opacity", 1);
	console.log(tooltip.attr("text"));
    })
    .on("mousemove", function() {
	tooltip.style("left", (d3.event.pageX) + "px")
	    .style("top", (d3.event.pageY - 28) + "px");
	console.log(d3.event.pageY, d3.event.pageX);
    })
    .on("mouseout", function(d, i) {
	tooltip.transition().duration(400).style("opacity", 0.9);
	var selection = d3.select(this).transition("tooltip").duration(400);
	selection.select("path")
	    .style("stroke-width", 0)
	    .style("fill-opacity", d.sets.length == 1? .25 : .0)
	    .style("stroke-opacity", 0);
    });

// Initial visualization of graph with default values, from hereon altered by
// update_venn
// var chart = venn.VennDiagram();
// d3.select("#venn")
//     .datum(sets)
//     .call(chart);



// Start drawing of graphs
    var margin = {top: 20, left: 30, right: 30, bottom: 30}
    var width = 800 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
	.range([0, width]);
    
    // Set y-scales for specific graphs (ranges are same for all)
    var y_jan = d3.scaleLinear()
	.range([height, 0]);

    var y_gte = d3.scaleLinear()
	.range([height, 0]);

    var y_tcgan = d3.scaleLinear()
	.range([height, 0]);    
    
	// .range([height, 0]);    
	// .domain([0, d3.max(data)])
		   
    // Grab charts 
    var chart_jan = d3.select('#expr_jan')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom+margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var chart_gte = d3.select('#expr_gte')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom+margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var chart_tcgan = d3.select('#expr_tcgan')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom+margin.top)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define axes
    var xAxis = d3.axisBottom().scale(x)

    // Chart-specific axes
    var yAxis_jan = d3.axisLeft().scale(y_jan)
	.ticks(5);

    var yAxis_gte = d3.axisLeft().scale(y_gte)
	.ticks(5);
    
    var yAxis_tcgan = d3.axisLeft().scale(y_tcgan)
	.ticks(5);
    
    // Define line
    var line_jan = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y(function(d) { return y_jan(d.expr_jan); });

    var line_gte = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.x_value); })
	.y(function(d) { return y_gte(d.expr_gte); });
    
    var line_tcgan = d3.line()
	.curve(d3.curveBasis)    
	.x(function(d) { return x(d.x_value); })
	.y(function(d) { return y_tcgan(d.expr_tcgan); });
    
    // Define areas (USE THIS FUNCTION TO CORRESPON TO BRUSHES AS WELL
    var area_jan = d3.area()
    	.curve(d3.curveBasis)
    	.x(function(d) { return x(d.x_value); })
    	.y0(height)
    	.y1(function(d) { return y_jan(d.expr_jan); });

    var area_gte = d3.area()
    	.curve(d3.curveBasis)    
	.x(function(d) { return x(d.x_value); })
	.y0(height)
	.y1(function(d) { return y_gte(d.expr_gte); });

    var area_tcgan = d3.area()
    	.curve(d3.curveBasis)    
	.x(function(d) { return x(d.x_value); })
	.y0(height)
	.y1(function(d) { return y_tcgan(d.expr_tcgan); });
    
// var data_chart;
    d3.tsv(expr_tsv_path, type, function(error, data) {

	data_chart = data;


console.log('out func', data_chart);
	// Set domains of y scales
	y_jan.domain([0, d3.max(data_chart, function(d) {return d.expr_jan; })]);
	y_gte.domain([0, d3.max(data_chart, function(d) {return d.expr_gte; })]);
	y_tcgan.domain([0, d3.max(data_chart, function(d) {return d.expr_tcgan; })]);

	// Set domain of x-scale (invariant to all graphs)
	x.domain([0, d3.max(data_chart, function(d) {return d.x_value; })]);

	// Invert x

	var invx = x.invert;

	


	// function brushended(){
	//     if (!d3.event.sourceEvent) return; // only transition after input
	//     if (!d3.event.selection) return; // Ignore empty selections
	//     var d0 = d3.event.selection.map(x.invert),
	// 	d1 = d0.map(x);


	

	   
	// chart_jan.append("g")
	//     .call(brush_jan);
	   // var g = chart_jan.append("g");

	   // brush_jan(g)

	   
	    // .call(brush_jan)
	    // .call(brush_jan.move, [3, 5].map(x))
	    // .selectAll(".overlay")
	    // .each(function(d) {d.type = "selection"; })
	// .on("mousedown touchstart", brushcentered);

	// function brushed_jan() {
	//     var extent = d3.event.selection

	// Add x Axis, line, and area to jan
	chart_jan.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height+ ")")
	    .call(xAxis);

	chart_jan.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + height + ")")
	    .call(yAxis_jan);
	
	// chart_jan.append("path")
	//     .attr("class", "area")
	//     .attr("id", "area_jan")
	//     .attr("d", area_jan([data_chart[1], data_chart[5]]));

	chart_jan.append("path")
	    .attr("class", "line")
	    .attr("id", "line_jan")
	    .attr("d", line_jan(data_chart));

	// Add x Axis, line, and area to gte
	chart_gte.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height+ ")")
	    .call(xAxis);

	chart_gte.append("g")
	    .attr("class", "y axis")
	    .call(yAxis_gte);
	
	chart_gte.append("path")
	    .attr("class", "area")
	    .attr("id", "area_gte")
	    .attr("d", area_gte(data_chart));

	chart_gte.append("path")
	    .attr("class", "line")
	    .attr("id", "line_gte")
	    .attr("d", line_gte(data_chart));
	
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

	// Add brushes
	var brush_jan = d3.brushX()
	    .extent([[0, 0], [width, height]])
	    .on("brush", function(d) {
		// Set input range values accordingly
 		var cur_range = d3.brushSelection(this).map(x.invert);
		d3.select("#input_min_jan").attr("value", round(cur_range[0]));
		d3.select("#input_max_jan").attr("value", round(cur_range[1]));}
	       )
	    .on("end", update_venn);
    

	var brush_gte = d3.brushX()
	    .extent([[0, 0], [width, height]])
	    .on("end", update_venn)
	    .on("brush", function(d) {
		// Set input range values accordingly
 		var cur_range = d3.brushSelection(this).map(x.invert);
		d3.select("#input_min_gte").attr("value", round(cur_range[0]));
		d3.select("#input_max_gte").attr("value", round(cur_range[1]));}
	       )
;// (this))
		// var x_min = x.invert(d3.brushSelection(this)[0]),
		//     x_max = x.invert(d3.brushSelection(this)[1]);
		// console.log(x_min, x_max);


	var brush_tcgan = d3.brushX()
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
	// Append brush to chart_jan
	brush_area_jan = chart_jan.append("g")
	    .attr("class", "brush")
	    .attr("id", "brush_jan")
	    .call(brush_jan)
	    .call(brush_jan.move, [1.6, 13.0].map(x))
	    .selectAll(".overlay")
	    .each(function(d) {d.type = "selection"; })
	    // .on("mousedown touchstart", null);

	chart_gte.append("g")
	    .attr("class", "brush")
	    .attr("id", "brush_gte")	
	    .call(brush_gte)
	    .call(brush_gte.move, [0, 1.8].map(x))
	    .selectAll(".overlay")
	    .each(function(d) {d.type = "selection"; })
	    // .on("mousedown touchstart", null);
	  
	
	chart_tcgan.append("g")
	    .attr("class", "brush")
	    .attr("id", "brush_tcgan")	
	    .call(brush_tcgan)
	    .call(brush_tcgan.move, [6.2, 13.0].map(x))
	    .selectAll(".overlay")
	    .each(function(d) {d.type = "selection"; })
	    // .on("mousedown touchstart", null);

	function brushed() {
	    var cur_range = d3.brushSelection(this).map(x.invert);

	    d3.select("#input_min_jan").attr("value", round(cur_range[0]));
	    d3.select("#input_max_jan").attr("value", round(cur_range[1]));	};	
	// console.log(x_values);

	// WHY DOES THIS NOT WORK?!
	// d3.selectAll("input").on("change", function() {
	//     console.log('changing input')
	//     var ranges = d3.selectAll(".input_range").nodes().map(
	// 	function(e) {
	// 	    return parseFloat(e.value);
	// 	});
	//     var brush_jan = d3.select("#brush_jan");
	//     console.log(d3.select("#div_chart_jan"));
	//     d3.select("#expr_jan").call(brush_jan)
	// 	.call(brush_jan.move, [3, 5].map(x));
	// });


	    


	   // d3.select("").call(brush_jan.move, [0, 1].map(x));
	   // brush_area_jan// make sure to select right div to allow moving, heck bubse
	    // 	.select("#brush_jan").remove()
	    // d3.select("#brush_jan").call(
	    // chart_jan
	    // 	.call(brush_jan)
	    
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
	    $.ajax({
	    	method: "GET",
	    	url: "requests/?conds="+vals_jan[0]+","+vals_jan[1]+"-"+vals_gte[0]+","+vals_gte[1]+"-"+vals_tcgan[0]+","+vals_tcgan[1],
	    	async: false,
	    	success: function(data) {
	    	    // Recieve data in order of set size 1, 4, 6, 7
	    	    console.log(data)
	    	    set_sizes = JSON.parse(data)
		    var sets = [
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
		    d3.select("#venn").datum(sets).call(venn.VennDiagram());
		    var vennDiv = d3.select("#venn");
		    vennDiv.datum(sets).call(venn.VennDiagram());

		    //Add tooltips
		    var tooltip = d3.select("body").append("div")
			.attr("class", "venntooltip");

		    // Add listners to all the groups to display tooltip on mouseover
		    vennDiv.selectAll("g")
			.on("mouseover", function(d, i) {
			    // Sort areas relative to current item
			    // console.log(d.size, i);
			    venn.sortAreas(vennDiv, d);
			    // Display tooltip with current size
			    tooltip.transition().duration(400).style("opacity", 0.9);
			    tooltip.attr("text", d.size+" genes.");
			    //the current path
			    var selection = d3.select(this).transition("tooltip")
				.duration(400).select("path")
				.style("stroke-width", 3)
				.style("fill-opacity", d.sets.length == 1 ? .4: .1)
				.style("stroke-opacity", 1);
			    console.log(tooltip.attr("text"));
			})
			.on("mousemove", function() {
			    tooltip.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			    console.log(d3.event.pageY, d3.event.pageX);
			})
			.on("mouseout", function(d, i) {
			    tooltip.transition().duration(400).style("opacity", 0.9);
			    var selection = d3.select(this).transition("tooltip").duration(400);
			    selection.select("path")
				.style("stroke-width", 0)
				.style("fill-opacity", d.sets.length == 1? .25 : .0)
				.style("stroke-opacity", 0);
			});

		    
	    	},

		
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
