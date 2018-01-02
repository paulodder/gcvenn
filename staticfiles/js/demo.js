$(document).ready(function() {


    var width = 960,
	height = 500;

    var y = d3.scaleLinear()
	.range([height, 0]);    
	// .domain([0, d3.max(data)])


    var chart = d3.select('.chart')
	.attr("width", width)
	.attr("height", height;
    
    d3.tsv(path,  type, function(error, data) {
	y.domain([0, d3.max(data, function(d) {return d.value;})]);
	// chart.attr("height", barHeight * data.length);
	var barWidth = width / data.length;
	
	var bar = chart.selectAll("g")
	    .data(data)
	    .enter().append("g")
	    .attr("transform", function(d, i) {
		return "translate("+i*barWidth+",0)";
	    });

	bar.append("rect")
	    .attr("width", function(d) { return x(d.value); })
	    .attr("height", barHeight - 1);

	bar.append("text")
	    .attr("x", function(d) { return x(d.value) - 3; })
	    .attr("y", barHeight / 2)
	    .attr("dy", ".35em")
	    .text(function(d) {return d.value; });
    });
});

function type(d) {
    d.value = +d.value; // convert string to number repr
    return d;
}
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


		  
