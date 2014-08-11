/*global define*/

define([
    'jquery',
    'underscore',
    'snap'
], function($, _) {
    'use strict';


    function parseInstruction (string, el) {
        // matchar tex: #press
        var stateMatch = (string).match(/^#([a-z0-9-]+)/i);
        // matchar tex: @click
        var eventMatch = (string).match(/^@([a-z0-9-]+)/i);
        // matchar tex: Fade:700
        var numberMatch = (string).match(/^([a-z]*):([0-9]+)$/i);
        // matchar tex: ??
        var argumentMatch = (string).match(/^([a-z]*):(\S+)$/i);

        if (stateMatch !== null) {
            var stateName = stateMatch[1];
            var dataStates = el.attr('data-states');
            if (dataStates) {
                dataStates += ' ' + stateName;
            } else {
                dataStates = stateName;
            }
            el.attr('data-states', dataStates);

        } else if (eventMatch !== null) {
            // TODO: konvertera "#toggled" till "#toggled-on" eller "#toggled-off"
            var eventName = eventMatch[1];
            var dataEvents = el.attr('data-events');
            if (dataEvents) {
                dataEvents += ' ' + eventName;
            } else {
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
    };


    function parseAllInstructions (paper) {
        paper.selectAll('[data-clean-id]').forEach(function(el) {
            var id = el.attr('data-clean-id');
            id.split(' ').forEach(function(substring) {
                parseInstruction(substring, el);
            });
        });
    };

    return parseAllInstructions;

});
