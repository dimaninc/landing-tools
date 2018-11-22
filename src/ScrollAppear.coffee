class ScrollAppear
    constructor: (options) ->
        @window = $ window
        @options = $.extend
            selector: '[data-scroll-appear]'
            selectorSuffixForNonAppeared: null # if finish is a string then it becomes ':not(.appeared)'
            onFinish: 'scroll-appeared' # if string then a class name added
            #onFinish: ($e) -> $e.attr('data-scroll-appeared', 'true').data 'scroll-appeared', true
            windowHeightFactor: 1.5
            delayAttr: 'data-appear-delay'
            eventClass: '.scrollappear'
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
            @options.selectorSuffixForNonAppeared

    getFullSelector: -> options.selector + @getSuffix()

    getElements: -> $ @getFullSelector()

    finishElement: ($e) ->
        if typeof @options.onFinish is 'string'
            $e.addClass @options.onFinish
        else
            @options.onFinish $e
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
