/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'snap',
    'cleanSVG',
    'parseSVG',
    'attachEvents'
], function ($, _, Backbone, JST, Snap, cleanSVG, parseSVG, attachEvents) {
    'use strict';

    var PrototypeView = Backbone.View.extend({
        template: JST['app/scripts/templates/prototype.ejs'],

        el: $('.app-container'),

        // Kan vi använda backbone-events på något sätt? Blir svårt med selectorerna, eller?
        events: {},

        initialize: function (args) {
            this.render();

            var fileName = args.fileName;
            Snap.load(fileName, this.onLoad.bind(this));
        },

        onLoad: function(svgData) {
            var paper = Snap('#scroll');
            paper.append(svgData);

            // Ingen snygg lösning, kom på något bättre
            $('body').css({
                height: '2000px',
                overflow: "scroll"
            });

            paper.select('svg').attr({
                // Gör dessa värden dynamiska?
                viewBox: '0 0 1000 10000',
                height: 10000,
                width: 1000
            });

            cleanSVG(paper);
            parseSVG(paper);
            attachEvents(paper);

            // Flytta ut vissa av dessa funktioner till separata moduler
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

        /* ---------- Work in progress ---------- */
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

        /* ---------- Work in progress ---------- */
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
