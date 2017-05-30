// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _ = require('lodash')
const F_UA = require('./sites/f_ua')
const shell = require('electron').shell

let parse_f_ua = new F_UA('f-ua')

angular.module('app', []).controller('render', ($scope) => {
   parse_f_ua.onUpdateData = (data, args) => {
       console.log(_.flatten(args));
       $scope.renderedData = _.flatten(args);
       $scope.$apply();
   }

   $scope.openLink = (link) => {
       shell.openExternal(link);
   }

});

