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
  'pascalprecht.github-adapter'
])

  .run(function ($ionicPlatform, auth) {
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
  })

  .config(function ($stateProvider, $urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider) {

    authProvider.init({
      domain: 'royal-hub.auth0.com',
      clientID: 'qdPCQ9Ksvdz6weZUIbebl5bltmfqqKwi',
      loginState: 'login'
    });

    jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
      var profile = auth.profile || store.get('profile');
      var ghToken = profile && profile.identities[0].access_token;

      return ghToken;
      //var idToken = store.get('token');
      //var refreshToken = store.get('refreshToken');
      //// If no token return null
      //if (!idToken || !refreshToken) {
      //  return null;
      //}
      //// If token is expired, get a new one
      //if (jwtHelper.isTokenExpired(idToken)) {
      //  return auth.refreshIdToken(refreshToken).then(function(idToken) {
      //    store.set('token', idToken);
      //    return idToken;
      //  });
      //} else {
      //  return idToken;
      //}
    }

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
          // This tells Auth0 that this state requires the user to be logged in.
          // If the user isn't logged in and he tries to access this state
          // he'll be redirected to the login page
          requiresLogin: true
        }
      })

      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })

      .state('tab.friends', {
        url: '/friends',
        views: {
          'tab-friends': {
            templateUrl: 'templates/tab-friends.html',
            controller: 'FriendsCtrl'
          }
        }
      })
      .state('tab.friend-detail', {
        url: '/friend/:friendId',
        views: {
          'tab-friends': {
            templateUrl: 'templates/friend-detail.html',
            controller: 'FriendDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  });

