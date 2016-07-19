/* jshint esversion: 6 */

angular.module( 'hummingbird' ).controller( "masterCtrl", function ( $scope, $http, masterService, $state ) {

	var openedWindow;

	var auth;

	$( '.login' ).on( 'submit', function ( e ) {
		e.preventDefault();
		openedWindow = window.open( "http://localhost:3000/auth/google", "Hummingbird Auth", "width=500px, height=500px, top=400, left=600" );
		var $this = $( this ),
			$btnstate = $this.find( 'button > .state' );
		$this.addClass( 'loading' );
		$btnstate.html( 'Authenticating' );

		var refreshAuth = setInterval( function () {
			masterService.checkAuth().then( function ( data ) {
				if ( data.status ) {
					auth = data.status;
				} else {
					auth = data;
				}
			} );
			if ( auth === 200 ) { // IF AUTH WHAT?
				openedWindow.close();
				$this.addClass( 'ok' );
				$btnstate.html( 'Welcome back!' );
				setTimeout( function () {

					$( '.background' ).addClass( 'bg-white' );
					$( '.login' ).fadeOut( 400, function () {
						$state.go( 'mail' );
					} );

				}, 2000 );
				setTimeout( function () {
					$btnstate.html( 'Log in' );
					$this.removeClass( 'ok loading' );
				}, 4000 );
				clearInterval( refreshAuth );
			}
		}, 1000 );

	} );

	$scope.login = () => {

		return window.open( "http://localhost:3000/auth/google", "Hummingbird Auth" );

	};

} );
