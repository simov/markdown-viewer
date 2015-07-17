
// module
var mdviewer = angular.module('mdviewer', [])

function toArray (obj, key, value) {
  var arr = []
  for (var k in obj) {
    var tmp = {}
    tmp[key] = k
    tmp[value] = obj[k]
    arr.push(tmp)
  }
  return arr
}

function toObject (arr, key, value) {
  var obj = {}
  for (var i=0; i < arr.length; i++) {
    obj[arr[i][key]] = arr[i][value]
  }
  return obj
}

mdviewer.controller('popup', ['$scope', function ($scope) {
  function init () {
    chrome.extension.sendMessage({
      message: 'settings'
    }, function (res) {
      $scope.options = toArray(res.options, 'name', 'enabled')
      
      $scope.themes = chrome.runtime.getManifest().web_accessible_resources
        .filter(function (file) {return file.indexOf('/themes/') == 0})
        .map(function (file) {
          var name = file.replace(/\/themes\/(.*)\.css/,'$1')
          if (name == res.theme) $scope.theme = {name: name}
          return {name: name}
        })

      $scope.raw = res.raw
      $scope.$digest()
    })
  }
  init()
  
  $scope.onOptions = function () {
    chrome.extension.sendMessage({
      message: 'options',
      options: toObject(JSON.parse(angular.toJson($scope.options)), 'name', 'enabled')
    }, function (res) {
      
    })
  }
  $scope.onTheme = function () {
    chrome.extension.sendMessage({
      message: 'theme',
      theme: $scope.theme.name
    }, function (res) {

    })
  }
  $scope.onRaw = function () {
    $scope.raw = !$scope.raw
    chrome.extension.sendMessage({
      message: 'raw',
      raw: $scope.raw
    }, function (res) {
      
    })
  }
  $scope.onDefaults = function () {
    chrome.extension.sendMessage({
      message: 'defaults'
    }, function (res) {
      init()
    })
  }
}])
