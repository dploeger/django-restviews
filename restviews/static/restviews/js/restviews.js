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
 * @param gridModel The name of the instance
 * @property {String} url URL to REST-backend
 * @property {String} gridModel The name of the instance
 * @property {ko.observableArray} fields Fields of the GridView
 * @property {ko.observableArray} data The actual data of the Gridview
 * @property {boolean} fieldsLoaded Are the fields available?
 * @property {boolean} dataLoaded Is the data available?
 * @property {boolean} environmentInterpret Has environment interpretation
 *  taken place
 * @property {Array} hideFields Should some fields be hidden?
 * @property {boolean} canCreate can the user create objects?
 * @property {boolean} canUpdate can the user update objects?
 * @property {boolean} canDelete can the user delete objects?
 * @property {boolean} canView can the user view objects?
 * @property {object} actions available row level actions
 * @property {boolean} optionsLoaded has the OPTIONS call been made?
 * @property {String} csrftoken The current CSRF token from the cookies
 * @property {String} itemId field holding the id of the item
 * @property {boolean} paginationEnabled Enable pagination feature?
 * @property {int} itemsPerPage Number of items per Page
 * @property {int} maxPages Maximum count of pages
 * @property {int} currentPage Current page to display
 * @property {String} paginateByParam URL parameter for "itemsPerPage"
 * @property {String} pageParam URL parameter for "currentPage"
 * @property {ko.observableArra} pageRange A range of valid pages
 * @constructor
 */

var RestViewsGridViewModel = function (url, gridModel) {

    if (url.match(/\/$/)) {

        url = url.substr(0, url.length - 1);

    }

    this.url = url;
    this.gridModel = gridModel;

    this.fields = ko.observableArray();
    this.data = ko.observableArray();
    this.fieldsLoaded = false;
    this.dataLoaded = false;
    this.environmentInterpreted = false;
    this.hideFields = [];
    this.canCreate = ko.observable(false);
    this.canUpdate = ko.observable(false);
    this.canDelete = ko.observable(false);
    this.canView = ko.observable(false);
    this.actions = ko.observableArray();
    this.optionsLoaded = false;
    this.csrftoken = "";
    this.itemId = "";

    this.paginationEnabled = false;
    this.itemsPerPage = 0;
    this.maxPages = ko.observable(0);
    this.currentPage = ko.observable(0);
    this.paginateByParam = "";
    this.pageParam = "";
    this.pageRange = ko.observableArray();

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
                    canUpdate: false,
                    canDelete: false,
                    canView: false,
                    fields: {}

                };

                // Get allowed methods

                var methods = xhr.getResponseHeader("Allow").split(", ");

                if ($.inArray("POST", methods) != -1) {

                    retval["canCreate"] = true;
                    this.canCreate(true);

                }

                if ($.inArray("GET", methods) != -1) {

                    retval["canView"] = true;
                    this.canView(true);

                }

                if (callback !== undefined) {

                    callback.apply(retval);

                }

                this.optionsLoaded = true;

            },
            context: this

        }

    );

};

/**
 * Try to load grid fields by calling the URL using the OPTIONS method and
 * analyzing the output.
 */

RestViewsGridViewModel.prototype.loadFields = function () {

    if (this.fields.length == 0) {

        this.getOptions(this.url, this.fillFields);

    } else {

        if (!this.optionsLoaded) {

            this.getOptions(this.url);

        }

        this.interpretEnvironment();

        if (!this.fieldsLoaded) {

            this.fieldsLoaded = true;

        }

    }

};

/**
 * Fill the fields using the received OPTIONS metadata
 *
 * @param options Options array
 */

RestViewsGridViewModel.prototype.fillFields = function (options) {

    // Analyze the options to fill the grid

    if (!options["canView"]) {

        return;

    }

    var fields = [];

    $.each(options["fields"]["POST"], function (key, value) {

        if (
            ($.inArray(key, this.hideColumns) == -1) &&
            (value.hasOwnProperty("label"))
        ) {

            value["_field"] = key;

            fields.push(value);

        }

    });

    this.fields = fields;

    this.interpretEnvironment();

    this.fieldsLoaded = true;

};

/**
 * Resets all alerts for this grid model
 */

RestViewsGridViewModel.prototype.clearAlerts = function () {

    $("#" + this.gridModel + "Alert")
        .html("")
        .removeClass("alert-success alert-error shown")
        .addClass("hidden");

    $("#" + this.gridModel + "NewItemAlert")
        .html("")
        .removeClass("alert-success alert-error shown")
        .addClass("hidden");
};

/**
 * Load the grid's data
 */

RestViewsGridViewModel.prototype.loadData = function () {

    var url = this.url;

    // Clear Alerts

    this.clearAlerts();

    if (this.paginationEnabled) {

        if (url.match(/\?/)) {

            url += "&";

        } else {

            url += "?";

        }

        url += this.pageParam + "=" + this.currentPage();
        url += "&" + this.paginateByParam + "=" + this.itemsPerPage;

    }

    $.ajax(
        url,
        {
            type: "GET",
            success: function (data, status, xhr) {

                // Support pagination

                if (this.paginationEnabled) {

                    this.maxPages(Math.ceil(data.count / this.itemsPerPage));

                    this.pageRange.removeAll();

                    for (var i = 1; i <= this.maxPages(); i = i + 1) {

                        this.pageRange.push(i);

                    }

                    data = data.results;

                }

                // We have the data. Simply use an observableArray to
                // make it Knockout-compliant

                this.data.removeAll();

                for (var i = 0; i < data.length; i = i + 1) {

                    this.data.push(data[i]);

                }

                this.dataLoaded = true;


            },
            error: function (xhr, status, error) {

                $("#" + this.gridModel + "Alert")
                    .html(
                        restViewsTranslation["LoadError"]
                        + ' <a href="#" onClick="restViewsGridModels[\''
                            + this.gridModel
                            + '\'].loadData()">'
                            + restViewsTranslation["Retry"]
                            + '</a>'
                        + "<hr />"
                        + '<pre class="pre-scrollable">'
                        + xhr.responseText
                        + '</pre>'
                    )
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-danger shown");

            },
            context: this
        }
    );

};

/**
 * Helper function, if all fields and data are loaded
 *
 * @returns {boolean} Wether everything's ready to go
 */

RestViewsGridViewModel.prototype.allLoaded = function () {

    return this.fieldsLoaded && this.dataLoaded && this.environmentInterpreted;

}

/**
 * Load the Fields and the Data!
 */

RestViewsGridViewModel.prototype.loadAll = function () {

    this.loadFields();
    this.loadData();

};

/**
 * Try to interpret some environmental settings and header options to set
 * certain variables.
 */

RestViewsGridViewModel.prototype.interpretEnvironment = function () {

    // Check for CSRFtoken. If nothing is found, deactive editing methods

    var csrf = document.cookie.match(/csrftoken=([^;]*)/, document.cookie);

    if (csrf) {

        this.csrftoken = csrf[1];

    } else {

        this.canCreate(false);
        this.canDelete(false);
        this.canUpdate(false);

    }

    // Add delete action, if we can delete

    if (this.canDelete) {

        this.actions.push({
            'label': '<span class="glyphicon glyphicon-remove"></span>',
            'add_class': "close",
            'caller': restViewsDeleteItem,
            'args': ['_item', this.gridModel]
        });

    }

    this.environmentInterpreted = true;

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
 * Delete an item
 * @param item
 */

function restViewsDeleteItem(item, gridModel) {

    var model = restViewsGridModels[gridModel];

    var url = model.url + "/" + item[model.itemId];

    $.ajax(
        url,
        {
            type: "DELETE",
            headers: {
                "X-CSRFToken": restViewsGridModels[viewModel].csrftoken
            },
            contentType: "application/json",
            error: function(xhr, status, error) {

                var alert = $("#" + viewModel + "Alert");

                alert
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-danger shown")
                    .html(restViewsTranslation["DeleteError"] +
                        '<hr /><pre class="pre-scrollable">' +
                        xhr.responseText +
                        "</pre>"
                    );

            },
            success: function (httpdata, status, xhr) {

                // Update grid

                restViewsGridModels[viewModel].loadData();

                var alert = $("#" + viewModel + "Alert");

                alert
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-success shown")
                    .html(restViewsTranslation["DeleteSuccess"]);

            }
        }
    );


}

/**
 * Run a item action
 * 
 * @param trigger The action button, that has been pushed
 */

function restViewsCarryOutAction(trigger) {

    trigger = $(trigger);

    var caller = trigger.data("caller");
    var args = trigger.data("args");

    // Replace "_item" with the provided item

    for (var i = 0; i < args.length; i = i + 1) {

        if (args[i] == "_item") {

            args[i] = JSON.parse(trigger.data("item"));

        }

    }

    caller.apply(args);

}

/**
 * Clears a form and resets the default values
 *
 * @param formName The name of the form
 * @param viewModel The name of the viewmodel
 */

function restViewsClearForm(formName, viewModel) {

    var fields = restViewsGridModels[viewModel].fields;

    for (var i = 0; i < fields.length; i = i + 1) {

        var field = fields[i];
        
        var value = "";
        
        if (field["default"]) {
            
            value = field["default"];
            
        }

        $("#RestViews" + viewModel + "New" + field["_field"]).val(
            value
        );

    }

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
            headers: {
                "X-CSRFToken": restViewsGridModels[viewModel].csrftoken
            },
            contentType: "application/json",
            error: function(xhr, status, error) {

                var alert = $("#" + viewModel + "NewItemAlert");

                alert
                    .removeClass("alert-success alert-danger")
                    .addClass("alert-danger");

                alert.html(restViewsTranslation["SaveError"] +
                    '<hr /><pre class="pre-scrollable">' +
                    xhr.responseText +
                    "</pre>"
                );

                alert.removeClass("hidden").addClass("shown");

            },
            success: function (httpdata, status, xhr) {

                // Update grid

                restViewsGridModels[viewModel].loadData();

                restViewsClearForm(formName, viewModel);

                $("#" + viewModel + "NewItem").modal("hide");

            }
        }
    );

}

/**
 * Validate a string based on a regular expression
 *
 * @param value The value to check
 * @param check The regular expression
 * @returns {boolean} Wether the regular expression matches
 */

function restViewsValidate(value, check) {

    return value.search(new RegExp(check, "gi"));

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
 * @returns {boolean} Wether the value is an e-mail-address
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
 * @returns {boolean} Wether the value is an URL
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

/**
 * Load a specified page
 *
 * @param link A element with page and viewmodel-data
 */

function restViewsLoadPage(link) {

    link = $(link);

    var pageToLoad = link.data("page");
    var viewModel = link.data("viewmodel");

    restViewsGridModels[viewModel].currentPage(pageToLoad);
    restViewsGridModels[viewModel].loadData();

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
            "RestViews" + valueAccessor() + "New" +
                bindingContext.$data["_field"]
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

        if (bindingContext.$data.default) {

            if (el.tagName == "textarea") {

                el.html(bindingContext.$data.default);

            } else {

                el.val(
                    bindingContext.$data.default
                );

            }

        }

        if (bindingContext.$data.required) {

            // Assign error class to a required input

            el.parent().parent().addClass("has-error");

            el.data(
                "restViewsIsValid",
                false
            );

        } else {

            el.parent().parent().addClass("has-success");

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
                    "[0-9]+"
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

                validated = validated != -1;

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