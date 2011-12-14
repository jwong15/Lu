var Class = require( 'class' ),
  List = require( 'athena/List' ),
  Carousel;

/**
 * A representation of a stateful list
 * @class List
 * @constructor
 * @param {HTMLElement} element The HTML element containing this component
 * @param {Object} settings Configuration properties for this instance
 */
Carousel =  Class.create( List, ( function() {

  var MAXED_EVENT = 'maxed',
    FLOORED_EVENT = 'floored',
    PLAY_EVENT = 'play'
    PLAYING_EVENT = 'playing',
    PAUSE_EVENT = 'pause',
    PAUSED_EVENT = 'paused',
    FIRST_EVENT = 'first',
    LAST_EVENT = 'last',
    SELECT_EVENT = 'select',
    SELECTED_EVENT = 'selected',
    PREVIOUS_EVENT = 'previous',
    NEXT_EVENT = 'next';

  // RETURN METHODS OBJECT
  return {
    /**
     * PTClass constructor
     * @method initialize
     * @public
     * @param {Object} $super Pointer to superclass constructor
     * @param {Object} $element JQuery object for the element wrapped by the component
     * @param {Object} settings Configuration settings
     */
    initialize: function ( $super, $element, settings ) {

      // PRIVATE INSTANCE PROPERTIES

      /**
       * Instance of Carousel
       * @property Carousel
       * @type Object
       * @private
       */  
      var Carousel = this,
        /**
         * Default configuration values
         * @property defaults
         * @type Object
         * @private
         * @final
         */
        defaults = {
          /**
           * Number of times to cycle through carousel items when playing, set to -1 to repeat forever
           * @property repeat
           * @type Number
           * @private
           */
          repeat: -1,
          /**
           * Automatically calls play on instantiation if set to true
           * @property repeat
           * @type Boolean
           * @private
           * @final
           */
          autoplay: true,
          /**
           * The time in milliseconds to remain on an item while playing
           * @property delay
           * @type Number
           * @private
           * @final
           */
          delay: 3000,
          /**
           * A selector scoped to the $element that matches carousel panels
           * @property repeat
           * @type String
           * @private
           * @final
           */
          panels: '.panels',
          /**
           * A selector scoped to the $element that matches carousel items
           * @property repeat
           * @type String
           * @private
           * @final
           */
          items: '.items',
          /**
           * The CSS class that designates a selected panel
           * @property selectFlag
           * @default 'selected'
           * @type String
           * @final
           * @private
          */
          activeFlag: 'active'

        },
        /**
         * Integer value signalling whether the carousel is set to repeat
         * @property repeat
         * @type Type Number
         * @private
         */
        repeat,
        /**
         * Flag signalling the playing state of the carousel
         * @property playing
         * @type Boolean
         * @default false
         * @private
         */
        playing = false,
        /**
         * The collection of panels in the carousel
         * @property $panels
         * @type Object
         * @private
         */
        $panels;

      // MIX THE DEFAULTS INTO THE SETTINGS VALUES
      _.defaults( settings, defaults );

      repeat = settings.repeat;

      $panels = $element.children( settings.panels ).children();

      if( $panels.length > 0 ) {
        settings.items = $panels.children( settings.items );
      }

      // CALL THE PARENT'S CONSTRUCTOR
      $super( $element, settings );

      // PRIVILEGED METHODS
     /**
       * Plays the Carousel when paused
       * @method play
       * @public
       * @return {Object} The Carousel instance
       */
      Carousel.play = function() {
        if( playing === false ) {
            console.log( 'playing' );
          repeat = settings.repeat;
          playing = true;
          ( function recurse() {
            window.setTimeout( function() {
              if( playing ) {
                Carousel.next();
                recurse();
              }
            }, settings.delay );
          }() );
          Carousel.trigger( PLAYING_EVENT, [ $element ] );
        }
        return Carousel;
      };

      /**
       * Pauses the Carousel when playing
       * @method pause
       * @public
       * @return {Object} The Carousel instance
       */
      Carousel.pause = function() {
        if( playing ) {
          console.log( 'paused' );
          playing = false;
          Carousel.trigger( PAUSED_EVENT, [ $element ] );
        }
        return Carousel;
      };

      // EVENT BINDINGS
      Carousel.on( SELECTED_EVENT, function( event, $item ) {
         var $panel = $item.closest( $panels );
         if( $panel.hasClass( settings.activeFlag ) === false ) {
           $panels.removeClass( settings.activeFlag );
           $panel.addClass( settings.activeFlag );
         }
      } );
      Carousel.on( MAXED_EVENT, function( event ) {
       event.stopPropagation();
       if( playing && repeat !== 0 ) {
         repeat -= 1;
         Carousel.first();
       } else if ( playing && repeat < 0 ){
         Carousel.first();
       } else {
         Carousel.first();
       }
      } );
      Carousel.on( FLOORED_EVENT, function( event ) {
       event.stopPropagation();
       Carousel.last();
      } );
      Carousel.on( PLAY_EVENT, function( event ) {
       event.stopPropagation();
       Carousel.play();
      } );
      Carousel.on( [PAUSE_EVENT, NEXT_EVENT, PREVIOUS_EVENT, FIRST_EVENT, LAST_EVENT, SELECT_EVENT].join( ' ' ), function( event, item ) {
        event.stopPropagation();
        Carousel.pause();
      } );

      // Play if autoplay was true in settings
      if( settings.autoplay ) {
        Carousel.play();
      } else {
        Carousel.trigger( PAUSED_EVENT, [ $element ] );
      }

    }
  };

}() ));

//Export to Common JS Loader
if( module ) {
  if( typeof module.setExports === 'function' ){
    module.setExports( Carousel );
  } else if( module.exports ) {
   module.exports = Carousel; 
  }
}