/**
 * Created by eamonnmaguire on 22/09/15.
 */

var PieChart = {};

var data = {};
var color = d3.scale.ordinal().range(['#95A5A5', '#14A085', "#26B99A", "#3B97D3", "#955BA5", '#F0C419', "#F29C1F", "#D25627", "#C03A2B"]);

var width = 300,
        height = 130,
        radius = Math.min(width, height - 10) / 2;


var pie = d3.layout.pie()
        .value(function (d) {
            return d.value;
        })
        .sort(null);

    var arc = d3.svg.arc()
        .innerRadius(radius)
        .outerRadius(radius - 20);

PieChart.render = function (id, chart_data, placement, legend_placement, options) {


    data = chart_data;

    var svg = d3.select(placement).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("class", "pieChart")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var path = svg.selectAll("path")
        .data(pie(chart_data))
        .enter()
        .append("path");

    path.transition()
        .duration(500)
        .attr("fill", function (d, i) {
            return color(d.data.label);
        })
        .attr("d", arc)
        .attr('id', function (d) {
            return d.data.id;
        })
        .each(function (d) {
            this._current = d;
        });

    function draw_legend() {
        d3.select(legend_placement).html('');
        var legend = d3.select(legend_placement).append("ul");
        var group = legend.selectAll(legend_placement + " li").data(chart_data).enter().append("div").attr('class', 'distribution-group');
        group.append('div').attr('class', 'distribution').text(function (d) {
            return d.label
        }).style('color', function (d) {
            return color(d.label)
        });
        group.append('div').attr('class', 'distribution-value').append("span").text(function (d) {
            return d.value
        });
        group.append("div").attr('class', 'cf');
        group.on('mouseover', function (d) {
            d3.selectAll(placement + ' #' + d.id).transition().duration(300)
                .style('stroke-width', 5).style("stroke", function () {
                    return color(d.label)
                });
        });
        group.on('mouseout', function (d) {
            d3.selectAll(placement + ' #' + d.id).transition().duration(300)
                .style('stroke-width', 0);
        });
    }

    draw_legend();

    function change(data) {
        path.data(pie(data)).exit();
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        draw_legend();
    }
}


function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function (t) {
        return arc(i(t));
    };
};