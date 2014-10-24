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
    userRating.badges[badge.key] = {
      name: badge.name,
      description: badge.description
    };
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
 * Score issue resolve
 */
module.config(function (processorProvider) {
  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'IssuesEvent' && githubEvent.payload.action === 'closed') {
      rating.addEvent(githubEvent.actor, {
        type: 'IssueResolve',
        points: 3,
        message: 'Resolved issue ' + githubEvent.payload.issue.title,
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
            name: 'Leo Tolstoy',
            message: 'You know how to put words together! Ah, classic!',
            description: 'That commit comment is a true masterpiece. It deserves its own award, but we better praise you, the author!',
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
          name: 'Ouroboros',
          message: 'All by myself\' is your motto! You create tasks for yourself and you fix them.',
          description: 'All by myself is your motto! You create tasks for yourself and you fix them. And if not you who?',
          timestamp: githubEvent.created_at
        });
      }
    }
  });
});

/**
 * Route 66 badge
 * User made 66 commits
 */
module.config(function (processorProvider) {
  var BADGE_KEY = 'route66';

  var user2commits = {};

  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'PushEvent' && !rating.hasBadge(githubEvent.actor, BADGE_KEY)) {
      var currentRide = user2commits[githubEvent.actor.id] || 0;
      currentRide += githubEvent.payload.size;
      if (currentRide >= 66) {
        delete user2commits[githubEvent.actor.id];
        rating.addBadge(githubEvent.actor, {
          key: BADGE_KEY,
          name: 'Route 66',
          message: 'Hey, mate, 66 commits! Wow, what a ride!',
          description: 'It\'s your 66th commit! What a ride!',
          timestamp: githubEvent.created_at
        });
      } else {
        user2commits[githubEvent.actor.id] = currentRide;
      }
    }
  });
});

/**
 * Plague doctor
 * Resolved 10 issues
 */
module.config(function (processorProvider) {
  var BADGE_KEY = 'plague-doctor';

  var user2resolves = {};

  processorProvider.addListener(function (githubEvent, rating) {
    if (githubEvent.type === 'IssuesEvent' && !rating.hasBadge(githubEvent.actor, BADGE_KEY)) {
      var currentRide = user2resolves[githubEvent.actor.id] || 0;
      currentRide ++;
      if (currentRide >= 10) {
        delete user2resolves[githubEvent.actor.id];
        rating.addBadge(githubEvent.actor, {
          key: BADGE_KEY,
          name: 'Plague Doctor',
          message: 'You fixed 10 issues. The likes of you will save us from this plague.',
          description: 'You fix and heal non-stop to finish this plague!',
          timestamp: githubEvent.created_at
        });
      } else {
        user2resolves[githubEvent.actor.id] = currentRide;
      }
    }
  });
});
