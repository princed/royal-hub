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
  this.badges = {};

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

  this.addBadge = function (githubUser, badge) {
    this.addEvent(githubUser, {
      type: 'Badge',
      badge: badge.key,
      points: 5,
      message: badge.message,
      timestamp: badge.timestamp
    });
    var userBadges = this.badges[githubUser.id];
    if (userBadges == null) {
      userBadges = {};
      this.badges[githubUser.id] = userBadges;
    }
    userBadges[badge.key] = true;
  };

  this.hasBadge = function(githubUser, badgeKey) {
    var userBadges = this.badges[githubUser.id];
    return !!(userBadges && userBadges[badgeKey]);
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
        message: 'Pushed ' + githubEvent.payload.size + ' commit(s)',
        timestamp: githubEvent.created_at
      });
    }
  });
});

/**
 * Leo Tolstoy badge
 */
module.config(function (processorProvider) {
  var LONG_COMMIT_MESSAGE_LENGTH = 400;
  var BADGE_KEY = 'tolstoy';

  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'PushEvent' && !rating.hasBadge(githubEvent.actor, BADGE_KEY)) {
      githubEvent.payload.commits.forEach(function (commit) {
        if (commit.message && commit.message.length > LONG_COMMIT_MESSAGE_LENGTH) {
          rating.addBadge(githubEvent.actor, {
            key: BADGE_KEY,
            message: 'Got badge Leo Tolstoy for the commit comment: ' + commit.message,
            timestamp: githubEvent.created_at
          });
        }
      });
    }
  });
});

/**
 * Ouroboros badge
 */
module.config(function (processorProvider) {
  var LONG_COMMIT_MESSAGE_LENGTH = 400;
  var BADGE_KEY = 'ouroboros';

  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'IssuesEvent' && !rating.hasBadge(githubEvent.actor, BADGE_KEY)) {
      var issue = githubEvent.payload.issue;
      //
      //if (issue.message && commit.message.length > LONG_COMMIT_MESSAGE_LENGTH) {
      //  rating.addBadge(githubEvent.actor, {
      //    key: BADGE_KEY,
      //    message: 'Got badge Leo Tolstoy for the commit comment: ' + commit.message,
      //    timestamp: githubEvent.created_at
      //  });
      //}

    }
  });
});
