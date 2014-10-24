angular.module('starter.controllers', ['restangular', 'starter.services'])

  .controller('DashCtrl', function ($scope, github) {
    $scope.page = 1;
    github.getMyEvents().then(function (events) {
      $scope.events = events;
      var page = function(page) {
        $scope.events.getList({page: page}).then(function (events) {
          $scope.events = events;
        });
      };
      $scope.nextPage = function () {
        page(++$scope.page);
      };
      $scope.prevPage = function () {
        page(--$scope.page);
      };
    });
  })

  .controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
  })

  .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
  })

  .controller('LoginCtrl', function ($scope, auth, store, $location) {
    $scope.login = function () {
      auth.signin({
        authParams: {
          scope: 'openid offline_access',
          device: 'Mobile device'
        }
      }, function (profile, token, accessToken, state, refreshToken) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        store.set('refreshToken', refreshToken);
        $location.path('/');
      }, function () {
        // Error callback
      });
    }
  })

  .controller('AccountCtrl', function ($scope, auth) {
    $scope.auth = auth
  });
