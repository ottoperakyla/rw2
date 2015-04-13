// need special require.js config for legacy libraries like jquery
requirejs.config({

    // Define paths; relative from js folder
    paths: {
        "jquery"            : "libs/jquery",
        //"jqueryui"          : "libs/jquery-ui",
    },

    // Define dependencies
    shim: {
        "jquery"            : {
            exports: "jquery"
        },
        /*"jqueryui"          : {
            exports: "jquery",
            deps: ["jquery"]
        },*/
    } 
});

require(["jquery"/*, "jqueryui"*/], function($, _) {

});