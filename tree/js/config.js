var AppConfig = function() {
  $public = {};
  $env = 'qa';
  $host = '';

  var init = function() {
    if($env === 'production') {
      $host = 'http://engage.minilabs.co';
    } else if($env === 'qa') {
      $host = 'http://localhost:8000';
    } else {
      $host = 'http://localhost';
    }

    if(_.isUndefined(window.navigator.network)) {
      $host = 'http://localhost:8000';
    } else {
      $host = 'http://redbk.com';
    }
  };
  init();

  $public.getHost = function() {
    return $host;
  };

  return $public;
};
