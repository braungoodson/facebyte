var facebyte = angular.module('facebyte',['ngRoute']);
facebyte.config(['$routeProvider',function($routeProvider){
	$routeProvider.when('/views/home',{
		templateUrl: 'views/home'
	});
	$routeProvider.when('/views/users/read',{
		templateUrl: 'views/users/read'
	});
	$routeProvider.when('/views/users/create',{
		templateUrl: 'views/users/create'
	});
	$routeProvider.when('/views/users/login',{
		templateUrl: 'views/users/login'
	});
	$routeProvider.otherwise({redirectTo:'/views/home'})
}]);
facebyte.factory('$facebyteCacheFactory',[function(){
	var factory = {};
	var user = new User();
	factory.getUser = function () {
		return user;
	}
	factory.setUser = function (u) {
		user = u;
	}
	return factory;
}]);
facebyte.controller('urlController',['$scope',function($scope){
	$scope.urls = [new Url(),new Url(),new Url(),new Url()];
	readUrls();
	function readUrls () {
		$scope.urls = [];
		$scope.urls = [
			new Url('/views/home','Home'),
			new Url('/views/home','Login'),
			new Url('/views/users/create','Create Users'),
			new Url('/views/users/read','Read Users'),
			new Url('/views/users/read','Update Users'),
			new Url('/views/users/read','Delete Users'),
		];
	}
}]);
facebyte.controller('usersLoginController',['$scope','$http','$facebyteCacheFactory',function($scope,$http,$facebyteCacheFactory){
	// adjshfaksdhfkladfhjskljdhsf
	$scope.user = $facebyteCacheFactory.getUser();
}]);
facebyte.controller('usersReadController',['$scope','$http','$facebyteCacheFactory',function($scope,$http,$facebyteCacheFactory){
	$scope.user = $facebyteCacheFactory.getUser();
	$scope.users = [new User(),new User(),new User(),new User()];
	readUsers();	
	function readUsers () {
		$http({
			method: 'GET',
			url: 'http://localhost:30000/users'
		}).success(function(d,s,h,c){
				if (s == 200) {
					if (d.length) {
						$scope.users = [];
						for (var user in d) {
							$scope.users.push(new User(d[user]));
						}
					} else {
						console.warn(d,h());
					}
				} else {
					console.error(h());
				}
			});
	}
}]);
facebyte.controller('usersCreateController',[
	'$scope','$http','$location','$facebyteCacheFactory',
	function($scope,$http,$location,$facebyteCacheFactory){
	$scope.user = new User();
	$scope.canvas = new Facebyte2DCanvas();
	$scope.createUser = createUser;
	(function f (next) {
		var input = document.getElementById('facebyteFile');
		input.addEventListener('change',function(event){
			var file = event.target.files[0];
			if (file.size < 1000) {
				throw new Error('Filesize too small.')
			}
			if (file.size > 10000) {
				throw new Error('Filesize too large.')
			}
			function unsupportedFileType(fileType) {
				switch (fileType) {
					case 'image/jpeg' : return false;
					case 'image/jpg' : return false;
					case 'image/png'  : return false;
					default : return true;
				}
			}
			if (unsupportedFileType(file.type)) {
				throw new Error('Filetype not supported.')
			}
			var reader = new FileReader();
			reader.onload = function (eevent) {
				var payload = eevent.target.result;
				next(payload);
			}
			reader.readAsDataURL(file);
		});		
	}(function(payload){
		$scope.canvas.draw2dFacebyte(payload);
		$scope.user.facebyte = $scope.canvas.toFacebyte();
		console.log(payload)
		console.log($scope.user.facebyte);
	}));
	function createUser (debug) {
		if (debug) {

		} else {
			$http({
					method: 'POST',
					url: 'http://localhost:30000/users' + '/'
						+ $scope.user.userAttributeEncoded($scope.user.username) + '/' 
						+ $scope.user.userAttributeEncoded($scope.user.password) + '/'
						+ $scope.user.userAttributeEncoded($scope.user.facebyte)
			}).success(function(d,s,h,c){
				if (s == 200) {
					//if (d.length) {
						if (d.error) {
							console.log('error',d.error,d,h());
						} else {
							$scope.user.token = d.token;
							$location.path('/views/users/read')
						}
					//} else {
						//console.warn('no length',d.length,d,h());
					//}
				} else {
					console.error('not 200',d,h());
				}
			});
		}
	}
}]);

function Facebyte2DCanvas () {
	var canvas = document.getElementById('facebyteCanvas');
	var context = canvas.getContext('2d');
	function Draw2DFacebyte (facebyte) {
		// drawImage(image,upperLeftXCoordinate,upperLeftYCoordinate,desiredWidth,desiredImageHeight)
		var image = new Image();
		image.src = facebyte;
		image.onload = image_onLoadHandler;
		function image_onLoadHandler () {
			context.drawImage(image,0,0,300,300);
		}
	}
	function ToFacebyte () {
		return canvas.toDataURL('image/jpeg');
	}
	return {
		canvas: canvas,
		context: context,
		draw2dFacebyte: Draw2DFacebyte,
		toFacebyte: ToFacebyte
	}
}
function Url (url,text) {
	this.href = url || "null";
	this.text = text || "Hyperlink";
}
function User (user) {
	var _user = user || {};
	this.username = this.userAttributeDecoded(_user.username || this.userAttributeEncoded("Guest"));
	this.password = this.userAttributeDecoded(_user.password || this.userAttributeEncoded("Password"));
	this.token = this.userAttributeDecoded(_user.token || this.userAttributeEncoded(""));
	this.facebyte = this.userAttributeDecoded(_user.facebyte || this.userAttributeEncoded("data:image/png;base64,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"));
	this.dates = _user.dates || {};
	this.dates.created = this.userAttributeDecoded(this.dates.created || this.userAttributeEncoded(new Date()));
	this.dates.lastUpdated = this.userAttributeDecoded(this.dates.lastUpdated || this.userAttributeEncoded(new Date()));
	this.update = this.userAttributeDecoded(_user.update || this.userAttributeEncoded("Hey, facebytes! Care to welcome @"+this.username+" to facebyte? :)"));
}
User.prototype.userAttributeDecoded = function (encoded) {
	return atob(encoded);
}
User.prototype.userAttributeEncoded = function (decoded) {
	return btoa(decoded);
}
User.prototype.usernameBase64 = function () {
	return btoa(this.username);
}
User.prototype.passwordBase64 = function () {
	return btoa(this.password);
}
User.prototype.tokenBase64 = function () {
	return btoa(this.token);
}
User.prototype.facebyteBase64 = function () {
	return btoa(this.facebyte);
}