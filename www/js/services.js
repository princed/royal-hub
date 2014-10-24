angular.module('starter.services', ['royal-hub.processor'])
  .service('github', function (Restangular) {
    var it = this;
    this.getUser = function (id) {
      return Restangular.one('user', id).get();
    };
    this.getFollowers = function () {
      return Restangular.one('user').getList('followers');
    };
    this.getFollowing = function () {
      return Restangular.one('user').getList('following');
    };
    this.getEvents = function () {
      return Restangular.all('events').getList();
    };
    this.getMyUsername = function () {
      return this.getUser().then(function (user) {
        return user.login;
      })
    };
    this.getMyEvents = function (page) {
      return it.getMyUsername().then(function (username) {
        return it.getUserEvents(username, page);
      });
    };
    this.getUserEvents = function (username, page) {
      // All pages are shifted
      page = page || 0;
      return Restangular.all('users').one(username).getList('events', {page: page + 1});
    }
  })

  .service('eventPump', function (github, processor, $log, $q) {
    var it = this;
    this.cache = {};
    this.users = {};
    this.process = function (event) {
      if (!it.cache[event.id]) {
        processor.addEvent(event);
        it.cache[event.id] = true;
      }
    };

    var processUserEvents = function (username) {
      if (it.users[username]) return;
      $log.info('Process events for user: ' + username);
      var eventPromises = [];

      //We have just 10 pages by 30 events
      for (var i = 0; i < 10; i++) {
        eventPromises.push(github.getUserEvents(username, i));
      }
      $q.all(eventPromises).then(function (resolved) {
        var totalProcessed = 0;
        resolved.forEach(function (events) {
          if (events.length > 0) {
            totalProcessed += events.length;
            events.forEach(it.process);
          }
        });
        $log.info('Processing ' + totalProcessed + ' event(s) for user ' + username);
      });
      it.users[username] = username;
    };


    this.start = function () {
      github.getUser().then(function (user) {
        $log.info('My username: ' + user.login);
        processUserEvents(user.login);
      });
      github.getFollowers().then(function (users) {
        users.forEach(function (user) {
          $log.info('My follower: ' + user.login);
          processUserEvents(user.login)
        })
      });
      github.getFollowing().then(function (users) {
        users.forEach(function (user) {
          $log.info('I follow: ' + user.login);
          processUserEvents(user.login)
        })
      });
    };

  })

  .run(function (eventPump) {
    eventPump.start();
  })

/**
 * A simple example service that returns some data.
 */
  .factory('Friends', function (github) {
    // Some fake testing data
    var friends = [];

    var loader = github.getFollowing();
    loader.then(function (users) {
      friends = users;
    });

    return {
      all: function () {
        return friends;
      },
      get: function (friendId) {
        // Simple index lookup
        return friends[friendId];
      },
      loader: loader
    }
  })

  .filter('len', function () {
    return function (object) {
      if (!object) {
        return 0;
      }
      var cnt = 0;
      for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
          cnt++;
        }
      }
      return cnt;
    }
  });
