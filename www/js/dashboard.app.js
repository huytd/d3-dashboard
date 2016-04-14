var app = angular.module('DashboardApp', ['DashboardApp.Directives', 'gridstack-angular']);

app.controller('DashboardCtrl', function($scope) {
    $scope.facility = 'IED';
    $scope.facilities = ['IED', 'INF'];
    $scope.widgets = [
        {
            x: 0, y: 0, width: 5, height: 5,
            dataUrl: '/api/getWPSummary/' + $scope.facility,
            chartName: 'Work Packages by Unit',
            labels: {
                x: 'Unit', y: 'No. of Packages'
            },
            type: 'groupped-bar-chart',
            fitData: function(data) {
                var UNIT_HEADER_INDEX = 1;
                var STEP_HEADER_INDEX = 2;
                var ITEM_HEADER_INDEX = 3;

                return data.QSResponse.QSResponseData.QSRow.reduce(function(arr, item) {
                    if (item !== "") {
                        var header = item.QSColVal[UNIT_HEADER_INDEX].replace(/ /g,'')
                        var step = item.QSColVal[STEP_HEADER_INDEX];
                        var value = item.QSColVal[ITEM_HEADER_INDEX];
                        var target = arr.findIndex(function(tar) { return tar.unit === header });
                        if (target == -1) {
                            return arr.concat({
                                unit: header,
                                steps: [
                                    { key: step, value: value }
                                ]
                            });
                        } else {
                            arr[target].steps.push({ key: step, value: value });
                        }
                    }
                    return arr;
                }, []);
            }
        },
        // {
        //     x: 5, y: 5, width: 5, height: 5,
        //     dataUrl: '/api/getWPCheckout',
        //     chartName: 'Packages Checked on Hourly basis',
        //     labels: {
        //         x: 'Hours', y: 'No. of Checkouts'
        //     },
        //     type: 'bar-chart',
        //     fitData: function(data) {
        //         var IS_CHECKED_OUT_INDEX = 2;
        //         var CHECKED_OUT_INDEX = 4;
        //
        //         return data.QSResponse.QSResponseData.QSRow.reduce(function(arr, item) {
        //             if (item != "") {
        //                 var isCheckedOut = (item.QSColVal[IS_CHECKED_OUT_INDEX] === 'Y');
        //                 if (isCheckedOut) {
        //                     var checkOut = item.QSColVal[CHECKED_OUT_INDEX];
        //                     console.log('Checkout:', item);
        //                     var idx = arr.findIndex(function(e){ return e.key === checkOut });
        //                     if (idx == -1) {
        //                         arr.push({
        //                             key: checkOut,
        //                             value:1
        //                         });
        //                     } else {
        //                         arr[i].value += 1;
        //                     }
        //                 }
        //             }
        //             return arr;
        //         }, []);
        //     }
        // },
    ];

    $scope.changeSource = function() {
        $scope.widgets[0].dataUrl = '/api/getWPSummary/' + $scope.facility;
    }

    var gridMaxWidth = $(".grid-stack").innerWidth();

    $scope.options = {
        verticalMargin : 10,
        cellHeight : gridMaxWidth / 12 - 10,
        enableMove: false,
        enableResize: false
    };

    $scope.addNewWidget = function() {
        $scope.widgets.push({
            x: 0, y: 0,
            width: 2, height: 2,
            autoLayout: 1
        });
    };

    $scope.removeWidget = function(w) {
        var index = $scope.widgets.indexOf(w);
        $scope.widgets.splice(index, 1);
    };
});
