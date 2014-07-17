(function(Snap, _) {
    "use strict";
    
    function getFileName() {
        var queryString = window.location.search;
        if (!queryString) {
            return false;
        }
        var fileName = queryString.replace('?', '');
        if (fileName.length && fileName.match('.svg')) {
            return fileName;
        }
    }
    
    function fixClickability(paper) {
        // gör fill=none transparent istället, för att kunna hantera events.
        paper.selectAll('[data-events][fill="none"]').attr({
            fill: 'black',
            fillOpacity: '0'
        });
    }
    
    function divideScrollLayers(paper) {
        return {
            fixed: paper.selectAll('[data-clean-id~="Fixed"]'),
            scroll: paper.selectAll('[data-clean-id~="Scroll"]')
        }
    }
    
    function initDisplay(paper) {
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
    }
    
    function toggleOnOff(snapElement, bool) {
        // sätt data-toggled-on till bool, eller toggla
        var newValue = bool;
        if (bool === undefined) {
            var toggle = isToggledOn(snapElement);
            newValue = !toggle;
        }
        snapElement.attr('data-toggled-on', newValue.toString());
    }
    
    function isToggledOn(snapElement) {
        var dataToggle = snapElement.attr('data-toggled-on');
        return (dataToggle === 'true');
    }
    
    function toggleVisibility(snapElement, bool) {
        // sätt data-visible till bool, eller toggla data-visible
        var newValue = bool;
        if (bool === undefined) {
            var visible = isVisible(snapElement);
            newValue = !visible;
        }
        snapElement.attr('data-visible', newValue.toString());
    }
    
    function isVisible(snapElement) {
        var dataVisible = snapElement.attr('data-visible');
        return (dataVisible === 'true' || dataVisible === undefined);
    }
    
    function addCSSTransitions(paper) {
        paper.selectAll('[data-number-fade]').forEach(function(el) {
            var fadeTime = el.attr('data-number-fade');
            fadeTime = parseInt(fadeTime);
            
            // TODO: se till att hantera tidigare style-attribut.
            el.attr('style', '-webkit-transition: opacity ' + fadeTime + 'ms;');
        });
    }
    
    function attachEvents(paper) {
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
    }
    
    function addLinks(paper) {
        paper.selectAll('[data-arg-link]').forEach(function(el) {
            var targetDestination = el.attr('data-arg-link');
            
            el.click(function(e) {
                window.location.search = targetDestination;
            });
        });
    }
    
    function parseAllInstructions(paper) {
        paper.selectAll('[data-clean-id]').forEach(function(el) {
            var id = el.attr('data-clean-id');
            _(id.split(' ')).each(function(substring) {
                parseInstruction(substring, el);
            });
        });
    }
    
    function parseInstruction(string, el) {
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
    }
    
    function cleanIds(paper) {
        paper.selectAll('*').forEach(function(el) {
            var id = el.attr('id');
            
            if (id !== undefined && id !== 'adobe_illustrator_pgf') {
                id = cleanIllustratorId(id);
                el.attr('data-clean-id', id);
            }
        });
        
        return paper;
    }
    
    function cleanIllustratorId(id) {
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
    }
    
    function morphShape(el, targetEl, duration) {
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
    }
    
    function animatePoints(poly, targetPoly, duration) {
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
    }
    
    function init(svgData) {
        var paper = Snap('#scroll');
        
        paper.append(svgData);
        
        paper.select('svg').attr({
            viewBox: '0 0 1000 10000',
            height: 10000,
            width: 1000
        });
        
        cleanIds(paper);
        initDisplay(paper);
        parseAllInstructions(paper);
        addCSSTransitions(paper);
        attachEvents(paper);
        addLinks(paper);
        fixClickability(paper);
        
        var scrollLayers = divideScrollLayers(paper);
        
        Snap('#fixed').append(scrollLayers.fixed);
        
        // sätt visibility baserat på states också
    }
    
    (function(Snap, _) {
        var fileName = getFileName();
        var fileInputForm = Snap.select('#file-input-form');
        
        if (fileName) {
            fileInputForm.remove();
            Snap.load(fileName, init);
        } else {
            Snap.select('body').attr('style', 'overflow: hidden;')
            fileInputForm.node.addEventListener("submit", function(e) {
                e.preventDefault();
                window.location.search = Snap.select('#file-input-text').node.value;
                return false;
            }, false);
            return;
        }
    })(Snap, _);
    
})(Snap, _);