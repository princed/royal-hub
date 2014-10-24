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

  .run(function ($ionicPlatform, $rootScope, auth, store) {
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

    $rootScope.$on('$locationChangeStart', function() {
      if (!auth.isAuthenticated) {
        var token = store.get('token');
        if (token) {
          auth.authenticate(store.get('profile'), token);
        }
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider, RestangularProvider) {

    authProvider.init({
      domain: 'royal-hub.auth0.com',
      clientID: 'qdPCQ9Ksvdz6weZUIbebl5bltmfqqKwi',
      loginState: 'login'
    });

    //jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth, $q) {
    //  var profilePromise = auth.profilePromise;
		//
    //   if (!profilePromise) {
    //     var profileDefer = $q.defer();
    //     profilePromise = profileDefer.promise;
		//
    //     authProvider.on('loginSuccess', function () {
    //       profileDefer.resolve(store.get('profile'))
    //     });
    //     authProvider.on('authenticated', function () {
    //       profileDefer.resolve(store.get('profile'))
    //     });
    //   }
		//
    //  return profilePromise.then(function (profile) {
    //    return profile.identities[0].access_token;
    //  });

    jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
      var profile = auth.profile || store.get('profile');
      var ghToken = profile && profile.identities[0].access_token;

      return ghToken;
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
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        },
        resolve: {
          friends: function(Friends) {
            return Friends.loader
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
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/users');

    RestangularProvider.setBaseUrl('https://api.github.com');

  });

