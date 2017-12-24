$(document).ready(function() {
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
    

    d3.tsv(expr_tsv_path, type, function(error, data) {
	// Set domains of y scales
	y_jan.domain([0, d3.max(data, function(d) {return d.expr_jan; })]);
	y_gte.domain([0, d3.max(data, function(d) {return d.expr_gte; })]);
	y_tcgan.domain([0, d3.max(data, function(d) {return d.expr_tcgan; })]);

	// Set domain of x-scale (invariant to all graphs)
	x.domain([0, d3.max(data, function(d) {return d.x_value; })]);

	// Add x Axis, line, and area to jan
	chart_jan.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height+ ")")
	    .call(xAxis);

	chart_jan.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + height + ")")
	    .call(yAxis_jan);
	
	chart_jan.append("path")
	    .attr("class", "area")
	    .attr("id", "area_jan")
	    .attr("d", area_jan(data));

	chart_jan.append("path")
	    .attr("class", "line")
	    .attr("id", "line_jan")
	    .attr("d", line_jan(data));

	// Add x Axis, line, and area to gte
	chart_gte.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height+ ")")
	    .call(xAxis);

	chart_gte.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + height + ")")
	    .call(yAxis_gte);
	
	chart_gte.append("path")
	    .attr("class", "area")
	    .attr("id", "area_gte")
	    .attr("d", area_gte(data));

	chart_gte.append("path")
	    .attr("class", "line")
	    .attr("id", "line_gte")
	    .attr("d", line_gte(data));
	
	// Add x Axis, line, and area to tcgan
	chart_tcgan.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height+ ")")
	    .call(xAxis);

	chart_tcgan.append("g")
	    .attr("class", "y axis")
	    // .attr("transform", "translate(0," + height + ")")
	    .call(yAxis_tcgan);
	
	chart_tcgan.append("path")
	    .attr("class", "area")
	    .attr("id", "area_tcgan")
	    .attr("d", area_tcgan(data));

	chart_tcgan.append("path")
	    .attr("class", "line")
	    .attr("id", "line_tcgan")
	    .attr("d", line_tcgan(data));

	// Add Y axis

    })
});
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

