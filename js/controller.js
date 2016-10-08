/**
 * Controller that handles all the magic of weather app.
 * 
 * Important! getCurrentPosition() and watchPosition() no longer work on
 * insecure origins. To use this feature, you should consider switching
 * your application to a secure origin, such as HTTPS.
 * Only Firefox works on HTTP yet.
 */
app.controller("cweather", function($scope, $http) {
	$scope.api_url  = "http://api.openweathermap.org/data/2.5/weather";
	$scope.api_key  = "35644cffb247b8aa6c0a19b39f659e0b";
	$scope.message  = {"code": "", "text": ""};
	$scope.input    = "city";
	$scope.coords   = "";
	$scope.city     = "";
	$scope.zip      = "";
	$scope.geo_enabled = navigator.geolocation ? true : false;

	
	/**
	 * On success function for $http.get() (for weather requests).
	 * @param obj response - server response including weather data.
	 * @return void.
	 */
	$scope.http_success = function (response) {
		$scope.state = "done";
		$scope.data = response.data;
		$scope.message.text = "Here's your weather, enjoy.";
		$scope.message.code = "ok";
	}
	
	/**
	 * On failure function for $http.get() (for weather requests).
	 * @param obj response - server response.
	 * @return void.
	 */
	$scope.http_fail = function (response) {
		$scope.state = "done";
		$scope.message.text = "Your location is very strange. Are you on Mars?";
		$scope.message.code = "err";
	}

	/**
	 * Retrieves weather by coordinates.
	 * @return void.
	 */
	$scope.get_by_coords = function () {
		if ($scope.weather_form.coords.$invalid) {
			$scope.message.text = "Enter coordinates";
			$scope.message.code = "err";
			return;
		}
		
		var coords = $scope.coords.split(",");
		if (coords.length < 2) {
			$scope.http_fail();
			return;
		}
		$scope.state = "process";
		$http.get($scope.api_url + "?APPID=" + $scope.api_key + "&lat=" + coords[0].trim() + "&lon=" + coords[1].trim()).then(
		function(response){
			$scope.http_success(response);
    },
    function(response){
			$scope.http_fail(response);
    });
	}
	
	/**
	 * Retrieves weather by city.
	 * @return void.
	 */
	$scope.get_by_city = function () {
		if ($scope.weather_form.city.$invalid) {
			$scope.message.text = "Enter City";
			$scope.message.code = "err";
			return;
		}
		
		$scope.state = "process";
		$http.get($scope.api_url + "?APPID=" + $scope.api_key + "&q=" + $scope.city).then(
		function(response){
			$scope.http_success(response);
    },
    function(response){
			$scope.http_fail(response);
    });
	}
	
	/**
	 * Retrieves weather by zip-code.
	 * @return void.
	 */
	$scope.get_by_zip = function () {
		if ($scope.weather_form.zip.$invalid) {
			$scope.message.text = "Enter ZIP-code and country";
			$scope.message.code = "err";
			return;
		}
		
		$scope.state = "process";
		var zip = $scope.zip.split(",");
		if (!zip[1])
			zip[1] = "us";
		$http.get($scope.api_url + "?APPID=" + $scope.api_key + "&zip=" + zip[0].trim() + "," + zip[1].trim()).then(
		function(response){
			$scope.http_success(response);
    },
    function(response){
			$scope.http_fail(response);
    });
	}
	
	/**
	 * Retrieves weather according to the method selected with form radios.
	 * @return void.
	 */
	$scope.doit = function () {
		$scope.data = "";
		$scope.message.text = "";
		switch ($scope.input) {
			case "coords" : $scope.get_by_coords(); break;
			case "city"   : $scope.get_by_city(); break;
			case "zip"    : $scope.get_by_zip(); break;
		}
	}
	
	/**
	 * Returns url of weather icon by it's code.
	 * @param str code - weather icon code.
	 * @return str url of image.
	 */
	$scope.get_image_url = function (code) {
		return code ? "http://openweathermap.org/img/w/" + code + ".png" : "";
	}
	
	/**
	 * Converts temperature to celcium.
	 * @param float k - temperature in kelvin.
	 * @return int temperature in celcium (rounded).
	 */
	$scope.get_temp = function (k) {
		return Math.round(k-273.15);
	}
	
	/**
	 * Asks browser for a permission to read current location and then
	 * retrieves weather for it.
	 * @return void.
	 */
	$scope.geo_magic = function(){
		if (!$scope.geo_enabled)
			return;
		
		function geo_success (position) {
			$scope = $('#weather').scope();
			$scope.$apply(function(){
				$scope.coords = position.coords.latitude + ", " + position.coords.longitude;
				$scope.message.text = "Coordinates detected";
				$scope.message.code = "ok";
				$scope.input = "coords";
				//$scope.get_by_coords();
				setTimeout(function(){$scope = $('#weather').scope(); $scope.$apply(function(){$scope.get_by_coords();})}, 666);
			});
		}

		function geo_error () {
			$scope = $('#weather').scope();
			$scope.$apply(function(){
				$scope.message.text = "";
				$scope.message.code = "ok";
				$scope.input = "city";
			});
		}

		$scope.geoid = navigator.geolocation.getCurrentPosition(geo_success, geo_error);
	}

	$scope.geo_magic();
});
