/**
 * Django Restviews - Javascript implementation
 *
 * This is the main component of the Restviews framework, enabling
 * dynamic Rest-based views.
 *
 * It heavily depends on jQuery and KnockoutJs
 *
 * Bootstrap functions
 */

// Create the RestViews namespace

var rv = {};

// Configured grids

rv.grids = {};

//

rv.showNewItemDialogButtons = [];

// Activate the grids, once the document is loaded

$( document ).ready(function() {

    var keys = [];
    for(var k in rv.grids) keys.push(k);

    if (keys.length > 0) {

        rv.activateGrids();
        rv.addNewItemShorcut();

    }

});