var module = angular.module('royal-hub.processor', []);

module.provider('processor', function () {
  var listeners = [];
  this.addListener = function (listener) {
    listeners.push(listener);
  };

  var Processor = function () {
    this.addEvent = function (event) {
      listeners.forEach(function (listener) {
        listener(event);
      });
    };
  };

  this.$get = function () {
    return new Processor();
  };
});

module.service('rating', function() {
  this.addEvent = function (user, activity) {
    // TODO: save and show on a screen
    console.log(user, activity);
  };
});

/**
 * Score commits
 */
module.config(function (processorProvider) {
  processorProvider.addListener(function (githubEvent) {
  });
});
