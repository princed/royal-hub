angular.module('starter.controllers', ['restangular', 'starter.services'])

  .controller('DashCtrl', function ($scope, github) {
    github.getMyEvents().then(function(events) {
      $scope.user = events;
    });
  })

  .controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
  })

  .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })

  .controller('LoginCtrl', function($scope, auth, store, $location) {
    $scope.login = function() {
      auth.signin({
        authParams: {
          scope: 'openid offline_access',
          device: 'Mobile device'
        }
      }, function(profile, token, accessToken, state, refreshToken) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        store.set('refreshToken', refreshToken);
        $location.path('/');
      }, function() {
        // Error callback
      });
    }
  })

.controller('AccountCtrl', function($scope, auth) {
    $scope.auth = auth
});