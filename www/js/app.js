// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.services',
  'auth0',
  'angular-storage',
  'angular-jwt',
  'royal-hub.badges.time'
])

  .run(function ($ionicPlatform, $rootScope, auth, store, $location) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    // This hooks al auth events to check everything as soon as the app starts
    auth.hookEvents();

    $rootScope.$on('$locationChangeStart', function () {
      if (!auth.isAuthenticated) {
        var token = store.get('token');
        if (token) {
          $rootScope.logged = true;
          auth.authenticate(store.get('profile'), token);
        }
      }
    });

    $rootScope.signout = function () {
      $rootScope.logged = false;
      auth.signout();
      store.remove('profile');
      store.remove('token');
      store.remove('refreshToken');
      $location.path('/login');
    };
  })

  .config(function ($stateProvider, $urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider, RestangularProvider) {

    authProvider.init({
      domain: 'royal-hub.auth0.com',
      clientID: 'qdPCQ9Ksvdz6weZUIbebl5bltmfqqKwi',
      loginState: 'login'
    });

    jwtInterceptorProvider.tokenGetter = function(store, config, jwtHelper, auth, $q) {
      var profilePromise = auth.profilePromise;

      if (!profilePromise) {

        var profileDefer = $q.defer();
        profilePromise = profileDefer.promise;

        // This hooks al auth events to check everything as soon as the app starts
        if(config.url.indexOf('https://api.github.com') !== 0) {
          return null;
        }
        var profile = auth.profile || store.get('profile');
        if(profile){
          profileDefer.resolve(profile);
        }

        authProvider.on('loginSuccess',
          function($location, profilePromise) {
            console.log("Login Success");
            profilePromise.then(function(profile) {
              profileDefer.resolve(profile);
            });
          });
      }

      return profilePromise.then(function (profile) {
        return profile.identities[0].access_token;
      });
    };

    $httpProvider.interceptors.push('jwtInterceptor');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html",
        data: {
          requiresLogin: true
        }
      })

      // Each tab has its own nav history stack:

      .state('tab.users', {
        url: '/users',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'UsersCtrl'
          }
        }
      })

      .state('tab.users-detail', {
        url: '/users/:userId',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        },
        resolve: {
          friends: function (Friends) {
            return Friends.loader
          }
        }
      })

      .state('tab.users-detail-events', {
        url: '/users/:userId/events',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-events.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/me',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.account-events', {
        url: '/events',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-events.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/users');

    RestangularProvider.setBaseUrl('https://api.github.com');

  });

