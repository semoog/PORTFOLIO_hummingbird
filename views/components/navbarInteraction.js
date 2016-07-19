angular.module('hummingbird')
  .directive("navBarInteraction", function(  ) {
    // this.$scope = $scope;

    linkFn = (scope, element, attrs) => {

      $( ".scroll_container" ).hide();

    	$( document ).on( 'click', '.icon-container--nav', function () {
    		$( ".icon-container--nav" ).removeClass( "selected" );
    		$( this ).addClass( "selected" );
    	} );
    	$( document ).on( 'click', '.compose-container--nav', function () {
    		$( this ).addClass( "selected" );
    		setTimeout( function () {
    			$( this ).removeClass( "selected" );
    		}, 500 );
    	} );
    	$( document ).on( 'click', '.label-container--nav', function () {
    		$( ".label-container--nav" ).removeClass( "selected" );
    		$( this ).addClass( "selected" );
    	} );
    	$( document ).on( 'click', '.pane-email', function () {
    		$( ".pane-email" ).removeClass( "selected" );
    		$( this ).addClass( "selected" );
    	} );
    	$( document ).on( 'click', '.nav-container', function () {
    		$( ".nav-container" ).removeClass( "selected" );
    		$( this ).addClass( "selected" );
    	} );

    };

    return {
        restrict: 'A',
        link: linkFn
    };
});
