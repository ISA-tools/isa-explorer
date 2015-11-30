/**
 * Created by eamonnmaguire on 10/12/14.
 */
BioSharing = {};

BioSharing.colors = ["#27AAE1", "#414241", "#939598", "#F7941E", "#009444"];
BioSharing.myColors = function () {
    return d3.scale.ordinal().range(BioSharing.colors);
};

BioSharing.content_dashboard = {

    create_chart: function (position, data_url, type) {

        d3.json(data_url, function (data) {

            nv.addGraph(function () {
                var chart;
                if (type == "bar") {
                    chart = nv.models.discreteBarChart()
                        .x(function (d) {
                            return d.label;
                        })
                        .y(function (d) {
                            return d.value;
                        })
                        .staggerLabels(true)
                        .color(BioSharing.myColors().range());
                } else if (type == "pie") {
                    chart = nv.models.pieChart()
                        .x(function (d) {
                            return d.label + " (" + d.value + ")"
                        })
                        .y(function (d) {
                            return d.value
                        })
                        .showLabels(false)
                        .color(BioSharing.myColors().range());
                }

                d3.select("#" + position + " svg")
                    .datum(data)
                    .transition().duration(350)
                    .call(chart);


                return chart;
            });
        });
    }
};