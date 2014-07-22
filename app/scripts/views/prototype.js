/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'snap'
], function ($, _, Backbone, JST) {
    'use strict';

    var PrototypeView = Backbone.View.extend({
        template: JST['app/scripts/templates/prototype.ejs'],

        el: $('.app-container'),

        events: {},

        initialize: function (args) {
            this.render();

            var fileName = args.fileName;
            Snap.load(fileName, this.initSnap.bind(this));
        },

        initSnap: function(svgData) {
            console.log(arguments);

            var paper = Snap('#scroll');
            paper.append(svgData);

            paper.select('svg').attr({
                // Gör dessa värden dynamiska
                viewBox: '0 0 1000 10000',
                height: 10000,
                width: 1000
            });

            this.cleanIds(paper);
            this.initDisplay(paper);
            this.parseAllInstructions(paper);
            this.addCSSTransitions(paper);
            this.attachEvents(paper);
            this.addLinks(paper);
            this.fixClickability(paper);

            var scrollLayers = this.divideScrollLayers(paper);

            Snap('#fixed').append(scrollLayers.fixed);

            // sätt visibility baserat på states också
        },

        fixClickability: function (paper) {
            // gör fill=none transparent istället, för att kunna hantera events.
            paper.selectAll('[data-events][fill="none"]').attr({
                fill: 'black',
                fillOpacity: '0'
            });
        },

        divideScrollLayers: function (paper) {
            return {
                fixed: paper.selectAll('[data-clean-id~="Fixed"]'),
                scroll: paper.selectAll('[data-clean-id~="Scroll"]')
            }
        },

        initDisplay: function (paper) {
            // Illustrator exporterar bara display-attribut när de skiljer sig från sin närmaste parent.

            // loopa ihop en selectorkedja av varannan [display="inline"] resp [display="none"].
            // sätt data-display på alla children till motsv värde.
            var selectorChain = '';
            var maxSelectorDepth = 20; // TODO: Gör om till while-loop och fortsätt bara så länge något väljs.
            for (var i = 0; i < maxSelectorDepth; i++) {
                var selector = selectorChain ? selectorChain + ', ' + selectorChain + ' *' : '*';
                var selection = paper.selectAll(selector);
                selection.forEach(function(el) {
                    el.attr('data-display', (i % 2) ? 'false' : 'true');
                });
                selectorChain += (i % 2) ? ' [display="inline"]' : ' [display="none"]';
            }

            // Ta bort alla ursprungliga display-attribut
            paper.selectAll('*').forEach(function(el) {
                el.node.removeAttribute('display');
            });
        },

        toggleOnOff: function (snapElement, bool) {
            // sätt data-toggled-on till bool, eller toggla
            var newValue = bool;
            if (bool === undefined) {
                var toggle = isToggledOn(snapElement);
                newValue = !toggle;
            }
            snapElement.attr('data-toggled-on', newValue.toString());
        },

        isToggledOn: function (snapElement) {
            var dataToggle = snapElement.attr('data-toggled-on');
            return (dataToggle === 'true');
        },

        toggleVisibility: function (snapElement, bool) {
            // sätt data-visible till bool, eller toggla data-visible
            var newValue = bool;
            if (bool === undefined) {
                var visible = isVisible(snapElement);
                newValue = !visible;
            }
            snapElement.attr('data-visible', newValue.toString());
        },

        isVisible: function (snapElement) {
            var dataVisible = snapElement.attr('data-visible');
            return (dataVisible === 'true' || dataVisible === undefined);
        },

        addCSSTransitions: function (paper) {
            paper.selectAll('[data-number-fade]').forEach(function(el) {
                var fadeTime = el.attr('data-number-fade');
                fadeTime = parseInt(fadeTime);

                // TODO: se till att hantera tidigare style-attribut.
                el.attr('style', '-webkit-transition: opacity ' + fadeTime + 'ms;');
            });
        },

        attachEvents: function (paper) {
            // TODO: förbered för mer än bara standardevent
            // dvs t ex @click:me#toggle-on
            paper.selectAll('[data-events]').forEach(function(el) {
                var eventNames = el.attr('data-events').split(' ');
                _(eventNames).each(function(eventName) {
                    var parent = Snap(el).parent();
                    switch (eventName) {
                        case 'click':
                            parent.attr('data-interactive', 'true');
                            el.click(function(e) {
                                toggleOnOff(parent);
                            });
                          break;
                        case 'hover':
                            parent.attr('data-interactive', 'true');
                            el.mouseover(function(e) {
                                if (isToggledOn(parent)) {
                                    // kom ihåg om det redan var påtogglat.
                                    parent.attr('data-pre-toggle', 'true');
                                } else {
                                    toggleOnOff(parent, true);
                                }
                            });
                            el.mouseout(function(e) {
                                if (parent.attr('data-pre-toggle') === 'true') {
                                    parent.attr('data-pre-toggle', 'false');
                                } else {
                                    toggleOnOff(parent, false);
                                }
                            });
                          break;
                        case 'press':
                            parent.attr('data-interactive', 'true');
                            el.mousedown(function(e) {
                                if (isToggledOn(parent)) {
                                    // kom ihåg om det redan var påtogglat.
                                    parent.attr('data-pre-toggle', 'true');
                                } else {
                                    toggleOnOff(parent, true);
                                }
                            });
                            Snap.select('body').mouseup(function(e) {
                                if (parent.attr('data-pre-toggle') === 'true') {
                                    parent.attr('data-pre-toggle', 'false');
                                } else {
                                    toggleOnOff(parent, false);
                                }
                            });
                          break;
                    }
                });
            });
        },

        addLinks: function (paper) {
            paper.selectAll('[data-arg-link]').forEach(function(el) {
                var targetDestination = el.attr('data-arg-link');

                // el.click(function(e) {
                //     window.location.search = targetDestination;
                // });
            });
        },

        parseAllInstructions: function (paper) {
            var self = this;
            paper.selectAll('[data-clean-id]').forEach(function(el) {
                var id = el.attr('data-clean-id');
                id.split(' ').forEach(function(substring) {
                    self.parseInstruction(substring, el);
                });
            });
        },

        parseInstruction: function (string, el) {
            var stateMatch = (string).match(/^#([a-z0-9-]+)/i);
            var eventMatch = (string).match(/^@([a-z0-9-]+)/i);
            var numberMatch = (string).match(/^([a-z]*):([0-9]+)$/i);
            var argumentMatch = (string).match(/^([a-z]*):(\S+)$/i);

            if (stateMatch !== null) {
                var stateName = stateMatch[1];

                var dataStates = el.attr('data-states');

                if (typeof dataStates === 'string') {
                    dataStates += ' ' + stateName;
                } else if (dataStates === undefined) {
                    dataStates = stateName;
                }

                el.attr('data-states', dataStates);
            } else if (eventMatch !== null) {
                // TODO: konvertera "#toggled" till "#toggled-on" eller "#toggled-off"
                var eventName = eventMatch[1];

                var dataEvents = el.attr('data-events');

                if (typeof dataEvents === 'string') {
                    dataEvents += ' ' + eventName;
                } else if (dataEvents === undefined) {
                    dataEvents = eventName;
                }

                el.attr('data-events', dataEvents);
            } else if (numberMatch !== null) {
                var label = numberMatch[1].toLowerCase();
                var duration = numberMatch[2];
                el.attr('data-number-' + label, duration);
            } else if (argumentMatch !== null) {
                var label = argumentMatch[1].toLowerCase();
                var duration = argumentMatch[2];
                el.attr('data-arg-' + label, duration);
            }
        },

        cleanIds: function (paper) {
            var self = this;
            paper.selectAll('*').forEach(function(el) {
                var id = el.attr('id');

                if (id && typeof id !== "undefined" && id !== 'adobe_illustrator_pgf') {
                    id = self.cleanIllustratorId(id);
                    el.attr('data-clean-id', id);
                }
            });

            return paper;
        },

        cleanIllustratorId: function (id) {
            // Illustrator gör om lager-/objekt-namn till id:n med specialtecken i hexadecimal form.
            // Funktionen konverterar till vanliga tecken så det blir lättare att jobba med strängarna

            var charCodeRegex = /_x([\da-f]{2,4})_/ig; // fångar hexadecimala tal omgivna av _x och _

            var cleanId = id.replace(
                charCodeRegex,
                function(match, capture) {
                    // byt ut matchade hextal mot motsvarande utf-tecken
                    return String.fromCharCode(
                        parseInt(capture, 16)
                    );
                }
            );

            // ersätt kvarvarande '_' med ' '
            cleanId = cleanId.replace(/_/g, ' ');

            return cleanId;
        },

        morphShape: function (el, targetEl, duration) {
            // morpha mellan två path, rect eller polygons

            if (el.type !== targetEl.type) {
                throw 'Different path types, ' + el.type + ' and ' + targetEl.type;
                return;
            }

            switch (el.type) {
                case 'path':
                    el.animate({d: targetEl.attr('d')}, duration);
                  break;
                case 'rect':
                    el.animate({
                        x: targetEl.attr('x'),
                        y: targetEl.attr('y'),
                        width: targetEl.attr('width'),
                        height: targetEl.attr('height')
                    }, duration);
                  break;
                case 'polygon':
                    animatePoints(el, targetEl, duration);
                  break;
            }
        },

        animatePoints: function (poly, targetPoly, duration) {
            var startPoints = poly.attr('points');
            var targetPoints = targetPoly.attr('points');

            function splitPoints(pointsString) {
                var pointsArray = [];
                _(pointsString.split(/[ ,]/)).each(function(str) {
                    var floatPoint = parseFloat(str);
                    if (!isNaN(floatPoint)) {
                        pointsArray.push(floatPoint);
                    }
                });
                return pointArray;
            };

            var splitStartPoints = splitPoints(startPoints);
            var splitTargetPoints = splitPoints(targetPoints);

            var start = Math.min(splitStartPoints.length, splitTargetPoints.length);
            var end = Math.max(splitStartPoints.length, splitTargetPoints.length);

            for (var i = start; i < end; i++) {
                if (splitStartPoints[i] == undefined) {
                    splitStartPoints.push(splitStartPoints[splitStartPoints.length - 2]);
                } else if (splitTargetPoints[i] == undefined) {
                    splitTargetPoints.push(splitTargetPoints[splitTargetPoints.length - 2]);
                }
            }

            Snap.animate(splitStartPoints, splitTargetPoints, function (val) {
                var merged = '';
                var even = true;
                _(val).each(function(v) {
                    merged += v.toString();
                    merged += even ? ',' : ' ';
                    even = !even;
                });
                poly.attr('points', merged);
            }, duration);
        },

        render: function () {
            this.$el.html(this.template());
        }
    });

    return PrototypeView;
});
