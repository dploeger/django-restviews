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

// Collect multiple "new item" buttons

rv.showNewItemDialogButtons = [];

// Action functions

rv.actionsRegistry = {};

// Which UI implementation is used?

rv.uiImplementation = "";

// Selector for the "new item" box for keyboard navigation

rv.$newItemSelector = null;

// UI implementation specific functions

rv.ui = {};

// Set Moment language

rv.lang = navigator.language || navigator.userLanguage;

// Activate the grids, once the document is loaded

$( document ).ready(function() {

    if (!$.isEmptyObject(rv.grids)) {

        rv.activateGrids();
        rv.addNewItemShorcut();

    }

});