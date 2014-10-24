var module = angular.module('royal-hub.processor', []);

module.provider('processor', function () {
  var listeners = [];
  this.addListener = function (listener) {
    listeners.push(listener);
  };

  this.$get = function (rating) {
    return {
      addEvent: function (githubEvent) {
        listeners.forEach(function (listener) {
          listener(githubEvent, rating);
        });
      }
    };
  };
});

module.service('rating', function () {
  this.rating = {};

  this.addEvent = function (githubUser, event) {
    var userRating = this.rating[githubUser.id];
    if (userRating == null) {
      userRating = {
        user: githubUser,
        events: [],
        points: 0
      };
      this.rating[githubUser.id] = userRating;
    }
    userRating.events.push(event);
    userRating.points += event.points;
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
