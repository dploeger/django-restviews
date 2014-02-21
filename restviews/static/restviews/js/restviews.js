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

var RestViewsGridViewModel = function (url) {

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

RestViewsGridViewModel.prototype.getOptions = function (url, callback) {

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

RestViewsGridViewModel.prototype.loadHeaders = function () {

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

RestViewsGridViewModel.prototype.fillHeaders = function (options) {

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

RestViewsGridViewModel.prototype.loadRows = function () {

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

RestViewsGridViewModel.prototype.allLoaded = function () {

    return this.headersLoaded && this.rowsLoaded;

}

/**
 * Load the Headers and the Rows!
 */

RestViewsGridViewModel.prototype.loadAll = function () {

    this.loadHeaders();
    this.loadRows();

};

/**
 * This function is called later and applies the Knockout-Bindings once
 * all grids are fully loaded.
 */

function restViewsDoActivateGrids() {

    $.each(restViewsGridModels, function (key, value) {

        if (! value.allLoaded()) {

            setTimeout(restViewsDoActivateGrids, 1000);

            return;

        }

        ko.applyBindings(restViewsGridModels);

    });

}

/**
 * Show the "New Item"-dialog for a grid
 *
 * @param gridName Name of grid
 */

function restViewsNewItem(gridName) {

    $("#" + gridName + "NewItem").modal();
    $("#RestViewsNew" + gridName + " input")[0].focus();

}

/**
 * Save a restviews form
 *
 * @param formName The name of the form
 * @param viewModel The name of the viewmodel
 */

function restViewsSaveForm(formName, viewModel) {

    var inputs = $("#" + formName + " input").toArray();

    // Add textareas

    inputs = inputs.concat($("#" + formName + " textarea").toArray());

    var data = {};

    for (var i = 0; i < inputs.length; i = i + 1) {

        if (!$(inputs[i]).data("restViewsIsValid")) {

            // Form is invalid. Cancel saving and do some shaking.

            $("#" + formName)
                .animate({ left: "+=50" }, 50)
                .animate({ left: "-=50" }, 50)
                .animate({ left: "+=50" }, 50)
                .animate({ left: "-=50" }, 50);

            return;

        }

        data[$(inputs[i]).data("restViewsField")] = $(inputs[i]).val();

    }

    var url = restViewsGridModels[viewModel].url;

    $.ajax(
        url,
        {
            data: ko.toJSON(data),
            type: "POST",
            error: function(xhr, status, error) {

                alert("NOE");

            },
            success: function (data, status, xhr) {

                alert("JAU");

            }
        }
    );

}

/**
 * Validate a string based on a regular expression
 *
 * @param value The value to check
 * @param check The regular expression
 * @returns {Boolean*} Wether the regular expression matches
 */

function restViewsValidate(value, check) {

    return value.match(new RegExp(check, "gi"));

}

/**
 * Validate a date/time-string by trying to create a Date object from it
 *
 * @param value The date/time string to check
 * @param check (not used)
 * @returns {boolean} Wether the string can be converted to a date.
 */

function restViewsValidateDateTime(value, check) {

    var parsedDate = Date.parse(value);

    return parsedDate instanceof Date;

}

/**
 * Check a string, if it resembles an e-mail address.
 *
 * Based on http://www.regular-expressions.info/email.html
 *
 * @param value String to check
 * @param check (not used)
 * @returns {Boolean} Wether the value is an e-mail-address
 */

function restViewsValidateEmail(value, check) {

    return restViewsValidate(
        value,
        "\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b"
    )

}

/**
 * Check a string, if it resembles an URL.
 *
 * Based on http://blog.mattheworiordan.com/post/
 * 13174566389/url-regular-expression-for-links-with-or-without-the
 *
 * @param value String to check
 * @param check (not used)
 * @returns {Boolean} Wether the value is an URL
 */

function restViewsValidateUrl(value, check) {

    return restViewsValidate(
        value,
        "((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]" +
        "+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)" +
        "?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)",
        "gi"
    );

}

// Custom Knockout binding handlers

ko.bindingHandlers.restViewsLabel = {
    init: function(
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
        ) {

        element.setAttribute(
            "for",
            "RestViews" + valueAccessor() + "New" + bindingContext.$data.label
        );

    },

    update: function(
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
        ) {

        element.setAttribute(
            "for",
            "RestViews" + valueAccessor() + "New" + bindingContext.$data.label
        );

        var label = bindingContext.$data.label;

        if (bindingContext.$data.required) {

            label = "*" + label;
        }

        $(element).html(label);

    }
};

ko.bindingHandlers.restViewsInput = {
    update: function(
        element,
        valueAccessor,
        allBindings,
        viewModel,
        bindingContext
        ) {

        var el = $(element);

        el.attr(
            "id",
            "RestViews" + valueAccessor() + "New" + bindingContext.$data.label
        );

        var type = bindingContext.$data.type;

        el.data(
            "restViewsValidationFunction",
            "restViewsValidate"
        );

        el.data(
            "restViewsValidationString",
            ".*"
        );

        el.data(
            "restViewsField",
            bindingContext.$data["_field"]
        );

        el.attr(
            "type",
            "text"
        );

        el.data(
            "restViewsRequired",
            bindingContext.$data.required
        );

        if (bindingContext.$data.required) {

            // Assign error class to a required input

            el.parent().parent().addClass("has-error");

            el.data(
                "restViewsIsValid",
                false
            );

        } else {

            el.data(
                "restViewsIsValid",
                true
            );

        }

        switch (type) {

            case "number":
                el.attr(
                    "type",
                    "number"
                );
                el.data(
                    "restViewsValidationString",
                    "[0-9]*"
                );
                break;

            case "float":
                el.attr(
                    "type",
                    "number"
                );
                el.data(
                    "data-restViewsValidationString",
                    "[0-9,.]*"
                );
                break;

            case "password":
                el.attr(
                    "type",
                    "password"
                );
                break;

            case "datetime":
                el.attr(
                    "type",
                    "datetime"
                );
                el.data(
                    "restViewsValidationFunction",
                    "restViewsValidateDateTime"
                );
                break;

            case "email":
                el.attr(
                    "type",
                    "email"
                );
                el.data(
                    "restViewsValidationFunction",
                    "restViewsValidateEmail"
                );
                break;

            case "url":
                el.attr(
                     "type",
                     "url"
                );
                el.data(
                    "restViewsValidationFunction",
                    "restViewsValidateUrl"
                );
                break;

            case "color":
                el.attr(
                    "type",
                    "color"
                );
                el.data(
                    "restViewsValidationFunction",
                    "^#[0-9]{6}"
                );
                break;

            default:
                break;

        }

        var validateHandler = function(ev) {

            var el = $(ev.target);

            var value = el.val();

            var validationFunction = el.data(
                "restViewsValidationFunction"
            );
            var validationString = el.data(
                "restViewsValidationString"
            );

            var formGroup = $(ev.target.parentNode.parentNode);

            if (formGroup.hasClass("has-error")) {

                formGroup.removeClass("has-error");

            }

            if (formGroup.hasClass("has-success")) {

                formGroup.removeClass("has-success");

            }

            var validated;

            if (
                (el.data("restViewsRequired")) &&
                (value == "")
            ) {

                validated = false;

            } else {

                validated = window[validationFunction](value, validationString);

            }

            el.data(
                "restViewsIsValid",
                validated
            );

            if (validated) {

                formGroup.addClass("has-success");

            } else {

                formGroup.addClass("has-error");

            }

        }

        el.change(validateHandler);
        el.keyup(validateHandler);

    }
};

var restViewsGridModels = {};

var restViewsActivateGrids = false;

// Activate the grids, once the document is loaded

$( document ).ready(function() {

    if (restViewsActivateGrids) {

        restViewsDoActivateGrids();

    }

});