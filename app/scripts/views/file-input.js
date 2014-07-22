/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
], function ($, _, Backbone) {
    'use strict';

    var FileInputView = Backbone.View.extend({

        el: $('#file-input-form'),

        events: {
            'submit': 'onSubmit'
        },

        initialize: function () {
        },

        onSubmit: function(ev) {
            ev.preventDefault();
            var val = this.$('#file-input-text').val();
            app.router.navigate("/" + val, true);
        },

        render: function () {
        }
    });

    return FileInputView;
});


