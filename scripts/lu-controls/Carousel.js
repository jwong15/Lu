/**
 * A representation of a stateful list
 * @class Carousel
 * @require class
 * @extends List
 * @constructor
 * @version 0.2.4
 */

var List = require( 'lu/List' ),
  stateDecorator = require( '/scripts/lu-decorators/State' ),
  transitionDecorator = require( '/scripts/lu-decorators/Transition' ),
  Carousel;

Carousel =  List.extend( function (List) {

  var MAXED_EVENT = 'maxed',
    FLOORED_EVENT = 'floored',
    PLAY_EVENT = 'play',
    PLAYING_EVENT = 'playing',
    PAUSE_EVENT = 'pause',
    PAUSED_EVENT = 'paused',
    FIRST_EVENT = 'first',
    LAST_EVENT = 'last',
    SELECT_EVENT = 'select',
    SELECTED_EVENT = 'selected',
    PREVIOUS_EVENT = 'previous',
    SHOWN_EVENT = 'shown',
    HIDDEN_EVENT = 'hidden',
    NEXT_EVENT = 'next',
    OUT_OF_BOUNDS_EVENT = 'out-of-bounds',
    PLAYING_FLAG = 'lu-playing',
    PAUSED_FLAG = 'lu-paused',

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
      delay: 3000
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
     * The calculated time in milliseconds to remain on an item while playing
     * @property delay
     * @type Number
     * @private
     * @final
     */
     delay,
    /**
     * Timer which handles the playing of the carousel
     * @property playTimer
     * @type Object
     * @private
     */
     playTimer;

  // RETURN METHODS OBJECT
  return {
    /**
     * Class constructor
     * @method initialize
     * @public
     * @param {Object} $element JQuery object for the element wrapped by the component
     * @param {Object} settings Configuration settings
     */
    init: function ( $element, settings ){

      // PRIVATE INSTANCE PROPERTIES

      /**
       * Instance of Carousel
       * @property Carousel
       * @type Object
       * @private
       */
       var Carousel = this;

      // MIX THE DEFAULTS INTO THE SETTINGS VALUES
      _.defaults( settings, defaults );

      this.settings = settings;
      this.$element = $element;

      // CALL THE PARENT'S CONSTRUCTOR
      List.init.call( this, $element, settings );
      Carousel.decorate( stateDecorator );

      Carousel.on( PLAY_EVENT, function( event ){
        event.stopPropagation();
        Carousel.play();
      } );

      Carousel.on( [PAUSE_EVENT, NEXT_EVENT, PREVIOUS_EVENT, FIRST_EVENT, LAST_EVENT, SELECT_EVENT, HIDDEN_EVENT].join( ' ' ), function( event, item ){
        event.stopPropagation();
        Carousel.pause();
      } );

      Carousel.on( SHOWN_EVENT, function( event ){
        event.stopPropagation();
        if ( settings.autoplay ){
          Carousel.play();
        }
      });

      Carousel.on( OUT_OF_BOUNDS_EVENT + '.' + NEXT_EVENT, function( event ){
        var controls;

        event.stopPropagation();

        Carousel.next();

        controls = Carousel.current().lu( 'getControls' );
        _.each( controls, function( item, index ){
          if ( typeof item.first === 'function' ){
            item.first();
          }
        } );
      } );

      Carousel.on( OUT_OF_BOUNDS_EVENT + '.' + PREVIOUS_EVENT, function( event ){
        var controls;

        event.stopPropagation();

        Carousel.previous();

        controls = Carousel.current().lu( 'getControls' );
        _.each( controls, function( item, index ){
          if ( typeof item.last === 'function' ){
            item.last();
          }
        } );
      } );

      Carousel.on( PLAYING_EVENT, function( event ){
        $element.addClass( PLAYING_FLAG ).removeClass( PAUSED_FLAG );
      } );

      Carousel.on( PAUSED_EVENT, function( event ){
        $element.addClass( PAUSED_FLAG ).removeClass( PLAYING_FLAG );
      } );

      // Play if autoplay was true in settings
      if( settings.autoplay ){
        Carousel.play();
      } else {
        Carousel.trigger( PAUSED_EVENT, [$element] );
      }

    },


   /**
     * Plays the Carousel when paused
     * @method play
     * @public
     * @return {Object} The Carousel instance
     */
    play: function(){
      var self = this;

      if( playing === false ){
        playing = true;
        ( function recurse( ){
          playTimer = window.setTimeout( function(){
            if( playing ){
              self.next();
              recurse();
            }
          }, self.settings.delay );
        }() );
        this.trigger( PLAYING_EVENT, [this.$element] );
      }
      return this;
    },

    /**
     * Pauses the Carousel when playing
     * @method pause
     * @public
     * @return {Object} The Carousel instance
     */
    pause: function(){
      if( playing ){
        playing = false;
        window.clearTimeout( playTimer );
        this.trigger( PAUSED_EVENT, [this.$element] );
      }
      return this;
    },
    
    /**
     * Carousels wrap, so they always have next
     * @method hasNext
     * @public
     * @return {Boolean} true if not at the last item in the list
     */
    hasNext: function(){
      return true;
    },

    /**
     * Carousels wrap, so they always have previous
     * @method hasPrevious
     * @public
     * @return {Boolean} true
     */
    hasPrevious: function(){
      return true;
    },

    /**
     * Selects the next item in the Carousel.
     * @method next
     * @public
     * @return {Object} List
     */
    next: function(){
      if( this.size() === this.index + 1 ){
        this.select( 0 );
      } else {
        this.select( this.index + 1 );
      }
      return this;
    },

    /**
     * Selects the previous item in the Carousel.
     * @method previous
     * @public
     * @return {Object} List
     */
    previous: function(){
      this.select( this.index - 1 );
      return this;
    }
  };

} );

//Export to Common JS Loader
if( typeof module !== 'undefined' ){
  if( typeof module.setExports === 'function' ){
    module.setExports( Carousel );
  } else if( module.exports ){
   module.exports = Carousel;
  }
}
