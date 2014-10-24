angular.module('starter.controllers', ['restangular', 'starter.services'])

  .controller('DashCtrl', function ($scope, github, rating) {
    $scope.rating = rating.rating;

    $scope.page = 1;
    github.getMyEvents($scope.page).then(function (events) {
      $scope.events = events;
      var page = function (page) {
        github.getMyEvents(page).then(function (events) {
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

  .controller('LoginCtrl', function ($scope, auth, store, $location, $rootScope) {
    $scope.login = function () {
      auth.signin({
        scope: 'openid offline_access name email',
        popup: true,
        connection: 'github',
        device: 'Mobile device'
      }, function (profile, token, accessToken, state, refreshToken) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        store.set('refreshToken', refreshToken);
        $location.path('/');
        $rootScope.logged = true;
      }, function () {
        // Error callback
      });
    }
  })

  .controller('AccountCtrl', function ($scope, auth) {
    $scope.auth = auth
  });
