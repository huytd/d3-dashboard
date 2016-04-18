var directives = angular.module('DashboardApp.Directives', ['d3']);

function google_colors(n) {
    var colores_g = ["#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}

directives.directive('pieChart', function(d3Service, $http) {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        link: function(scope, element, attr) {
            d3Service.d3().then(function(d3) {
                var svg = d3.select(element[0])
                    .append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .append("g")
                    .attr("transform", "translate(40, 30)");

                scope.reload = function() {
                    // Loading data
                    console.log(scope.source);
                    $http.get(scope.source.dataUrl)
                         .then(function(result) {
                             console.log('Data Return:', result);
                             if (scope.source.fitData) {
                                scope.data = scope.source.fitData(result.data);
                                console.log(scope.data);
                                scope.render(scope.data);
                             }
                         });
                }

                scope.$watchCollection(function() {
                    return [scope.source.width, scope.source.height, scope.source.dataUrl];
                }, function() {
                    console.log(scope.source.width);
                    scope.reload();
                });

                scope.render = function(data) {
                    svg.selectAll('*').remove()

                    var width = d3.select(element[0]).node().offsetWidth - 60;
                    var height = d3.select(element[0]).node().offsetHeight - 60;
                    var r = ((width < height) ? width : height) * 0.5;

                    svg.attr("width", width)
                        .attr("height", height);

                    if (!data) return;

                    var color = d3.scale.category20();
                    function arcTween(a) {
                      var i = d3.interpolate(this._current, a);
                      this._current = i(0);
                      return function(t) {
                        return arc(i(t));
                      };
                    }
                    var pie = d3.layout.pie().value(function(d){ return d.value; });
                    var arc = d3.svg.arc().outerRadius(r);
                    var g = svg.data([data]).append("g").attr("class", "holder")
                                .attr("transform", "translate(" + (width / 2) + ", " + (height / 2 + 10) + ")")
                    var arcs = g.selectAll('g.slice')
                                    .data(pie)
                                    .enter()
                                    .append("g")
                                    .attr("class", "slice");

                    var path = arcs.append("path")
                        .attr("fill", function(d, i){
                            return color(d.data.key);
                            //return google_colors(i);
                        })
                        .attr("d", function (d) {
                            // log the result of the arc generator to show how cool it is :)
                            console.log(arc(d));
                            return arc(d);
                        })
                        .transition().duration(800)
                        .attrTween('d', function(d) {
                           var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                           return function(t) {
                               d.endAngle = i(t);
                             return arc(d);
                           }
                        })


                    arcs.append("text").attr("transform", function(d){
            			d.innerRadius = 0;
            			d.outerRadius = r;
                        return "translate(" + arc.centroid(d) + ")";
                    })
                    .attr("text-anchor", "middle").text( function(d, i) {
                        return data[i].key;
                    })
                    .attr("font-size", "1.2em")
                    .attr("fill", "#FFF");

                    var legendPanel = svg.append("g");

                    var legend = legendPanel
                                .selectAll(".legend")
                                .data(pie)
                                .enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", function(d, i) {
                                return color(d.data.key)
                                //return google_colors(i);
                            });

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d.data.key; })
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut);

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("dy", "-10px")
                        .style("text-anchor", "middle")
                        .style("font-weight", "bold")
                        .style("font-size", "1.2em")
                        .text(scope.source.chartName);

                    function mouseOver(d, i) { }
                    function mouseOut(d, i) { }
                }
            });
        }
    }
});

directives.directive('horizontalBarChart', function(d3Service, $http) {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        link: function(scope, element, attr) {
            d3Service.d3().then(function(d3) {
                var svg = d3.select(element[0])
                    .append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .append("g")
                    .attr("transform", "translate(40, 30)");

                scope.reload = function() {
                    // Loading data
                    console.log(scope.source);
                    $http.get(scope.source.dataUrl)
                         .then(function(result) {
                             console.log('Data Return:', result);
                             if (scope.source.fitData) {
                                scope.data = scope.source.fitData(result.data);
                                console.log(scope.data);
                                scope.render(scope.data);
                             }
                         });
                }

                scope.$watchCollection(function() {
                    return [scope.source.width, scope.source.height, scope.source.dataUrl];
                }, function() {
                    console.log(scope.source.width);
                    scope.reload();
                });

                scope.render = function(data) {
                    svg.selectAll('*').remove()

                    var width = d3.select(element[0]).node().offsetWidth - 60;
                    var height = d3.select(element[0]).node().offsetHeight - 60;

                    svg.attr("width", width)
                        .attr("height", height);

                    if (!data) return;

                    var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.5);
                    var x = d3.scale.linear().range([0, width]);
                    var color = d3.scale.category20();

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(2)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickSize(2);

                    y.domain(data.map(function(d) { return d.key; }));
                    x.domain([0, d3.max(data, function(d) { return d.value; })]);

                    svg.selectAll("line.horizontalGrid").data(x.ticks(10)).enter()
                        .append("line")
                            .attr(
                            {
                                "class":"horizontalGrid",
                                "y1" : 10,
                                "y2" : width,
                                "x1" : function(d){ return x(d);},
                                "x2" : function(d){ return x(d);},
                                "fill" : "none",
                                "shape-rendering" : "crispEdges",
                                "stroke" : "#EEE",
                                "stroke-width" : "1px"
                            })
                            .style("stroke-dasharray", ("5, 3"))

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("dy", "-10px")
                        .style("text-anchor", "middle")
                        .style("font-weight", "bold")
                        .style("font-size", "1.2em")
                        .text(scope.source.chartName);

                    svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                          .attr("x", width)
                          .attr("dy", "20px")
                          .style("text-anchor", "end")
                          .style("font-weight", "bold")
                          .text(scope.source.labels.x);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0)
                        .attr("dy", "-20px")
                        .style("text-anchor", "end")
                        .text(scope.source.labels.y);

                    var rects = svg.append("g")
                            .selectAll("rect")
                            .data(data)
                            .enter().append("rect")
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut)
                            .attr("height", y.rangeBand())
                            .attr("y", function(d) { return y(d.key); })
                            .attr("x", function(d) { return 0; })
                            .attr("width", function(d) { return 0; })
                            .style("fill", function(d) { return color(d.key); })
                            .transition()
                            .duration(function(d) { return 200 + d.value * 100; })
                            .attr("width", function(d) { return x(d.value); });

                    svg.append("g")
                        .selectAll("text")
                        .data(data)
                        .enter().append("text")
                        .attr("y", function(d) { return y(d.key) + y.rangeBand() / 2; })
                        .attr("x", function(d) { return x(d.value) - 8; })
                        .style("text-anchor", "middle")
                        .style("stroke", function(d) { return color(d.key) })
                        .style("stroke-width", "1px")
                        .style("display", "none")
                        .text(function(d) { return d.key; });

                    var legendPanel = svg.append("g");

                    var legend = legendPanel
                                .selectAll(".legend")
                                .data(data)
                                .enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", function(d) { return color(d.key) });

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d.key; })
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut);

                    function mouseOver(d, i) {

                    }

                    function mouseOut(d, i) {

                    }
                }
            });
        }
    }
});

directives.directive('horizontalGrouppedBarChart', function(d3Service, $http) {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        link: function(scope, element, attr) {
            d3Service.d3().then(function(d3) {
                var svg = d3.select(element[0])
                    .append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .append("g")
                    .attr("transform", "translate(50, 30)");

                scope.reload = function() {
                    // Loading data
                    console.log(scope.source);
                    $http.get(scope.source.dataUrl)
                         .then(function(result) {
                             console.log('Data Return:', result);
                             if (scope.source.fitData) {
                                scope.data = scope.source.fitData(result.data);
                                scope.render(scope.data);
                             }
                         });
                }

                scope.$watchCollection(function() {
                    return [scope.source.width, scope.source.height, scope.source.dataUrl];
                }, function() {
                    console.log(scope.source.width);
                    scope.reload();
                });

                scope.render = function(data) {
                    svg.selectAll('*').remove()

                    var width = d3.select(element[0]).node().offsetWidth - 60;
                    var height = d3.select(element[0]).node().offsetHeight - 60;

                    svg.attr("width", width)
                        .attr("height", height);

                    if (!data) return;

                    var y0 = d3.scale.ordinal().rangeRoundBands([0, height], 0.1);
                    var y1 = d3.scale.ordinal();
                    var x = d3.scale.linear().range([0, width]);
                    //var color = d3.scale.ordinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);
                    var color = d3.scale.category20();

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(2)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y0)
                        .orient("left")
                        .tickSize(2)

                    y0.domain(data.map(function(d) {
                        console.log("D:", d);
                        return d.unit;
                    }));

                    var totalSteps = data.reduce(function(arr, d) {
                        for (var i = 0; i < d.steps.length; i++) {
                            if (arr.indexOf(d.steps[i].key) == -1) {
                                arr.push(d.steps[i].key);
                            }
                        }
                        return arr;
                    }, []);

                    y1.domain(totalSteps).rangeRoundBands([0, y0.rangeBand()]);
                    x.domain([0, d3.max(data, function(d) { return d3.max(d.steps, function(d) { return d.value; }); })]);

                    svg.selectAll("line.horizontalGrid").data(x.ticks(10)).enter()
                        .append("line")
                            .attr(
                            {
                                "class":"horizontalGrid",
                                "y1" : 10,
                                "y2" : width,
                                "x1" : function(d){ return x(d);},
                                "x2" : function(d){ return x(d);},
                                "fill" : "none",
                                "shape-rendering" : "crispEdges",
                                "stroke" : "#EEE",
                                "stroke-width" : "1px"
                            })
                            .style("stroke-dasharray", ("5, 3"))

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("dy", "-10px")
                        .style("text-anchor", "middle")
                        .style("font-weight", "bold")
                        .style("font-size", "1.2em")
                        .text(scope.source.chartName);

                    svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                          .attr("x", width)
                          .attr("dy", "20px")
                          .style("text-anchor", "end")
                          .style("font-weight", "bold")
                          .text(scope.source.labels.x);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0)
                        .attr("dy", "-20px")
                        .style("text-anchor", "end")
                        .text(scope.source.labels.y);

                    var unit = svg.selectAll(".unit")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "unit")
                        .attr("transform", function(d) { return "translate(0, " + y0(d.unit) + ")"; });

                    var rects = unit.selectAll("rect")
                          .data(function(d) { return d.steps; })
                          .enter().append("rect")
                          .attr("class", function(d) { return "bars rect-" + d.key.replace(/( |\/)/g, '_').toLowerCase(); })
                          .on("mouseover", mouseOver)
                          .on("mouseout", mouseOut)
                          .attr("height", y1.rangeBand())
                          .attr("y", function(d) { return y1(d.key); })
                          .attr("x", function(d) { return 0; })
                          .attr("width", function(d) { return 0; })
                          .style("fill", function(d) { return color(d.key); })
                          .transition()
                          .duration(function(d) { return 200 + d.value * 100; })
                          .attr("width", function(d) { return x(d.value); });

                    unit.selectAll("text")
                        .data(function(d) { return d.steps; })
                        .enter().append("text")
                        .attr("y", function(d) { return y1(d.key) + 10; })
                        .attr("x", function(d) { return x(d.value) + 15; })
                        .style("text-anchor", "end")
                        .style("stroke", function(d) { return color(d.key) })
                        .style("stroke-width", "1px")
                        .style("display", "none")
                        .text(function(d) { return d.value; })
                        .attr("class", function(d) { return "text-" + d.key.replace(/( |\/)/g, '_').toLowerCase(); })

                    var legendPanel = svg.append("g")
                                .attr("transform", "translate(0, " +  (height - 230) + ")")

                    var legend = legendPanel
                                .selectAll(".legend")
                                .data(totalSteps.slice().reverse())
                                .enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", color);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .attr("class", function(d) { return "legend-" + d.replace(/( |\/)/g, '_').toLowerCase(); })
                            .style("text-anchor", "end")
                            .text(function(d) { return d; })
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut);

                    function mouseOver(d, i) {
                        var className = "";
                        if (typeof d === "string") {
                            className = d.replace(/( |\/)/g, '_').toLowerCase();
                        } else {
                            className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                        }
                        $(".text-" + className).show();
                        $(".legend-" + className).attr("class", "legend-" + className + " highlight");
                        $(".rect-" + className).attr("class", "rect-" + className + " bar highlight");
                    }

                    function mouseOut(d, i) {
                        var className = "";
                        if (typeof d === "string") {
                            className = d.replace(/( |\/)/g, '_').toLowerCase();
                        } else {
                            className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                        }
                        $(".text-" + className).hide();
                        $(".legend-" + className).attr("class", "legend-" + className);
                        $(".rect-" + className).attr("class", "rect-" + className);
                    }
                }
            });
        }
    }
});

directives.directive('grouppedBarChart', function(d3Service, $http) {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        link: function(scope, element, attr) {
            d3Service.d3().then(function(d3) {
                var svg = d3.select(element[0])
                    .append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .append("g")
                    .attr("transform", "translate(50, 30)");

                scope.reload = function() {
                    // Loading data
                    console.log(scope.source);
                    $http.get(scope.source.dataUrl)
                         .then(function(result) {
                             console.log('Data Return:', result);
                             if (scope.source.fitData) {
                                scope.data = scope.source.fitData(result.data);
                                scope.render(scope.data);
                             }
                         });
                }

                scope.$watchCollection(function() {
                    return [scope.source.width, scope.source.height, scope.source.dataUrl];
                }, function() {
                    console.log(scope.source.width);
                    scope.reload();
                });

                scope.render = function(data) {
                    svg.selectAll('*').remove()

                    var width = d3.select(element[0]).node().offsetWidth - 60;
                    var height = d3.select(element[0]).node().offsetHeight - 60;

                    svg.attr("width", width)
                        .attr("height", height);

                    if (!data) return;

                    var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
                    var x1 = d3.scale.ordinal();
                    var y = d3.scale.linear().range([height, 0]);
                    //var color = d3.scale.ordinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]);
                    var color = d3.scale.category20();

                    var xAxis = d3.svg.axis()
                        .scale(x0)
                        .tickSize(2)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickSize(2)
                        .tickFormat(d3.format(".2s"));

                    x0.domain(data.map(function(d) {
                        console.log("D:", d);
                        return d.unit;
                    }));

                    var totalSteps = data.reduce(function(arr, d) {
                        for (var i = 0; i < d.steps.length; i++) {
                            if (arr.indexOf(d.steps[i].key) == -1) {
                                arr.push(d.steps[i].key);
                            }
                        }
                        return arr;
                    }, []);

                    x1.domain(totalSteps).rangeRoundBands([0, x0.rangeBand()]);
                    y.domain([0, d3.max(data, function(d) { return d3.max(d.steps, function(d) { return d.value; }); })]);

                    svg.selectAll("line.horizontalGrid").data(y.ticks(10)).enter()
                        .append("line")
                            .attr(
                            {
                                "class":"horizontalGrid",
                                "x1" : 10,
                                "x2" : width,
                                "y1" : function(d){ return y(d);},
                                "y2" : function(d){ return y(d);},
                                "fill" : "none",
                                "shape-rendering" : "crispEdges",
                                "stroke" : "#EEE",
                                "stroke-width" : "1px"
                            })
                            .style("stroke-dasharray", ("5, 3"))

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("dy", "-10px")
                        .style("text-anchor", "middle")
                        .style("font-weight", "bold")
                        .style("font-size", "1.2em")
                        .text(scope.source.chartName);

                    svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                          .attr("x", width)
                          .attr("dy", "20px")
                          .style("text-anchor", "end")
                          .style("font-weight", "bold")
                          .text(scope.source.labels.x);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0)
                        .attr("dy", "20px")
                        .style("text-anchor", "end")
                        .text(scope.source.labels.y);

                    var unit = svg.selectAll(".unit")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "unit")
                        .attr("transform", function(d) { return "translate(" + x0(d.unit) + ",0)"; });

                    var rects = unit.selectAll("rect")
                          .data(function(d) { return d.steps; })
                          .enter().append("rect")
                          .attr("class", function(d) { return "bars rect-" + d.key.replace(/( |\/)/g, '_').toLowerCase(); })
                          .on("mouseover", mouseOver)
                          .on("mouseout", mouseOut)
                          .attr("width", x1.rangeBand())
                          .attr("x", function(d) { return x1(d.key); })
                          .attr("y", function(d) { return height; })
                          .attr("height", function(d) { return 0; })
                          .style("fill", function(d) { return color(d.key); })
                          .transition()
                          .duration(function(d) { return 200 + d.value * 100; })
                          .attr("height", function(d) { return height - y(d.value); })
                          .attr("y", function(d) { return y(d.value); })

                    unit.selectAll("text")
                        .data(function(d) { return d.steps; })
                        .enter().append("text")
                        .attr("x", function(d) { return x1(d.key) + x1.rangeBand() / 2; })
                        .attr("y", function(d) { return y(d.value) - 8; })
                        .style("text-anchor", "middle")
                        .style("stroke", function(d) { return color(d.key) })
                        .style("stroke-width", "1px")
                        .style("display", "none")
                        .text(function(d) { return d.value; })
                        .attr("class", function(d) { return "text-" + d.key.replace(/( |\/)/g, '_').toLowerCase(); })

                    var legendPanel = svg.append("g");

                    var legend = legendPanel
                                .selectAll(".legend")
                                .data(totalSteps.slice().reverse())
                                .enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", color);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .attr("class", function(d) { return "legend-" + d.replace(/( |\/)/g, '_').toLowerCase(); })
                            .style("text-anchor", "end")
                            .text(function(d) { return d; })
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut);

                    function mouseOver(d, i) {
                        var className = "";
                        if (typeof d === "string") {
                            className = d.replace(/( |\/)/g, '_').toLowerCase();
                        } else {
                            className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                        }
                        $(".text-" + className).show();
                        $(".legend-" + className).attr("class", "legend-" + className + " highlight");
                        $(".rect-" + className).attr("class", "rect-" + className + " bar highlight");
                    }

                    function mouseOut(d, i) {
                        var className = "";
                        if (typeof d === "string") {
                            className = d.replace(/( |\/)/g, '_').toLowerCase();
                        } else {
                            className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                        }
                        $(".text-" + className).hide();
                        $(".legend-" + className).attr("class", "legend-" + className);
                        $(".rect-" + className).attr("class", "rect-" + className);
                    }
                }
            });
        }
    }
});

directives.directive('barChart', function(d3Service, $http) {
    return {
        restrict: 'E',
        scope: {
            source: '='
        },
        link: function(scope, element, attr) {
            d3Service.d3().then(function(d3) {
                var svg = d3.select(element[0])
                    .append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .append("g")
                    .attr("transform", "translate(50, 30)");

                scope.reload = function() {
                    // Loading data
                    console.log(scope.source);
                    $http.get(scope.source.dataUrl)
                         .then(function(result) {
                             console.log('Data Return:', result);
                             if (scope.source.fitData) {
                                scope.data = scope.source.fitData(result.data);
                                console.log(scope.data);
                                scope.render(scope.data);
                             }
                         });
                }

                scope.$watchCollection(function() {
                    return [scope.source.width, scope.source.height, scope.source.dataUrl];
                }, function() {
                    console.log(scope.source.width);
                    scope.reload();
                });

                scope.render = function(data) {
                    svg.selectAll('*').remove()

                    var width = d3.select(element[0]).node().offsetWidth - 60;
                    var height = d3.select(element[0]).node().offsetHeight - 60;

                    svg.attr("width", width)
                        .attr("height", height);

                    if (!data) return;

                    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.5);
                    var y = d3.scale.linear().range([height, 0]);
                    var color = d3.scale.category20();

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .tickSize(2)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickSize(2)
                        .tickFormat(d3.format(".2s"));

                    x.domain(data.map(function(d) { return d.key; }));
                    y.domain([0, d3.max(data, function(d) { return d.value; })]);

                    svg.selectAll("line.horizontalGrid").data(y.ticks(10)).enter()
                        .append("line")
                            .attr(
                            {
                                "class":"horizontalGrid",
                                "x1" : 10,
                                "x2" : width,
                                "y1" : function(d){ return y(d);},
                                "y2" : function(d){ return y(d);},
                                "fill" : "none",
                                "shape-rendering" : "crispEdges",
                                "stroke" : "#EEE",
                                "stroke-width" : "1px"
                            })
                            .style("stroke-dasharray", ("5, 3"))

                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("dy", "-10px")
                        .style("text-anchor", "middle")
                        .style("font-weight", "bold")
                        .style("font-size", "1.2em")
                        .text(scope.source.chartName);

                    svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                          .attr("x", width)
                          .attr("dy", "20px")
                          .style("text-anchor", "end")
                          .style("font-weight", "bold")
                          .text(scope.source.labels.x);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0)
                        .attr("dy", "20px")
                        .style("text-anchor", "end")
                        .text(scope.source.labels.y);

                    var rects = svg.append("g")
                            .selectAll("rect")
                            .data(data)
                            .enter().append("rect")
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut)
                            .attr("width", x.rangeBand())
                            .attr("x", function(d) { return x(d.key); })
                            .attr("y", function(d) { return height; })
                            .attr("height", function(d) { return 0; })
                            .style("fill", function(d) { return color(d.key); })
                            .transition()
                            .duration(function(d) { return 200 + d.value * 100; })
                            .attr("height", function(d) { return height - y(d.value); })
                            .attr("y", function(d) { return y(d.value); })

                    svg.append("g")
                        .selectAll("text")
                        .data(data)
                        .enter().append("text")
                        .attr("x", function(d) { return x(d.key) + x.rangeBand() / 2; })
                        .attr("y", function(d) { return y(d.value) - 8; })
                        .style("text-anchor", "middle")
                        .style("stroke", function(d) { return color(d.key) })
                        .style("stroke-width", "1px")
                        .style("display", "none")
                        .text(function(d) { return d.key; });

                    var legendPanel = svg.append("g");

                    var legend = legendPanel
                                .selectAll(".legend")
                                .data(data)
                                .enter().append("g")
                                .attr("class", "legend")
                                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", function(d) { return color(d.key) });

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d.key; })
                            .on("mouseover", mouseOver)
                            .on("mouseout", mouseOut);

                    function mouseOver(d, i) {

                    }

                    function mouseOut(d, i) {

                    }
                }
            });
        }
    }
});
