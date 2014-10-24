var module = angular.module('royal-hub.processor', []);

module.provider('processor', function () {
  var listeners = [];
  this.addListener = function (listener) {
    listeners.push(listener);
  };

  var Processor = function () {
    this.addEvent = function (githubEvent) {
      listeners.forEach(function (listener) {
        listener(githubEvent);
      });
    };
  };

  this.$get = function () {
    return new Processor();
  };
});

module.service('rating', function() {
  this.addEvent = function (user, event) {
    // TODO: save and show on a screen
    console.log(user, event);
  };
});

/**
 * Score commits
 */
module.config(function (processorProvider) {
  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'PushEvent') {
      rating.addEvent(githubEvent.actor, {
        type: 'Push',
        points: githubEvent.payload.size,
        message: 'Pushed ' + githubEvent.payload.size,
        timestamp: githubEvent.created_at
      });
    }
  });
});
