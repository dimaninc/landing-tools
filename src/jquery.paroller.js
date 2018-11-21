/**
 * jQuery plugin paroller.js
 * Original: https://github.com/tgomilar/paroller.js
 **/

;( function( factory ) {
    // AMD
    if( typeof define === 'function' && define.amd )
    {
        define( [ 'jquery' ], factory );
    }
    // CommonJS
    else if( ( typeof exports === 'undefined' ? 'undefined' : _typeof( exports ) ) === 'object' )
    {
        module.exports = factory( window.Zepto || window.jQuery || window.$ || require( 'jquery' ) );
    }
    //
    else
    {
        factory( window.Zepto || window.jQuery || window.$ );
    }
} )( function( $ )
{
    'use strict';

    // Default options
    var defaults = {
        factor: 0, // - to +
        type: 'background', // foreground
        direction: 'vertical' // horizontal
    };

    //
    function Plugin( element, options )
    {
        this.element = element;
        this.$element = $( element );
        this.$window = $(window);
        this.$viewport = $(this.$element.data('paroller-viewport') || this.$element);
        this.options = $.extend( true, { }, defaults, options );

        this.init( );
    }

    //
    Plugin.prototype =
    {
        init: function( )
        {
            var context = this;

            this._updatePosition( );
            this.$window.on( 'resize.paroller load.paroller', function( ) { context._updatePosition( ); } );
            this.$window.on( 'scroll.paroller', function( ) { context._updateScrollPosition( ); } );
        },

        _updatePosition: function( )
        {
            var scrolling = this.$window.scrollTop( );
            var windowHeight = this.$window.height( );
            var documentHeight = this.$window.height( );

            //
            var offset = this.$element.offset( ).top;
            var height = this.$element.outerHeight( );
            var dataFactor = this.$element.data( 'paroller-factor' );
            var dataType = this.$element.data( 'paroller-type' );
            var dataDirection = this.$element.data( 'paroller-direction' );

            //
            var factor = ( dataFactor ) ? dataFactor : this.options.factor;
            var type = ( dataType) ? dataType : this.options.type;
            var direction = ( dataDirection ) ? dataDirection : this.options.direction;

            if( type === 'background' )
            {
                var bgOffset = Math.round( ( ( offset - scrolling ) * factor ) );

                if( direction === 'vertical' )
                {
                    this._verticalBPosition( ( height / 2 ) + bgOffset );
                }
                else if( direction === 'horizontal' )
                {
                    this._horizontalBPosition( bgOffset );
                }
            }
            else if( ( type === 'foreground' ) && ( scrolling < documentHeight ) )
            {
                var transform = Math.round( ( ( offset - ( windowHeight / 2 ) + height ) - scrolling ) * factor );

                if( direction === 'vertical' )
                {
                    this._verticalTransform( transform );
                }
                else if( direction === 'horizontal' )
                {
                    this._horizontalTransform( transform );
                }
            }
        },
        _updateScrollPosition: function( )
        {
            var scrollTop = this.$window.scrollTop( );
            var windowHeight = this.$window.height( );
            var scrollBottom = scrollTop + windowHeight;
            var documentHeight = $( document ).height( );

            var viewportTop = this.$viewport.offset().top;
            var viewportHeight = this.$viewport.outerHeight();
            var viewportBottom = viewportTop + viewportHeight;

            //
            var top = this.$element.offset( ).top;
            var height = this.$element.outerHeight( );
            //var bottom = top + height;
            var dataFactor = this.$element.data( 'paroller-factor' );
            var dataType = this.$element.data( 'paroller-type' );
            var dataDirection = this.$element.data( 'paroller-direction' );

            //
            var factor = ( dataFactor ) ? dataFactor : this.options.factor;
            var type = ( dataType) ? dataType : this.options.type;
            var direction = ( dataDirection ) ? dataDirection : this.options.direction;

            var isVisible = viewportBottom > scrollTop && viewportTop < scrollBottom;

            if (!isVisible) {
                return false;
            }

            if( type === 'background' )
            {
                var bgOffset = Math.round( ( ( top - scrollTop ) * factor ) );

                if( direction === 'vertical' )
                {
                    this._verticalBPosition( bgOffset );
                }
                else if( direction === 'horizontal' )
                {
                    this._horizontalBPosition( bgOffset );
                }
            }
            else if( ( type === 'foreground' ) && ( scrollTop < documentHeight ) )
            {
                var transform = Math.round( ( ( top - ( windowHeight / 2 ) + height ) - scrollTop ) * factor );

                if( direction === 'vertical' )
                {
                    this._verticalTransform( transform );
                }
                else if( direction === 'horizontal' )
                {
                    this._horizontalTransform( transform );
                }
            }
        },

        _verticalBPosition: function( offset )
        {
            return this.$element.css( { 'background-position': 'center ' + -offset + 'px' } );
        },

        _horizontalBPosition: function( offset )
        {
            return this.$element.css( { 'background-position': -offset + 'px' + ' center' } );
        },

        _verticalTransform: function( offset )
        {
            return this.$element.css( {
                '-webkit-transform': 'translate3d(0, ' + offset + 'px, 0)',
                '-moz-transform': 'translate3d(0, ' + offset + 'px, 0)',
                'transform': 'translate3d(0, ' + offset + 'px, 0)',
                'transition': 'transform linear',
                'will-change': 'transform'
            } );
        },

        _horizontalTransform: function( offset )
        {
            return this.$element.css( {
                '-webkit-transform': 'translate3d(' + offset + 'px, 0, 0)',
                '-moz-transform': 'translate3d(' + offset + 'px, 0, 0)',
                'transform': 'translate3d(' + offset + 'px, 0, 0)',
                'transition': 'transform linear',
                'will-change': 'transform'
            } );
        },

        destroy: function( reinitialize )
        {
            // Not remove data in reinit
            if( !reinitialize ) { this.$element.removeData( '_paroller' ); }

            this.$element.off( '.paroller' );
        },

        reinitialize: function( options )
        {
            this.destroy( true );
            this.options = $.extend( true, { }, this.options, options );
            this.init( );
        },

        //
        reinit: function( options )
        {
            this.reinitialize( );
        }
    };

    $.fn.paroller = function( options )
    {
        var args = arguments;
        var $element = this.is( '[data-paroller-factor]' ) ? this : this.find( '[data-paroller-factor]' );

        // Init plugin
        if( options === undefined || typeof options === 'object' )
        {
            $element.each( function( )
            {
                if( !$.data( this, '_paroller' ) )
                {
                    $.data( this, '_paroller' , new Plugin( this, options ) );
                }
            } );

            return this;
        }
        // Call function
        else if( typeof options === 'string' && options[0] !== '_' && options !== 'init' )
        {
            var returns = undefined;

            $element.each( function( )
            {
                var instance = $.data( this, '_paroller' );

                if( instance instanceof Plugin && typeof instance[ options ] === 'function' )
                {
                    returns = instance[ options ].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            } );

            return returns !== undefined ? returns : this;
        }
    };
} );