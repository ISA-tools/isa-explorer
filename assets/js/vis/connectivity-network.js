function mapNodes(nodes) {
    var nodesMap;
    nodesMap = d3.map();
    nodes.forEach(function (n) {
        return nodesMap.set(n.id, n);
    });
    return nodesMap;
}

function showNetwork(div, url, width, height) {

    var svg = d3.select(div).append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([width, height]);

    tooltip = Tooltip("vis-tooltip", 230);

    d3.json(url, function (json) {
        console.log(json);


        nodesMap = mapNodes(json.nodes);
        json.links.forEach(function (l) {
            l.source = nodesMap.get(l.source);
            l.target = nodesMap.get(l.target);
            return console.log("" + l.source.id + "," + l.target.id);
        });

        force
            .nodes(json.nodes)
            .links(json.links)
            .start();

        var link = svg.selectAll(".link")
            .data(json.links)
            .enter().append("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(json.nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        node.append("image")
            .attr("xlink:href", function (d) {
                console.log(d.type)
                if (d.type === "biodbcore") {
                    return "/static/img/vis/biodbcore.png"
                } else if (d.type === "process") {
                    return "/static/img/vis/tag.png"
                } else if (d.type === "terminology artifact") {
                    return "/static/img/vis/icon_terminology.png"
                } else if (d.type === "model/format") {
                    return "/static/img/vis/icon_model_format.png"
                } else if (d.type === "reporting guideline") {
                    return "/static/img/vis/icon_reporting.png"
                }else if (d.type === "material" || d.type === "taxonomy") {
                    return "/static/img/vis/taxonomy.png"
                }else {
                    return "/static/img/vis/tag.png"
                }
            })
            .attr("x", -8)
            .attr("y", -8)
            .attr("width", 25)
            .attr("height", 25);

        node.append("text")
            .attr("dx", 16)
            .attr("dy", ".35em")
            .style("fill", "#414241")
            .text(function (d) {
                return d.name
            });

        showDetails = function (d, i) {
            var content;
            content = '<p class="main">' + d.name + ' (' + d.type + ')</span></p>';
            tooltip.showTooltip(content, d3.event);
            if (link) {
                link.attr("stroke",function (l) {
                    if (l.source === d || l.target === d) {
                        return "#555";
                    } else {
                        return "none";
                    }
                }).attr("stroke-opacity", function (l) {
                        if (l.source === d || l.target === d) {
                            return 1.0;
                        } else {
                            return 0.5;
                        }
                    });
            }
            node.style("stroke",function (n) {
                if (n.searched || neighboring(d, n)) {
                    return "#555";
                } else {
                    return "#414241";
                }
            }).style("stroke-width", function (n) {
                    if (n.searched || neighboring(d, n)) {
                        return 2.0;
                    } else {
                        return 1.0;
                    }
                });
            return d3.select(this).style("stroke", "black").style("stroke-width", 2.0);
        };
        hideDetails = function (d, i) {
            tooltip.hideTooltip();
            node.style("stroke",function (n) {
                if (!n.searched) {
                    return strokeFor(n);
                } else {
                    return "#555";
                }
            }).style("stroke-width", function (n) {
                    if (!n.searched) {
                        return 1.0;
                    } else {
                        return 2.0;
                    }
                });
            if (link) {
                return link.attr("stroke", "#ddd").attr("stroke-opacity", 0.8);
            }
        };

        node.on("mouseover", showDetails).on("mouseout", hideDetails);

        force.on("tick", function () {
            link.attr("x1", function (d) {
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

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    });
}
