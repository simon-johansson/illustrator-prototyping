/*global define*/

define([
    'jquery',
    'underscore',
    'snap'
], function($, _) {
    'use strict';

    function BaseEvent (el) {
        this.el = el;
        this.parentEl = Snap(el).parent();

        this.isToggledOn = function() {
            var dataToggle = this.parentEl.attr('data-toggled-on');
            return (dataToggle === 'true');
        };
        this.isVisible = (function(self) {
            var dataVisible = self.parentEl.attr('data-visible');
            return (dataVisible === 'true' || dataVisible === undefined);
        })(this);

        this.parentEl.attr('data-interactive', 'true');
    }
    BaseEvent.prototype.toggleOnOff = function (bool) {
        var newBool = (bool !== undefined) ? bool : !this.isToggledOn();
        
        this.parentEl.attr('data-toggled-on', newBool);
    }
    BaseEvent.prototype.toggleVisibility = function (bool) {
        // sätt data-visible till bool, eller toggla data-visible
        var newValue = bool;
        if (typeof newValue === 'undefined') {
            this.isVisible = !this.isVisible;
        } else {
            this.isVisible = newValue;
        }
        this.parentEl.attr('data-visible', this.isVisible);
    }


    function ClickEvent (el) {
        BaseEvent.call(this, el); // call super constructor.

        this.el.click(function(e) {
            this.toggleOnOff();
        }, this);
    }
    // subclass extends superclass
    ClickEvent.prototype = Object.create(BaseEvent.prototype);
    ClickEvent.prototype.constructor = ClickEvent;


    function HoverEvent (el) {
        BaseEvent.call(this, el); // call super constructor.
        this.el
            .mouseover(function(e) {
                if (this.isToggledOn) {
                    // kom ihåg om det redan var påtogglat.
                    this.parentEl.attr('data-pre-toggle', 'true');
                } else {
                    this.toggleOnOff(true);
                }
            }, this)
            .mouseout(function(e) {
                if (this.parentEl.attr('data-pre-toggle') === 'true') {
                    this.parentEl.attr('data-pre-toggle', 'false');
                } else {
                    this.toggleOnOff(false);
                }
            }, this);
    }
    // subclass extends superclass
    HoverEvent.prototype = Object.create(BaseEvent.prototype);
    HoverEvent.prototype.constructor = HoverEvent;


    function PressEvent (el) {
        BaseEvent.call(this, el); // call super constructor.

        this.el.mousedown(function(e) {
            if (isToggledOn(this.parentEl)) {
                // kom ihåg om det redan var påtogglat.
                this.parentEl.attr('data-pre-toggle', 'true');
            } else {
                this.toggleOnOff(true);
            }
        }, this);
        Snap.select('body').mouseup(function(e) {
            if (this.parentEl.attr('data-pre-toggle') === 'true') {
                this.parentEl.attr('data-pre-toggle', 'false');
            } else {
                this.toggleOnOff(false);
            }
        });
    }
    // subclass extends superclass
    PressEvent.prototype = Object.create(BaseEvent.prototype);
    PressEvent.prototype.constructor = HoverEvent;

    function events (el, event) {
        return {
            click: function() {
                return new ClickEvent(el);
            },
            hover: function() {
                return new HoverEvent(el);
            },
            press: function() {
                return new PressEvent(el);
            },
            // swipeLeft/Right/Up/Down
            //
        }[event]()
    }

    function attachEvents (paper) {
        // TODO: förbered för mer än bara standardevent
        // dvs t ex @click:me#toggle-on
        var self = this;
        paper.selectAll('[data-events]').forEach(function(el) {
            var eventNames = el.attr('data-events').split(' ');
            eventNames.forEach(function(eventName) {
                console.log(eventName);
                events(el, eventName);
            });
        });
    }

    function addCSSTransitions (paper) {
        paper.selectAll('[data-number-fade]').forEach(function(el) {
            var fadeTime = el.attr('data-number-fade');
            fadeTime = parseInt(fadeTime);

            // TODO: se till att hantera tidigare style-attribut.
            el.attr('style', '-webkit-transition: opacity ' + fadeTime + 'ms;');
        });
    }

    function addLinks (paper) {
        paper.selectAll('[data-arg-link]').forEach(function(el) {
            var targetDestination = el.attr('data-arg-link');

            // Spara SVG-data i en Backbone-modell. Behöver då inte göra page-refresh, också möjligt att animera mellan olika sidor.

            el.click(function(e) {
                app.router.navigate("/" + targetDestination, true);
            });
        });
    }

    return function(paper) {
        addCSSTransitions(paper);
        attachEvents(paper);
        addLinks(paper);
        return paper;
    };

});
