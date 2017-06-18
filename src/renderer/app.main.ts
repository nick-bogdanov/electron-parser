
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// import { bootstrap } from 'angular2/platform/browser';
// import { Component } from 'angular2/core';
// import { NgFor } from 'angular2/common';
// import * as _ from 'lodash'
// import { F_UA } from './f_ua/f_ua.renderer'
// import { shell } from 'electron'

platformBrowserDynamic().bootstrapModule(AppModule);


// angular.module('app', ['ui.bootstrap']).controller('render', ($scope) => {
//     let parse_f_ua = new F_UA('f-ua')


//     parse_f_ua.onUpdateData = (data, args) => {
//         console.log(_.flatten(args))
//         $scope.renderedData = _.flatten(args)
//         $scope.sites[0].parsed = true
//         $scope.loading = false
//         priceToInt($scope.renderedData)
//         $scope.$apply();
//     }

//     parse_f_ua.onSingleDataUpdated = (data, args) => {
//         $scope.streamData.push(args)
//         $scope.streamData = _.flatten($scope.streamData)
//         priceToInt($scope.streamData)
//         $scope.loading = true
//         $scope.$apply()
//     }

//     $scope.exportToExcel = function() {
//         parse_f_ua.export()
//     }


// });

