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
        , options
        @count = @getElements().length
        @countLoaded = 0

        @setupDelays()
        .go()
        .worker()

    setupDelays: ->
        self = @
        $ '[' + @options.delayAttr + ']'
        .each ->
            $e = $ @
            $e.css 'transition-delay': $e.attr self.options.delayAttr
            true
        @

    go: ->
        @window.on 'scroll' + @options.eventClass, => @worker()
        @

    getSuffix: ->
        if not @options.selectorSuffixForNonAppeared and typeof @options.onFinish is 'string'
            ':not(' + @options.onFinish + ')'
        else
            @options.selectorSuffixForNonAppeared or ''

    getFullSelector: -> @options.selector + @getSuffix()

    getElements: -> $ @getFullSelector()

    finishElement: ($e) ->
        defaultFinish = ($el) -> $el.attr('data-scroll-appeared', 'true').data 'scroll-appeared', true

        if typeof @options.onFinish is 'string'
            $e.addClass @options.onFinish
        else
            finish = @options.onFinish or defaultFinish
            finish $e
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
            $e = $ @
            if scrollBreakPoint >= $e.offset().top
                self.finishElement $e
                self.stepDone()
        @
