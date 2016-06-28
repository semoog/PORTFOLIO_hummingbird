/* jshint esversion: 6 */

angular.module( 'meanmail' ).service( 'masterService', function ( $http ) {

	this.getUser = function () {
		return $http.get( '/getUser' ).then( function ( response ) {
			return response.data;
		} );
	};

	this.checkAuth = function () {
		return $http.get( '/checkAuth' ).then( function ( response ) {
			return response;
		} ).catch( function () {
			return false;
		} );
	};

} );
