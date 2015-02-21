var app = angular.module('app', ['ionic'], function ($httpProvider) {
  // http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function (obj) {
    var query = '',
      name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [
    function (data) {
      return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});

app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl'
    }).state('logout', {
      url: '/logout',
      templateUrl: 'templates/logout.html',
      controller: 'LogoutCtrl'
    }).state('main', {
      url: '/main',
      templateUrl: 'templates/main.html',
      abstract: true,
      controller: 'MainCtrl'
    }).state('main.trees', {
      url: '/trees',
      views: {
        'main': {
          templateUrl: 'templates/trees.html',
          controller: 'TreesCtrl'
        }
      }
    }).state('main.addtree', {
      url: '/trees/add',
      views: {
        'main': {
          templateUrl: 'templates/treeadd.html',
          controller: 'TreeAddCtrl'
        }
      }
    }).state('main.edittree', {
      url: '/trees/:tree_id/edit',
      views: {
        'main': {
          templateUrl: 'templates/treeedit.html',
          controller: 'TreeEditCtrl'
        }
      }
    }).state('main.tree', {
      url: '/trees/:tree_id',
      views: {
        'main': {
          templateUrl: 'templates/tree.html',
          controller: 'TreeCtrl'
        }
      }
    }).state('main.takePhoto', {
      url: '/boards/:board_id/challenges/:challenge_id/takePhoto',
      views: {
        'main': {
          templateUrl: 'templates/takePhoto.html',
          controller: 'TakePhotoCtrl'
        }
      }
    });

    // If nothing, always go to the home page.
    $urlRouterProvider.otherwise("/");
  }]);

app.factory('Capture', Capture);
app.factory('AppConfig', AppConfig);
app.factory('ConnectionManager', ['$http', '$ionicPopup', 'AppConfig', ConnectionManager]);

app.controller('HomeCtrl', ['$scope', '$state', '$http', '$ionicPopup', '$ionicLoading', 'ConnectionManager',
  function ($scope, $state, $http, $ionicPopup, $ionicLoading, ConnectionManager) {
    $scope.title = "Hug A Tree Today";

    var conn = ConnectionManager;
    conn.init($scope);

    $scope.signIn = function () {
      $state.go('main.trees');
      return;
      
      // Make the signin button into a spinner.
      $ionicLoading.show({template: 'Signing in...'});

      // Check if there is a connection.
      if (!conn.hasNetworkConnection()) {
        $ionicLoading.hide();
        return;
      }

      conn.success(function (data, status, headers, config) {
        // If error, then not authenticated.
        if (data.error) {
          conn.showAlert('Login Error!', data.message);
        } else {
          conn.setApiKey(data.user.email + ', ' + data.user.api_key);
          $state.go('main.boards');
        }
      });

      conn.error(function (data, status, headers, config) {
        conn.showAlert('Login Error!', 'Error when loggin in.');
      });

      conn.finished(function() {
        $ionicLoading.hide();
      });

      conn.ajax({
        method: 'POST',
        url: '/user/api/authenticate/',
        data: {
          identifier: $('#identifier').val(),
          password: $('#password').val()
        }
      }, false);
    };
  }]).controller('LogoutCtrl', ['$scope', '$state', '$http', '$ionicPopup', 'ConnectionManager',
  function ($scope, $state, $http, $ionicPopup, ConnectionManager) {
    $scope.title = "Welcome to engage";
    var conn = ConnectionManager;
    conn.init($scope);
    conn.clearApiKey();

    $state.go('home');
  }]).controller('MainCtrl', ['$scope',
  function ($scope) {
    $scope.title = "Main";
  }]).controller('TreesCtrl', ['$scope', '$state', '$http', '$ionicPopup', '$ionicLoading', 'ConnectionManager',
  function ($scope, $state, $http, $ionicPopup, $ionicLoading, ConnectionManager) {
    $scope.title = 'My Trees';
    $scope.treeList = [];

    var conn = ConnectionManager;
    conn.init($scope);

    $scope.reload = function () {
      $ionicLoading.show({
        template: 'Loading...'
      });

      conn.success(function (data, status, headers, config) {
        $scope.boardList = data.userboard_list;
      });

      conn.error(function (data, status, headers, config) {
        conn.showAlert('Board Error', 'Error fetching boards.');
      });

      conn.finished(function () {
        $ionicLoading.hide();
      });

//      conn.ajax({
//        method: 'GET',
//        url: '/engage/api/boards/'
//      }, true);
        $scope.treeList.push({
          'id': 5,
          'name': 'Tree 1'
        });
        $ionicLoading.hide();
    };

    $scope.reload();
  }]).controller('TreeAddCtrl', ['$scope', '$state', '$http', '$ionicPopup', '$stateParams', '$location', '$ionicModal', '$ionicLoading', '$timeout', 'ConnectionManager',
  function ($scope, $state, $http, $ionicPopup, $stateParams, $location, $ionicModal, $ionicLoading, $timeout, ConnectionManager) {
    $scope.title = 'Board';
    $scope.challengeList = [];
    $scope.page = 1;
    $scope.totalPages = 1;
    $scope.board_id = $stateParams.board_id;

    var conn = ConnectionManager;
    conn.init($scope);

    // Show the info popup for the challenge.
    $scope.gpsModal = function (e) {
      $scope.goToChallenge = function (challenge) {
        $scope.modal.hide();
        $location.path('/main/boards/' + challenge.board.id + '/challenges/' + challenge.square.id);
      };

      $scope.modal = $ionicModal.fromTemplateUrl('templates/boardChallengePopup.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.back = function () {
      window.history.go(-1);
    };
    
    $scope.takeTreePhoto = function() {
      
    };
    
    $scope.takeLeafPhoto = function() {
      
    };
    
    $scope.submit = function() {
      
    };
    
  }]).controller('TreeEditCtrl', ['$scope', '$state', '$http', '$ionicPopup', '$stateParams', '$ionicModal', '$ionicLoading', '$timeout', '$ionicTabsDelegate', 'ConnectionManager',
  function ($scope, $state, $http, $ionicPopup, $stateParams, $ionicModal, $ionicLoading, $timeout, $ionicTabsDelegate, ConnectionManager) {
    $scope.title = 'Edit Challenge';
  }]).controller('SideMenuButtonCtrl', ['$scope', '$ionicSideMenuDelegate',
  function ($scope, $ionicSideMenuDelegate) {
    $scope.toggleLeft = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  }]).controller('SideMenuCtrl', ['$scope', '$ionicSideMenuDelegate', '$location',
  function ($scope, $ionicSideMenuDelegate, $location) {
    $scope.goTo = function ($event) {
      $event.preventDefault();
      $location.path($($event.target).attr('href'));
      $ionicSideMenuDelegate.toggleLeft();
    };
  }]);

app.factory('Photo', function () {
  var list_list = [];

  return {
    setList: function (list) {
      list_list = list;
    }
  };
});
