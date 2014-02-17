/**
 * Django Restviews - Javascript implementation
 *
 * This is the main component of the Restviews framework, enabling
 * dynamic Rest-based views.
 *
 * It's heavily dependend on jQuery and KnockoutJs
 */

/**
 * A Model for Rest GridViews.
 *
 * @param url The URL to the REST-API
 * @constructor
 */

var GridViewModel = function (url) {

    this.url = url;
    this.headers = ko.observableArray();
    this.rows = ko.observableArray();
    this.headersLoaded = false;
    this.rowsLoaded = false;
    this.hideColumns = [];
    this.canCreate = false;
    this.canModify = false;
    this.canDelete = false;
    this.canView = false;
    this.fields = {};
    this.optionsLoaded = false;

};

/**
 * Calls the given URL per "OPTIONS" method and returns informations about
 * fields and methods.
 *
 * @param url       REST-URL to call
 * @param callback  Callback to call with results
 */

GridViewModel.prototype.getOptions = function (url, callback) {

    $.ajax(
        this.url,
        {
            type: "OPTIONS",
            success: function (data, status, xhr) {

                var retval = {

                    canCreate: false,
                    canModify: false,
                    canDelete: false,
                    canView: false,
                    fields: {}

                };

                // Get allowed methods

                var methods = xhr.getResponseHeader("Allow").split(", ");

                if ($.inArray("POST", methods) != -1) {

                    retval["canCreate"] = this.canCreate = true;

                }

                if ($.inArray("PUT", methods) != -1) {

                    retval["canModify"] = this.canModify = true;

                }

                if ($.inArray("DELETE", methods) != -1) {

                    retval["canDelete"] = this.canDelete = true;

                }

                if ($.inArray("GET", methods) != -1) {

                    retval["canView"] = this.canView = true;

                }

                retval["fields"] = this.fields = data.actions;

                if (callback === undefined) {



                }

                this.optionsLoaded = true;

            },
            context: this

        }

    );

};

/**
 * Try to load grid columns by calling the URL using the OPTIONS method and
 * analyzing the output.
 */

GridViewModel.prototype.loadHeaders = function () {

    if (this.headers().length == 0) {

        this.getOptions(this.url, this.fillHeaders);

    } else {

        if (!this.optionsLoaded) {

            this.getOptions(this.url);

        }

        if (!this.headersLoaded) {

            this.headersLoaded = true;

        }

    }

};

/**
 * Fill the headers using the received OPTIONS metadata
 *
 * @param options Options array
 */

GridViewModel.prototype.fillHeaders = function (options) {

    // Analyze the options to fill the grid

    if (!options["canView"]) {

        return;

    }

    var headers = [];

    $.each(options["fields"]["POST"], function (key, value) {

        if (
            ($.inArray(key, this.hideColumns) == -1) &&
            (value.hasOwnProperty("label"))
        ) {

            value["_field"] = key;

            headers.push(value);

        }

    });

    this.headers = ko.observableArray(headers);

    this.headersLoaded = true;

};

/**
 * Load the grid's rows (aka "Data")
 */

GridViewModel.prototype.loadRows = function () {

    $.ajax(
        this.url,
        {
            type: "GET",
            success: function (data, status, xhr) {

                // We have the data. Simply use an observableArray to
                // make it Knockout-compliant

                this.rows = ko.observableArray(data);

                this.rowsLoaded = true;


            },
            context: this
        }
    );

};

/**
 * Helper function, if all headers and rows are loaded
 *
 * @returns {boolean} Wether everything's ready to go
 */

GridViewModel.prototype.allLoaded = function () {

    return this.headersLoaded && this.rowsLoaded;

}

/**
 * Load the Headers and the Rows!
 */

GridViewModel.prototype.loadAll = function () {

    this.loadHeaders();
    this.loadRows();

};

/**
 * This function is called later and applies the Knockout-Bindings once
 * all grids are fully loaded.
 */

function doActivateGrids() {

    $.each(gridModels, function (key, value) {

        if (! value.allLoaded()) {

            setTimeout(doActivateGrids, 1000);

            return;

        }

        ko.applyBindings(gridModels);

    });

}

var gridModels = {};

var activateGrids = false;

// Activate the grids, once the document is loaded

$( document ).ready(function() {

    if (activateGrids) {

        doActivateGrids();

    }

});