/**
 * Give information about the network.
 */
var Network = function () {
  var $public = {};
  var $private = {};
  
  var connection_states = {};
  connection_states[Connection.UNKNOWN] = 'Unknown connection';
  connection_states[Connection.ETHERNET] = 'Ethernet connection';
  connection_states[Connection.WIFI] = 'WiFi connection';
  connection_states[Connection.CELL_2G] = 'Cell 2G connection';
  connection_states[Connection.CELL_3G] = 'Cell 3G connection';
  connection_states[Connection.CELL_4G] = 'Cell 4G connection';
  connection_states[Connection.NONE] = 'No network connection';

  $private.init = function() {
    var networkState = navigator.network.connection.type;
  };
  $private.init();

// Show user warning that using device in this.

// Check if there is a connection. If there isn't one, do the callback.
  $public.isConnected = function(callback) {
    if (navigator.network.connection.type === Connection.NONE) {
      if (callback !== undefined) {
        callback();
      } else {
        var msg = "You are not connected to the network!";
        navigator.notification.alert(msg, null, 'Oooops!');
      }
    }
  };

// Call this when device has gone online.
  function connection_online() {
    // Unblock.
  }

// Call this when device has gone offline.
  function connection_offline() {
    // Block.
  }
  
  return $public;

};