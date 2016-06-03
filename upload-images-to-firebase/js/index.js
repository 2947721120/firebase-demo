var img2fire = angular.module('img2fire', ['firebase', 'angular.filter']);
img2fire.controller("base64Ctrl", function($scope, $firebaseArray) {
  var ref = new Firebase("https://glowing-inferno-7011.firebaseio.com/img/");
  var img = new Firebase("https://glowing-inferno-7011.firebaseio.com/images/");
  $scope.imgs = $firebaseArray(img);
  var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
  $scope.uploadFile = function() {
    var sFileName = $("#nameImg").val();
    if (sFileName.length > 0) {
      var blnValid = false;
      for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
          blnValid = true;
          var filesSelected = document.getElementById("nameImg").files;
          if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) {
              var textAreaFileContents = document.getElementById(
                "textAreaFileContents"
              );
              $scope.imgs.$add({
                date: Firebase.ServerValue.TIMESTAMP,
                base64: fileLoadedEvent.target.result
              });
            };
            fileReader.readAsDataURL(fileToLoad);
          }
          break;
        }
      }
      if (!blnValid) {
        alert('文件无效');
        return false;
      }
    }
    return true;
  }
  $scope.deleteimg = function(imgid) {
    var misimg = new Firebase("https://luminous-torch-9179.firebaseio.com/images/" + imgid);
    var r = confirm("你想删除此图片 ?");
    if (r == true) {
      misimg.remove();
      var onComplete = function(error) {
        if (error) {
          console.log('无法上传图片');
        } else {
          console.log('该图像是成功上传');
        }
      };
      misimg.remove(onComplete);
    }
  }
});
