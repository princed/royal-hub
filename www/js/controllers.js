angular.module('starter.controllers', ['restangular', 'starter.services'])

  .controller('DashCtrl', function ($scope, github, processor, rating) {
    $scope.page = 1;
    github.getMyEvents($scope.page).then(function (events) {
      $scope.events = events;
      events.forEach(function (event) {
        processor.addEvent(event);
      });
      $scope.rating = rating.rating;
      var page = function(page) {
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
  .run(function(processor) {
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
