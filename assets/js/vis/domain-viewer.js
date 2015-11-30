function createNetworkVisualization(url, placement, width, height, magnify, removeFilter) {

    if (!magnify) {
        magnify = 1.5;
    }
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json'
    }).done(function (data) {
            console.log(data);
            $(placement).html('');

            var filterLevel = removeFilter ? 0 : data.filterLevel;

            var graph = data;

            var force = d3.layout.force()
                .nodes(graph.nodes)
                .links(graph.links)
                .size([width, height])
                .linkDistance(20 * magnify)
                .charge(-60)
                .on("tick", tick)
                .start();


            var svg = d3.select(placement).append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.behavior.zoom().on("zoom", update));


            var link = svg.selectAll(".link")
                .data(force.links())
                .enter().append("line")
                .attr("class", "link");


            var node = svg.selectAll(".node")
                .data(force.nodes())
                .enter().append("g")
                .attr("class", "node")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .call(force.drag);

            node.append("circle")
                .attr("r", function (d) {
                    return Math.sqrt(d.count) * magnify;
                })
                .style("fill", function (d) {
                    if (d.group == "Domain") {
                        return "#27AAE1";
                    } else if (d.group == "Standard") {
                        return "#F15A29";
                    } else {
                        return "#414241";
                    }
                });

            node.append("text")
                .attr("x", 12)
                .attr("dy", ".35em")
                .text(function (d) {

                    if (d.showLabel && d.count > 5) return d.name + " (" + d.count + ")";
                })
                .style("fill", function (d) {
                    if (d.group == "Domain") {
                        return "#27AAE1";
                    } else {
                        return "#414241";
                    }

                })
                .style("stroke", "none");

            if (magnify == 1.5) {
                var brush = svg.append("g")
                    .attr("class", "brush")
                    .call(d3.svg.brush()
                        .x(d3.scale.identity().domain([0, width]))
                        .y(d3.scale.identity().domain([0, height]))
                        .on("brush", function () {
                            var extent = d3.event.target.extent();
                            var domains = "";
                            node.select("circle").classed("selected", function (d) {
                                if (extent[0][0] <= d.x && d.x < extent[1][0] && extent[0][1] <= d.y && d.y < extent[1][1]) {
                                    if (d.group == "Domain") {
                                        domains += d.name + ",";
                                    }
                                    return true;
                                }
                                return false;
                            });
                            createNetworkVisualization('/visualization/domain-network/' + domains, '#detailViewContainer', 450, 300, 3, true);

                        }));
            } else {
                // show detail table
                showDetailTable(data.nodes, '#detailTableContainer');
            }

            function update() {
                svg.attr("transform", " scale(" + d3.event.scale + ")");
            }


            function tick() {
                link
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
            }

            function mouseover() {
                d3.select(this).select("circle").transition()
                    .duration(750)
                    .attr("r", function (d) {
                        console.log(d.name);
                        return Math.sqrt(d.count * 2) * magnify;
                    });
            }

            function mouseout() {
                d3.select(this).select("circle").transition()
                    .duration(750)
                    .attr("r", function (d) {
                        return Math.sqrt(d.count) * magnify;
                    });
            }
        }

    );
}

function showDetailTable(data, placement) {

    var html = '<table class="table table-hover">';

    var terminologies = 0;
    var formats = 0;
    var checklists = 0;

    for (var dataIndex in data) {
        var dataItem = data[dataIndex];

        if (dataItem.group != "Domain") {
            console.log(dataItem.type);
            color = "#27AAE1";
            if(dataItem.type=="terminology artifact") {
                terminologies += 1;
                color = "#27AAE1";
            } else if(dataItem.type=="reporting guideline") {
                checklists += 1;
                color = "#414241";
            } else {
                formats += 1;
                color = "#F15A29";
            }
            html += '<tr>';
            html += '<td style="color:' + color +'">' + dataItem.name + '</td>';
            html += '<td><a href="' + dataItem.biosharingId + '" target="_blank">' + dataItem.biosharingId + '</a></td>';
            html += '</tr>';
        }
    }

    html += '</table>';

    var top = '<br/><br/><p align="left" style="font-weight:lighter; text-transform:uppercase; font-size: 1.2em"><span style="color:#27AAE1"><strong>' + terminologies + ' </strong> terminology artifacts</span><br/><span style="color:#F15A29"><strong>' + formats + '</strong> model/formats</span><br/><span style="color:#414241"><strong>' + checklists + '</strong> reporting guidelines</span></p>';


    html = top + html;
    $(placement).html(html);
}


