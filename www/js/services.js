angular.module('starter.services', [])
  .service('github', function (Restangular) {
    this.getUser = function() {
      return Restangular.oneUrl('user').get();
    };
    this.getEvents = function() {
      return Restangular.allUrl('events').getList();
    };
    this.getMyUsername = function() {
      return this.getUser().then(function(user){
        return user.login;
      })
    };
    var it = this;
    this.getMyEvents = function() {
      return it.getMyUsername().then(it.getUserEvents);
    };
    this.getUserEvents = function(username) {
      return Restangular.allUrl('users').one(username).getList('events');
    }
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
