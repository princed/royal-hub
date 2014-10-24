angular.module('starter.services', ['royal-hub.processor'])
  .service('github', function (Restangular) {
    this.getUser = function () {
      return Restangular.oneUrl('user').get();
    };
    this.getEvents = function () {
      return Restangular.allUrl('events').getList();
    };
    this.getMyUsername = function () {
      return this.getUser().then(function (user) {
        return user.login;
      })
    };
    var it = this;
    this.getMyEvents = function (page) {
      return it.getMyUsername().then(function (username) {
        return it.getUserEvents(username, page);
      });
    };
    this.getUserEvents = function (username, page) {
      page = page || 1;
      return Restangular.allUrl('users').one(username).getList('events', {page: page});
    }
  })

  .service('eventPump', function (github, processor, $log) {
    var it = this;
    this.cache = {};
    this.process = function (event) {
      if (!it.cache[event.id]) {
        processor.addEvent(event);
      }
    };

    this.start = function () {
      $log.info('Start processing events.');
      //We have just 10 pages by 30 events
      for (var i = 1; i < 11; i++) {
        github.getMyEvents(i).then(function (events) {
          if (events.length > 0) {
            $log.info('Processing ' + events.length + ' event(s)');
            events.forEach(it.process);
          }
        });

      }
      $log.info('Finish processing events.');
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
