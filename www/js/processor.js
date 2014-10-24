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

  this.getUserRating = function (githubUser) {
    var userRating = this.rating[githubUser.id];
    if (userRating == null) {
      userRating = {
        user: githubUser,
        events: [],
        badges: {},
        points: 0
      };
      this.rating[githubUser.id] = userRating;
    }
    return userRating;
  };

  this.addEvent = function (githubUser, event) {
    var userRating = this.getUserRating(githubUser);
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
    var userRating = this.getUserRating(githubUser);
    userRating.badges[badge.key] = true;
  };

  this.hasBadge = function (githubUser, badgeKey) {
    var userRating = this.rating[githubUser.id];
    return !!(userRating && userRating.badges[badgeKey]);
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
 * User has committed smth with a long message
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
 * User has created an issue for herself
 */
module.config(function (processorProvider) {
  var BADGE_KEY = 'ouroboros';

  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'IssuesEvent' && !rating.hasBadge(githubEvent.actor, BADGE_KEY)) {
      var issue = githubEvent.payload.issue;
      var assignee = issue.assignee;
      if (githubEvent.payload.action === 'opened'&& assignee && issue.user.id === assignee.id) {
        rating.addBadge(githubEvent.actor, {
          key: BADGE_KEY,
          message: 'Got badge Ouroboros for an issue assigned to himself',
          timestamp: githubEvent.created_at
        });
      }
    }
  });
});
