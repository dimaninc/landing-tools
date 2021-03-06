// Generated by CoffeeScript 1.12.7
var ScrollAppear;

ScrollAppear = (function() {
  function ScrollAppear(options) {
    this.window = $(window);
    this.appearClasses = ['scroll-appear-simple', 'scroll-appear-bg', 'scroll-appear-from-left', 'scroll-appear-from-right', 'scroll-appear-from-bottom'];
    this.options = $.extend({
      selector: '[data-scroll-appear]',
      selectorSuffixForNonAppeared: null,
      onFinish: null,
      windowHeightFactor: 1.5,
      bottomHeightFactor: 1.15,
      defaultAppearClass: 'scroll-appear-simple',
      delayAttr: 'data-appear-delay',
      eventClass: '.scrollappear',
      transitionTime: 500,
      additionalCommonDelay: 0
    }, options);
    this.finishingAttr = 'sa--finishing';
    this.count = this.getElements().length;
    this.countLoaded = 0;
    this.cssClasses = {};
    this.setupDelays().setupWindowEvents();
    setTimeout((function(_this) {
      return function() {
        return _this.worker();
      };
    })(this), 10);
  }

  ScrollAppear.prototype.undoSetupWindowEvents = function() {
    this.window.off(this.options.eventClass);
    return this;
  };

  ScrollAppear.prototype.setupDelays = function() {
    var self, styles;
    self = this;
    $('[' + this.options.delayAttr + ']').each(function() {
      var $e;
      $e = $(this);
      $e.addClass(self.getDelayCssClassName($e));
      self.addDefaultAppearClassIfNeeded($e);
      return true;
    });
    styles = $.map(this.cssClasses, function(value, className) {
      return "." + className + "{" + value + "!important}";
    });
    $('head').append('<style type="text/css">' + styles.join('\n') + '</style>');
    return this;
  };

  ScrollAppear.prototype.getElementDelay = function($e) {
    return this.parseDelay($e.attr(this.options.delayAttr)) + Number(this.options.additionalCommonDelay) * 1000;
  };

  ScrollAppear.prototype.parseDelay = function(delay) {
    if (!delay) {
      return 0;
    }
    if (delay.slice(-2) === 'ms') {
      delay = parseInt(delay);
    } else {
      delay = 1000 * parseFloat('0' + delay);
    }
    return delay;
  };

  ScrollAppear.prototype.addDefaultAppearClassIfNeeded = function($e) {
    var c, exists, i, len, ref;
    exists = false;
    ref = this.appearClasses;
    for (i = 0, len = ref.length; i < len; i++) {
      c = ref[i];
      if ($e.hasClass(c)) {
        exists = true;
        break;
      }
    }
    c = this.options.defaultAppearClass || this.appearClasses[0];
    if (!exists) {
      $e.addClass(c);
    }
    return this;
  };

  ScrollAppear.prototype.getDelayCssClassName = function($e) {
    var delay, name, value;
    delay = this.getElementDelay($e);
    name = 'sa--td-' + delay;
    if (delay && !this.cssClasses[name]) {
      value = delay + 'ms !important;';
      this.cssClasses[name] = '-webkit-transition-delay:' + value + '-moz-transition-delay:' + value + 'transition-delay:' + value;
    }
    return name;
  };

  ScrollAppear.prototype.setupWindowEvents = function() {
    var events;
    events = ['scroll', 'resize', 'orientationchange'].map((function(_this) {
      return function(e) {
        return e + _this.options.eventClass;
      };
    })(this));
    this.window.on(events.join(' '), (function(_this) {
      return function() {
        return _this.worker();
      };
    })(this));
    return this;
  };

  ScrollAppear.prototype.getSuffix = function() {
    if (!this.options.selectorSuffixForNonAppeared && typeof this.options.onFinish === 'string') {
      return ':not(' + this.options.onFinish + ')';
    } else {
      return this.options.selectorSuffixForNonAppeared || '';
    }
  };

  ScrollAppear.prototype.getFullSelector = function() {
    return this.options.selector + this.getSuffix();
  };

  ScrollAppear.prototype.getElements = function() {
    return $(this.getFullSelector());
  };

  ScrollAppear.prototype.finishElement = function($wrapper) {
    var defaultFinish, finish, maxDelay, self;
    if ($wrapper.attr(this.finishingAttr)) {
      return this;
    }
    self = this;
    $wrapper.attr(this.finishingAttr, true);
    defaultFinish = function($el) {
      return $el.attr('data-scroll-appeared', 'true').data('scroll-appeared', true);
    };
    if (typeof this.options.onFinish === 'string') {
      $wrapper.addClass(this.options.onFinish);
    } else {
      finish = this.options.onFinish || defaultFinish;
      finish($wrapper);
    }
    maxDelay = 0;
    $wrapper.find('[' + this.options.delayAttr + ']').each(function() {
      var $e, className, delay;
      $e = $(this);
      delay = self.getElementDelay($e);
      className = self.getDelayCssClassName($e);
      delay > maxDelay && (maxDelay = delay);
      return setTimeout((function(_this) {
        return function() {
          return $e.removeClass(self.appearClasses.concat([className]).join(' ')).removeAttr(self.options.delayAttr);
        };
      })(this), delay + self.options.transitionTime + 10);
    });
    setTimeout((function(_this) {
      return function() {
        $wrapper.removeClass('scroll-appeared scroll-appear').removeAttr('data-scroll-appear data-scroll-appeared ' + _this.finishingAttr);
        return _this.stepDone();
      };
    })(this), maxDelay + self.options.transitionTime + 10);
    return this;
  };

  ScrollAppear.prototype.stepDone = function() {
    this.countLoaded++;
    if (this.countLoaded === this.count) {
      this.finish();
    }
    return this;
  };

  ScrollAppear.prototype.finish = function() {
    this.window.off(this.options.eventClass);
    return this;
  };

  ScrollAppear.prototype.worker = function() {
    var isBottom, scrollBreakPoint, self;
    self = this;
    scrollBreakPoint = this.window.scrollTop() + this.window.height() / this.options.windowHeightFactor;
    isBottom = this.window.scrollTop() >= $(document).height() - this.window.height() * this.options.bottomHeightFactor;
    this.getElements().each(function() {
      var $wrapper;
      $wrapper = $(this);
      if (isBottom || scrollBreakPoint >= $wrapper.offset().top) {
        return self.finishElement($wrapper);
      }
    });
    return this;
  };

  return ScrollAppear;

})();

//# sourceMappingURL=ScrollAppear.js.map
