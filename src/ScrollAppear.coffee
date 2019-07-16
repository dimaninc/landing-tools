class ScrollAppear
    constructor: (options) ->
        @window = $ window
        @options = $.extend
            selector: '[data-scroll-appear]' # selector of parent elements, use '.scroll-appear' if you want to depend on classes
            selectorSuffixForNonAppeared: null # if finish is a string then it becomes ':not(.appeared)'
            onFinish: null # if string then a class name added (use 'scroll-appeared'), if callback, it is called, if null - default callback called
            windowHeightFactor: 1.5
            delayAttr: 'data-appear-delay' # attribute to watch for delay appear
            eventClass: '.scrollappear' # class added to events
            transitionTime: 500 # ms
        , options
        @finishingAttr = 'sa--finishing'
        @count = @getElements().length
        @countLoaded = 0
        @cssClasses = {}

        @setupDelays()
        .setupWindowEvents()

        setTimeout =>
            @worker()
        , 10

    undoSetupWindowEvents: ->
        @window.off @options.eventClass
        @

    setupDelays: ->
        self = @
        $ '[' + @options.delayAttr + ']'
        .each ->
            $e = $ @
            $e.addClass self.getDelayCssClassName $e
            true
        styles = $.map @cssClasses, (value, className) -> ".#{className}{#{value}!important}"
        $('head').append '<style type="text/css">' + styles.join('\n') + '</style>'
        @

    getElementDelay: ($e) -> @parseDelay $e.attr @options.delayAttr

    parseDelay: (delay) ->
        return 0 unless delay
        if delay.slice(-2) is 'ms'
            delay = parseInt delay
        else
            delay = 1000 * parseFloat '0' + delay
        delay

    getDelayCssClassName: ($e) ->
        delay = @getElementDelay $e
        name = 'sa--td-' + delay
        if delay and not @cssClasses[name]
            value = delay + 'ms !important;'
            @cssClasses[name] = '-webkit-transition-delay:' + value +
                '-moz-transition-delay:' + value +
                'transition-delay:' + value

        name

    setupWindowEvents: ->
        events = [
            'scroll'
            'resize'
            'orientationchange'
        ].map (e) => e + @options.eventClass
        @window.on events.join(' '), => @worker()
        @

    getSuffix: ->
        if not @options.selectorSuffixForNonAppeared and typeof @options.onFinish is 'string'
            ':not(' + @options.onFinish + ')'
        else
            @options.selectorSuffixForNonAppeared or ''

    getFullSelector: -> @options.selector + @getSuffix()

    getElements: -> $ @getFullSelector()

    finishElement: ($wrapper) ->
        return @ if $wrapper.attr @finishingAttr

        self = @
        $wrapper.attr @finishingAttr, true
        defaultFinish = ($el) -> $el.attr('data-scroll-appeared', 'true').data 'scroll-appeared', true

        if typeof @options.onFinish is 'string'
            $wrapper.addClass @options.onFinish
        else
            finish = @options.onFinish or defaultFinish
            finish $wrapper

        maxDelay = 0

        # removing classes and attributes from child elements
        $wrapper
            .find '[' + @options.delayAttr + ']'
            .each ->
                $e = $ @
                delay = self.getElementDelay $e
                className = self.getDelayCssClassName $e
                delay > maxDelay and maxDelay = delay
                setTimeout =>
                    $e
                        .removeClass className + ' scroll-appear-simple scroll-appear-bg scroll-appear-from-left scroll-appear-from-right scroll-appear-from-bottom'
                        .removeAttr self.options.delayAttr
                , delay + self.options.transitionTime + 10

        # removing classes and attributes from parent wrapper
        setTimeout =>
            $wrapper
                .removeClass 'scroll-appeared scroll-appear'
                .removeAttr 'data-scroll-appear data-scroll-appeared ' + @finishingAttr
            @stepDone()
        , maxDelay + self.options.transitionTime + 10

        @

    stepDone: ->
        @countLoaded++
        @finish() if @countLoaded is @count
        @

    finish: ->
        @window.off @options.eventClass
        @

    worker: ->
        self = @
        scrollBreakPoint = @window.scrollTop() + @window.height() / @options.windowHeightFactor
        @getElements().each ->
            $wrapper = $ @
            self.finishElement $wrapper if scrollBreakPoint >= $wrapper.offset().top
        @
