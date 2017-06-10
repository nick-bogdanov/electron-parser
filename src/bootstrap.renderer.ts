const _ = require('lodash')
const F_UA = require('./sites/f_ua')
const shell = require('electron').shell

angular.module('app', ['ui.bootstrap']).controller('render', ($scope) => {
    let parse_f_ua = new F_UA('f-ua')

    $scope.sites = [{
        name: 'f-ua',
        label: 'f.ua категория для авто',
        parsed: false
    }];

    $scope.streamData = []
    $scope.loading = false

    parse_f_ua.onUpdateData = (data, args) => {
        console.log(_.flatten(args))
        $scope.renderedData = _.flatten(args)
        $scope.sites[0].parsed = true
        $scope.loading = false
        priceToInt($scope.renderedData)
        $scope.$apply();
    }

    parse_f_ua.onSingleDataUpdated = (data, args) => {
        $scope.streamData.push(args)
        $scope.streamData = _.flatten($scope.streamData)
        priceToInt($scope.streamData)
        $scope.loading = true
        $scope.$apply()
    }

    $scope.openLink = (link) => {
        shell.openExternal(link)
    }

    $scope.parse = function () {
        $scope.sites[0].parsed = 'loading'
        return parse_f_ua.$releaseTheBeast()
    }

    $scope.exportToExcel = function() {
        parse_f_ua.export()
    }

    function priceToInt(data) {
        angular.forEach(data, element => {
            element.priceNumber = parseInt(element.priceNumber)
        });
    }

});

