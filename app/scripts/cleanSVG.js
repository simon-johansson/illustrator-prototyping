/*global define*/

define([
    'jquery',
    'underscore',
    'snap'
], function($, _) {
    'use strict';

    function cleanIds(paper) {
        paper.selectAll('*').forEach(function(el) {
            var id = el.attr('id');

            if (id && typeof id !== "undefined" && id !== 'adobe_illustrator_pgf') {
                id = cleanIllustratorId(id);
                el.attr('data-clean-id', id);
            }
        });

        return paper;
    };

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
    };

    function initDisplay (paper) {
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
    };


    return function(paper) {
        cleanIds(paper);
        initDisplay(paper);

        return paper;
    }

});
