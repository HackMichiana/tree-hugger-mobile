var ConnectionManager = function($http, $ionicPopup, AppConfig) {
  var $env = 'dev';
  var $host = '';
  var $http = $http || null;// Angularjs $http passed in on object creation.
  var $authenticate = true;// If this session needs to be authenticated.
  var $scope = null;// Angularjs $scope.
  var $ionicPopup = $ionicPopup || null;// Angularjs $ionicPopup

  var successCallback = null;
  var errorCallback = null;
  var finishedCallback = null;

  // Create object.
//  function create(ionic_scope, ionic_http, ionic_popup) {
//    var obj = Object.create(ConnectionManager);
//    obj.scope = ionic_scope;
//    obj.http = ionic_http;
//    obj.ionicPopup = ionic_popup;
//    return obj;
//  }

  function init(scope) {
    $host = AppConfig.getHost();
    $scope = scope;
  }

  function getFullPath(relative_path) {
    return $host + relative_path;
  }

  function getHost() {
    return $host;
  }

  /**
   * Create an ionicPopup or native alert if ionic not available.
   * @param {string} title
   * @param {string} message
   * @param {string} dismissCallback
   * @returns {undefined}
   */
  function showAlert(title, message, dismissCallback) {
    var dismissCallback = dismissCallback | null;

    if($ionicPopup) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
      alertPopup.then(function (res) {
        if(dismissCallback) {
          dismissCallback();
        }
      });
    } else {
      window.navigator.notification.alert(
              message, // message
              dismissCallback, // callback
              title, // title
              'Ok' // buttonName
              );
    }
  }

  /**
   *
   * @returns {Boolean}
   */
  function hasNetworkConnection() {
    // If network is undefined, then we are not on phone, so return true.
    if(_.isUndefined(window.navigator.network)) {
      return true;
    }

    // Check that they at least have a connection.
    if(window.navigator.network.connection.type === window.Connection.NONE) {
      showAlert('Error!!!', 'You have no network connection!');
      return false;
    }

    return true;
  }

  function noNetwork() {
    var hasNetwork = hasNetworkConnection();

    if(hasNetwork) {
      return true;
    } else {
      showAlert('Oooops!', 'You have no network!');
      return false;
    }
  }

  // Return the api key.
  function getApiKey() {
    return localStorage.getItem('api_key');
  }

  // Set the api key.
  function setApiKey(api_key) {
    localStorage.setItem('api_key', api_key);
  }

  // Clear the api key. Alias to set_api_key.
  function clearApiKey() {
    setApiKey('');
  }

  // ??General authorization key for the api.
  function getAuthorizationKey() {
    return localStorage.getItem('api_key');
  }

  // If the user is logged in.
  function isLoggedIn() {
    return (getApiKey()) ? true : false;
  }

  // Combine the host and the relative url.
  function site(url) {
    return $host + url;
  }

  // Success function that should be overriden.
  function success(callback) {
    successCallback = callback || null;
  }

  // Error function that should be overriden.
  function error(callback) {
    errorCallback = callback || null;
  }

  /**
   * Used name instead of finally.
   * @returns {undefined}
   */
  function finished(callback) {
    finishedCallback = callback || null;
  }

  /**
   * Set the Authorization headers.
   * @returns {undefined}
   */
  function authenticationRequired() {
    $http.defaults.headers.common.Authorization = getApiKey();
  }
  
  function build_get_query(url, data) {
    if(_.isObject(data) && data !== {}) {
      url += '?';
      
      _.each(data, function(val, key) {
        url += key + '=' + val + '&';
      });
    }
    
    return url;
  }

  function ajax(options, authenticate) {
    var self = this;
    var authenticate = authenticate || true;

    if(authenticate) {
      authenticationRequired();
    }

    // Define the default options.
    var ajax_defaults = {
      url: '/',
      method: 'GET',
      data: {},
      timeout: 10000
    };

    // Merge the settings.
    var settings = $.extend(ajax_defaults, options);
    
    var url = site(settings.url);
    var method = settings.method.toUpperCase();
    
    // Build the get query.
    if(method === 'GET') {
      url = build_get_query(url, settings.data);
    }

    // Perform the ajax operation.
    var request = $http({
      url: url,
      method: method,
      data: settings.data
    });

    request.success(function(data, status, headers, config) {
      if(successCallback) {
        successCallback(data, status, headers, config);
      } else {
        alert('Success');
      }
    });

    request.error(function(data, status, headers, config) {
      if(errorCallback) {
        errorCallback(data, status, headers, config);
      } else {
        alert('Error');
      }
    });

    request.finally(function() {
      if(finishedCallback) {
        finishedCallback();
      }
    });
  }

  return {
    init      : init,
    setApiKey: setApiKey,
    isLoggedIn: isLoggedIn,
    clearApiKey: clearApiKey,
    hasNetworkConnection: hasNetworkConnection,
    success: success,
    error: error,
    finished: finished,
    ajax: ajax,
    showAlert: showAlert,
    getFullPath: getFullPath,
    getHost: getHost,
    getApiKey: getApiKey
  };

};
