/*global require*/
'use strict';

require.config({
    shim: {
        snap: {
            deps: [''],
            exports: 'snap'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash',
        snap: '../bower_components/snap.svg/dist/snap.svg'
    }
});

require([
    'backbone',
    'views/file-input',
    'views/prototype'
], function (Backbone, FileInputView, PrototypeView) {

    window.app = {};
    app.views = {};
    app.models = {};
    app.collections = {};

    var Router = Backbone.Router.extend({
        routes: {
            ''           : 'index',
            ':fileName'  : 'loadFile',
            '*anything'  : 'anything',
        }
    });

    app.router = new Router();

    app.router
        .on('route:index', function() {
            console.log("Index");
        })
        .on('route:loadFile', function(fileName) {
            if (fileName.match('.svg')) {
                console.log("Load file: ", fileName);
                var prototypeView = new PrototypeView({fileName: fileName});
            } else {
                // Visa felmeddelande, inte en svg-fil
            }
        })
        .on('route:anything', function() {
            console.log("404?");
        });

    var fileView = new FileInputView();

    Backbone.history.start(/*{ pushState: true, root: "/" }*/);
});
