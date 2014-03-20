var d3 = require('d3')

module.exports=barChart
function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 70, left: 160},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        yaxis = d3.svg.axis().orient("left"),
        brush = d3.svg.brush(),
        brushDirty,
        data,
        key,
        value,
        xlabel,
        ylabel,
        formatNumber = d3.format(",d");

    function chart(div) {
        var width = x.range()[1],
            height = y.range()[0];


        var minx=data[data.length-1][key]
          ,maxx=data[0][key]

        data.forEach(function(val,idx){
            if(val.value > 0){
                minx = val[key] < minx ? val[key] : minx
                maxx = val[key] > maxx ? val[key] : maxx
            }
        });

        y.domain([0, group.top(1)[0].value]);
        x.domain([minx,maxx])

        axis.scale(x);
        brush.x(x);

        yaxis.scale(y);


        div.each(function() {
            var div = d3.select(this),
                g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("a")
                .attr("href", "javascript:reset(" + id + ")")
                .attr("class", "reset")
                .text("reset")
                .style("display", "none");

                if(sumgroup){
                    //var sums = sumgroup.all()

                    div.select(".total").append("span")
                    .attr("class","value")
                    .text(formatNumber(Math.floor(sumgroup.value())))
                    // console.log('reduce way'+
                    //             sums.reduce(function(memo,item,idx,arr){
                    //                 return memo + item.value;
                    //             },0)
                    //            )

                }
                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                .attr("id", "clip-" + id)
                .append("rect")
                .attr("width", width)
                .attr("height", height);

                g.selectAll(".bar")
                .data(["background", "foreground"])
                .enter().append("path")
                .attr("class", function(d) { return d + " bar"; })
                .datum(group.all());

                g.selectAll(".foreground.bar")
                .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(axis);

                // Add the y-axis.
                g.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0,0)")
                .call(yaxis);

                if(xlabel){
                    g.append('g')
                    .attr('class', 'x axis label')
                    .attr('transform', 'translate('+(width/2)+',' + (height+margin.top+margin.bottom/2) + ')')
                    .append('svg:text')
                    .style('stroke','none')
                    .attr('text-anchor', 'middle')
                    .text(xlabel);

                }
                if(ylabel){
                    g.append('g')
                    .attr('class', 'y axis label')
                    .attr('transform', 'translate('+(-margin.left/2)+',' + (height/2) + ') rotate(-90)')
                    .append('svg:text')
                    .style('stroke','none')
                    .attr('text-anchor', 'middle')
                    .text(ylabel);

                }
                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }else{
                // redraw the xaxis
                g.select("g.axis")
                .call(axis);
                g.select("g.y.axis")
                .call(yaxis);

                if(sumgroup){
                    // recalculate the summation
                    div.select(".total>.value")
                    .text(formatNumber(Math.floor(sumgroup.value())))
                }

            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", 0)
                    .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                barWidth = n/width,
                d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d[key]), ",", height, "V", y(d.value), "h",barWidth,"V", height);
            }
            return path.join("");
        }

        function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y
                 + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                 + "V" + (2 * y - 6)
                 + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                 + "Z"
                 + "M" + (2.5 * x) + "," + (y + 8)
                 + "V" + (2 * y - 8)
                 + "M" + (4.5 * x) + "," + (y + 8)
                 + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function() {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
                   .call(brush.extent(extent = extent.map(round)))
                   .selectAll(".resize")
                   .style("display", null);
        g.select("#clip-" + id + " rect")
        .attr("x", x(extent[0]))
        .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
                                     if (brush.empty()) {
                                         var div = d3.select(this.parentNode.parentNode.parentNode);
                                         div.select(".title a").style("display", "none");
                                         div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                                         dimension.filterAll();
                                     }
                                 });

    chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
};

    chart.x = function(_) {
                        if (!arguments.length) return x;
                        x = _;
                        axis.scale(x);
                        brush.x(x);
                        return chart;
                    };
    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        yaxis.scale(y);
       return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.data = function(_) {
                          if (!arguments.length) return data;
                          data = _;
                          return chart;
                      };

    // which field is the key, or x value
    chart.key = function(_) {
                          if (!arguments.length) return key;
                          key = _;
                          return chart;
                      };

    // which field is the value, or y value in the chart
    chart.value = function(_) {
                          if (!arguments.length) return value;
                          value = _;
                          return chart;
                      };

    chart.xlabel = function(_) {
        if (!arguments.length) return xlabel;
        xlabel = _;
        return chart;
    };


    chart.ylabel = function(_) {
        if (!arguments.length) return ylabel;
        ylabel = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
}
