var module = angular.module('royal-hub.badges.time', ['royal-hub.processor']);

var badge = function (key, predicate, descr) {
  return function (githubEvent, rating) {
    if (!rating.hasBadge(githubEvent.actor, key)) {
      if (predicate(new Date(githubEvent.created_at))) {
        rating.addBadge(githubEvent.actor, {
          key: key,
          name: descr.name,
          message: descr.message,
          description: descr.description,
          timestamp: githubEvent.created_at
        });
      }
    }
  }
};

/**
 * Nightingale badge
 * Your voice is best heard after 9p.m. At least our logs say so. By the way, after midnight the real fun begins. =)
 */
module.config(function (processorProvider) {
  processorProvider.addListener(badge('nightingale',
    function (created) {
      return created.getHours() >= 21;
    },
    {
      name: 'Nightingale',
      message: 'Your voice is best heard after 9p.m. At least our logs say so. By the way, after midnight the real fun begins. =)',
      description: 'Woot! You\'ve got the \'Nightingale\' badge! Progress to working after midnight and unlock the Owl bage!'
    }));
  processorProvider.addListener(badge('owl',
    function (created) {
      return created.getHours() < 6;
    },
    {
      name: 'Owl',
      message: 'Hoo-hoo! Magic nights just boost your creativity and dilligence!',
      description: 'Hoo-hoo! The night is young and so are you! You are true night citizen.'
    }));
  processorProvider.addListener(badge('early-bird',
    function (created) {
      return created.getHours() > 5 && created.getHours() < 9;
    },
    {
      name: 'Early Bird',
      message: 'The early bird gets the worm! You know this better than anyone else - you are the first here this morning again! =)',
      description: 'The early bird gets the worm! Oh, bon appetite, dear! ;-)'
    }));
});
