angular.module('starter.services', ['royal-hub.processor'])
  .service('github', function (Restangular) {
    var it = this;
    this.getUser = function () {
      return Restangular.one('user').get();
    };
    this.getFollowers = function () {
      return Restangular.one('user').getList('followers');
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
    this.process = function (event) {
      if (!it.cache[event.id]) {
        processor.addEvent(event);
      }
    };

    this.start = function () {

      function processUserEvents(username) {
        $log.info('Process events for user: ' + username);
        //We have just 10 pages by 30 events
        for (var i = 0; i < 10; i++) {
          github.getUserEvents(username, i).then(function (events) {
            if (events.length > 0) {
              $log.info('Processing ' + events.length + ' event(s)');
              events.forEach(it.process);
            }
          });
        }
      }
      github.getUser().then(function(user){
        processUserEvents(user.login);
      });
      github.getFollowers().then(function(followers) {
        followers.forEach(function(follower) {
          processUserEvents(follower.login)
        })
      });
    };

  })

  .run(function(eventPump) {
    eventPump.start();
  })

/**
 * A simple example service that returns some data.
 */
  .factory('Friends', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var friends = [
      {id: 0, name: 'Scruff McGruff'},
      {id: 1, name: 'G.I. Joe'},
      {id: 2, name: 'Miss Frizzle'},
      {id: 3, name: 'Ash Ketchum'}
    ];

    return {
      all: function () {
        return friends;
      },
      get: function (friendId) {
        // Simple index lookup
        return friends[friendId];
      }
    }
  });
