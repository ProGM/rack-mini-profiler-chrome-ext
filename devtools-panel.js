var iframe = document.getElementsByTagName("iframe")[0];

function parseUrl(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser;
}

if (!chrome || !chrome.devtools) {
  chrome = {
    extension: {
      sendRequest: function(request, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', request.url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
          console.log(e);
          callback(window.URL.createObjectURL(this.response));
        };

        xhr.send();
      }
    },
    devtools: {
      network: {
        onRequestFinished: {
          addListener: function(cb) {
            setTimeout(function() {
              var req = {
                response: {
                  headers: [{value: '[\"5cp9z9nquao9b4xzgiyo\"]', name: "X-MiniProfiler-Ids"}]
                },
                request: {
                  url: 'http://www.foldesk.dev/article.json'
                }
              }
              cb(req);
            }, 0)
          }
        }
      }
    }
  }
}

var app = angular.module('RackMiniProfiler', [])
.config(function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
});

app.controller('RackController', function($scope) {
  $scope.loaded_data = null;
  $scope.urls = [];
  $scope.openUrl = function(url) {
    window.open(url);
  }
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    var headers = request.response.headers;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() == "x-miniprofiler-ids") {
        var ids = JSON.parse(headers[i].value);
        var parsed_url = parseUrl(request.request.url);
        var url = "http://" + parsed_url.host + "/mini-profiler-resources/results?id=" + ids[0];
        $scope.urls.push({
          original_url: request.request.url,
          profile_url: url
        });
      }
    }
    $scope.$apply();
  });
})
