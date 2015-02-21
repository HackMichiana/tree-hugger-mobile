/**
 * Encapsulation is used to define methods that are used in capturing an image.
 * NOTE: Naming convention - $varName, functionName.
 * @returns {Capture.captureAnonym$1}
 */
var Capture = function () {
//  "use strict";

  var $mediaURI = null;// Location of the image on the phone.
  var $cameraOptions = {};// Customizable options on the phone.
  var $audioOptions = {};
  var $videoOptions = {};
  var $ionicPopup = null;
  var $apiKey = '';// Store the api key needed for uploading.

  /**
   * Initialize the environment.
   * @returns {undefined}
   */
  function init() {
    var Camera = Camera || undefined;// Check if Cordova Camera is defined.

    // Only initialize if Cordova Camera is defined.
    if (!_.isUndefined(Camera)) {
      $cameraOptions = {quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA, // .PHOTOLIBRARY, .SAVEDPHOTOALBUM
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 1000,
        targetHeight: 1000,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false};
    }
  }
  init();

  /**
   * Set the api key for uploading.
   * @param {string} key
   * @returns {undefined}
   */
  function setApiKey(key) {
    $apiKey = key;
  }


  // Create an alert if available.
  function showConfirm(title, message, okCallback, nextCallback) {
    if($ionicPopup) {

    } else {
      navigator.notification.confirm(
              title, // message
              onConfirm, // callback to invoke with index of button pressed
              'Game Over', // title
              'Restart,Cancel'          // buttonLabels
              );
    }
  }

  function nativeAlert(index) {
    if(index) {
      nextCallback();
    } else {
      okCallback();
    }
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
   * Set where the image uri resides.
   * @param {string} URI
   * @returns {undefined}
   */
  function setMediaURI(URI) {
    $mediaURI = URI;
  }

  // Image capture error callback.
  function imageCaptureError(error) {
    var msg = 'Error occured while taking photo: ' + error.code;
    showAlert('Oooops!', msg, null);
  }

// Video capture error callback.
  function videoCaptureError(error) {
    var msg = 'Error occured while taking video: ' + error.code;
    showAlert('Oooops!', msg, null);
  }

// Call device image capture.
  function captureImage(success_callback, error_callback, options) {
    var settings = $.extend($cameraOptions, options);
    // navigator.device.capture.captureImage(success_callback, error_callback, settings);
    navigator.camera.getPicture(success_callback, error_callback, settings);
  }

  function captureAudio(success_callback, error_callback, options) {
    var settings = $.extend($audioOptions, options);
    navigator.device.capture.captureAudio(success_callback, error_callback, settings);
  }

  function captureVideo(success_callback, error_callback, options) {
    var settings = $.extend($videoOptions, options);
    navigator.device.capture.captureVideo(success_callback, error_callback, settings);
  }

// Camera capture.
  function cameraCaptureImage(success_callback, error_callback, options) {
    var settings = $.extend($cameraOptions, options);
    navigator.camera.getPicture(success_callback, error_callback, settings);
  }

  /**
   *
   * @param {type} url
   * @param {type} params
   * @param {type} success_callback
   * @param {type} error_callback
   * @returns {undefined}
   */
  function upload(url, params, success_callback, error_callback) {
    var options = new FileUploadOptions();
    options.fileKey="media";

    options.fileName=$mediaURI.substr($mediaURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";
    options.params = params;

    var headers={'Authorization': $apiKey};
    options.headers = headers;

    var ft = new FileTransfer();
    ft.upload($mediaURI, encodeURI(url), success_callback, error_callback, options);
  }


  return {
    captureImage      : captureImage,
    captureAudio      : captureAudio,
    captureVideo      : captureVideo,
    cameraCaptureImage: cameraCaptureImage,
    setMediaURI       : setMediaURI,
    upload            : upload,
    setApiKey         : setApiKey
  };

};
