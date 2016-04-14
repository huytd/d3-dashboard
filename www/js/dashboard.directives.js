var directives = angular.module('DashboardApp.Directives', ['d3']);

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

                    var width = d3.select(element[0]).node().offsetWidth - 200;
                    var height = d3.select(element[0]).node().offsetHeight - 80;

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
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
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

                    svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(0," + height + ")")
                          .call(xAxis)
                          .append("text")
                          .attr("x", width / 2)
                          .attr("dy", "40px")
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
                          .on("mouseover", function(d, i) {
                              var className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                              console.log('in className: ', className, $(".rect-" + className));
                              $(".text-" + className).show();
                          })
                          .on("mouseout", function(d, i) {
                              var className = d.key.replace(/( |\/)/g, '_').toLowerCase();
                              console.log('out className: ', className, $(".rect-" + className));
                              $(".text-" + className).hide();
                          })
                          .attr("width", x1.rangeBand())
                          .attr("x", function(d) { return x1(d.key); })
                          .attr("y", function(d) { return height; })
                          .attr("height", function(d) { return 0; })
                          .style("fill", function(d) { return color(d.key); })
                          .transition()
                          .duration(500)
                          .attr("height", function(d) { return height - y(d.value); })
                          .attr("y", function(d) { return y(d.value); })

                    unit.selectAll("text")
                        .data(function(d) { return d.steps; })
                        .enter().append("text")
                        .attr("x", function(d) { return x1(d.key) + 2; })
                        .attr("y", function(d) { return y(d.value) - 8; })
                        .style("text-anchor", "center")
                        .style("display", "none")
                        .text(function(d) { return d.value; })
                        .attr("class", function(d) { return "text-" + d.key.replace(/( |\/)/g, '_').toLowerCase(); })

                    var legend = svg.selectAll(".legend")
                            .data(totalSteps.slice().reverse())
                          .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i) { return "translate(140," + i * 20 + ")"; });

                        legend.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", color);

                        legend.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor", "end")
                            .text(function(d) { return d; })
                            .on("mouseover", function(d, i) {
                                var className = d.replace(/( |\/)/g, '_').toLowerCase();
                                console.log('in className: ', className, $(".rect-" + className));
                                $(".text-" + className).show();
                            })
                            .on("mouseout", function(d, i) {
                                var className = d.replace(/( |\/)/g, '_').toLowerCase();
                                console.log('out className: ', className, $(".rect-" + className));
                                $(".text-" + className).hide();
                            })
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

                var width = d3.select(element[0]).node().offsetWidth - 60;
                var height = d3.select(element[0]).node().offsetHeight - 60;

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

                scope.render = function(data) {
                    // svg.selectAll('*').remove()
                    if (!data) return;

                    console.log(data);
                }
            });
        }
    }
});