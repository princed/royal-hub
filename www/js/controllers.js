angular.module('starter.controllers', ['restangular', 'starter.services', 'ionic'])

  .controller('UsersCtrl', function ($scope, github, rating, $ionicLoading, eventPump) {
    $ionicLoading.show({
      template: '<i class="icon ion-loading-a"></i> Loading...'
    });
    $scope.rating = rating.rating;

    github.getUser().then(function (user) {
      $scope.myLogin = user.login;
    });

    eventPump.promise.then(function () {
      $ionicLoading.hide();
    });

    $scope.doRefresh = function () {
      $ionicLoading.show({
        template: 'Loading...'
      });
      eventPump.start().then(function () {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.getSortedUsers = function () {
      var result = [], user;
      for (var id in $scope.rating) {
        user = $scope.rating[id];

        if (user.user.login === $scope.myLogin) {
          user.user.me = true;
        }

        result.push(user);
      }

      return result.sort(function (a, b) {
        return b.points - a.points;
      })
    }
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

  .controller('AccountCtrl', function ($scope, rating, github, $stateParams) {
    github.getUser($stateParams.userId).then(function (user) {
      $scope.info = rating.getUserRating(user);
      $scope.info.user = user;
      $scope.info.user.me = !$stateParams.userId;
    });
  });
