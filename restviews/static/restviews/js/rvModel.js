/**
 * A Model for Rest GridViews.
 *
 * @param params Parameters (same name as the properties)
 * @property {String} url URL to REST-backend
 * @property {String} grid The name of the instance
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
 * @property {ko.observableArray} pageRange A range of valid pages
 * @property {object} newItemSelector The option for the "new item selector" box
 * @property {String} newItemLabel The label for the "new item selector box"
 * @property {int} maxPageRange How many pages to display in the pagination
 * @property {boolean} searchEnabled Is the search feature enabled?
 * @property {String} searchParam The argument to use in the search url
 * @property {int} minSearch Minimum amount of characters to begin searching
 * @property {String} currentSearch Current search string
 * @constructor
 */

rv.model = function (params) {

    // Defaults

    this.url = "";
    this.grid = "";

    this.fields = ko.observableArray();
    this.data = ko.observableArray();
    this.fieldsLoaded = false;
    this.dataLoaded = false;
    this.environmentInterpreted = false;
    this.hideFields = [];
    this.canCreate = ko.observable(false);
    this.canUpdate = ko.observable(false);
    this.canDelete = ko.observable(false);
    this.canView = ko.observable(true);
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

    this.newItemSelector = null;
    this.newItemLabel = "";

    this.maxPageRange = ko.observable(0);

    this.searchEnabled = false;
    this.searchParam = "";
    this.minSearch = 0;
    this.currentSearch = "";

    // Sanitize parameters

    if (params.url.match(/\/$/)) {

        params.url = params.url.substr(0, params.url.length - 1);

    }

    if (typeof params.hideFields == "string") {

        params.hideFields = params.hideFields.split(",")

    }

    if (typeof params.fields == "string") {

        var fields = params.fields.split(",");

        var tmpfields = [];

        for (var i = 0; i < fields.length; i = i + 1) {

            var tmp = fields[i].split(":");

            // Is this field required?

            var required = false;

            if (tmp.length - 1 >= 3) {

                if (tmp[3] == "1") {

                    required = true;

                }

            }

            // Field default value

            var fieldDefault = null;

            if (tmp.length -1 >= 4) {

                fieldDefault = tmp[4];

            }

            var hidden = $.inArray(tmp[0], params.hideFields) > -1;

            // Add interpreted field

            tmpfields.push({

                "_field": tmp[0],
                "label": tmp[1],
                "type": tmp[2],
                "required": required,
                "default": fieldDefault,
                "hidden": hidden

            });

        }

        params.fields = tmpfields;

    }

    // Apply parameters

    for (var param in params) {

        if (params.hasOwnProperty(param)) {

            if (typeof this[param] == "function") {

                // This parameter should be an observable

                if (typeof this[param]() == "object") {

                    // Actually, this parameter should be an observable array.

                    this[param] = ko.observableArray(params[param]);

                } else if (typeof this[param]() == "number") {

                    this[param] = ko.observable(parseInt(params[param]));

                } else {

                    this[param] = ko.observable(params[param]);

                }

            } else {

                if (typeof this[param] == "boolean") {

                    this[param] = (params[param] === "true");

                } else if (typeof this[param] == "number") {

                    this[param] = parseInt(params[param]);

                } else {

                    this[param] = params[param];

                }


            }

        }

    }

};

/**
 * Helper function, if all fields and data are loaded
 *
 * @returns {boolean} Wether everything's ready to go
 */

rv.model.prototype.allLoaded = function () {

    return this.fieldsLoaded && this.dataLoaded && this.environmentInterpreted;

};

/**
 * Resets all alerts for this grid model
 */

rv.model.prototype.clearAlerts = function () {

    $("#rv." + this.grid + "Alert")
        .html("")
        .removeClass("alert-success alert-error shown")
        .addClass("hidden");

    $("#rv." + this.grid + "NewItemAlert")
        .html("")
        .removeClass("alert-success alert-error shown")
        .addClass("hidden");
};

/**
 * Fill the fields using the received OPTIONS metadata
 *
 * @param options Options array
 */

rv.model.prototype.fillFields = function (options) {

    // Analyze the options to fill the grid

    if (!options["canView"]) {

        return;

    }

    var fields = [];

    $.each(options["fields"]["POST"], function (key, value) {

        if (!value.hasOwnProperty("label")) {

            value["label"] = key;

        }

        value["hidden"] = $.inArray(key, this.hideFields) != -1;

        fields.push(value);

    });

    this.fields = ko.observableArray(fields);

    this.interpretEnvironment();

    this.fieldsLoaded = true;

};

/**
 * Calls the given URL per "OPTIONS" method and returns informations about
 * fields and methods.
 *
 * @param url       REST-URL to call
 * @param callback  Callback to call with results
 */

rv.model.prototype.getOptions = function (url, callback) {

    $.ajax(
        url,
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

                if ($.inArray("POST", methods) == -1) {

                    retval.canCreate = false;
                    this.canCreate(false);

                }

                if ($.inArray("GET", methods) == -1) {

                    retval.canView = false;
                    this.canView(false);

                }

                if (callback !== undefined) {

                    callback.apply(this, [retval]);

                }

                this.optionsLoaded = true;

            },
            context: this

        }

    );

};

/**
 * Try to interpret some environmental settings and header options to set
 * certain variables.
 */

rv.model.prototype.interpretEnvironment = function () {

    // Check for CSRFtoken. If nothing is found, deactive editing methods

    var csrf = document.cookie.match(/csrftoken=([^;]*)/, document.cookie);

    if (csrf) {

        this.csrftoken = csrf[1];

    } else {

        this.canCreate(false);
        this.canDelete(false);
        this.canUpdate(false);

    }

    // Add delete action if we can delete

    if (this.canDelete()) {

        this.actions.push({
            'label': '<span class="glyphicon glyphicon-remove"></span>',
            'addClass': 'btn-link',
            'action': "rv.delete." + this.grid
        });

    }

    // Add update action if we can update

    if (this.canUpdate()) {

        this.actions.push({
            'label': '<span class="glyphicon glyphicon-edit"></span>',
            'addClass': 'btn-link',
            'action': "rv.update." + this.grid
        });

    }

    // Remove "new item selector" option, if we cannot create an item

    if (!this.canCreate()) {

        this.newItemSelector.remove();

    }

    this.environmentInterpreted = true;

};

/**
 * Load the Fields and the Data!
 */

rv.model.prototype.loadAll = function () {

    this.loadFields();
    this.loadData();

};

/**
 * Load the grid's data
 */

rv.model.prototype.loadData = function () {

    var url = this.url + "/";

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

    if (
        (this.searchEnabled) &&
        (this.currentSearch != "")
    ) {

        if (url.match(/\?/)) {

            url += "&";

        } else {

            url += "?";

        }

        url += this.searchParam + "=" + this.currentSearch;

    }

    $.ajax(
        url,
        {
            type: "GET",
            success: function (data, status, xhr) {

                var i;

                // Support pagination

                if (this.paginationEnabled) {

                    this.maxPages(Math.ceil(data.count / this.itemsPerPage));

                    this.pageRange.removeAll();

                    if (this.currentPage() > this.maxPageRange() - 1) {

                        this.pageRange.push("...");

                    }

                    var start =
                        this.currentPage()
                            - Math.floor(this.maxPageRange() / 2);

                    if (start + this.maxPageRange() > this.maxPages()) {

                        start = this.maxPages()
                            - this.maxPageRange()
                            + 1;

                    }

                    if (start < 1) {
                        start = 1;
                    }

                    var end = start + this.maxPageRange() - 1;

                    if (end > this.maxPages()) {

                        end = this.maxPages();

                    }

                    for (i = start; i <= end; i = i + 1) {

                        this.pageRange.push(i);

                    }

                    if (end < this.maxPages()) {

                        this.pageRange.push("...");

                    }

                    data = data.results;

                }

                // We have the data. Simply use an observableArray to
                // make it Knockout-compliant

                this.data.removeAll();

                for (i = 0; i < data.length; i = i + 1) {

                    this.data.push(data[i]);

                }

                this.dataLoaded = true;


            },
            error: function (xhr, status, error) {

                $("#" + this.grid + "Alert")
                    .html(
                        rv.msg["LoadError"]
                            + ' <a href="#" onClick="rv.grids[\''
                            + this.grid
                            + '\'].loadData()">'
                            + rv.msg["Retry"]
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
 * Try to load grid fields by calling the URL using the OPTIONS method and
 * analyzing the output.
 */

rv.model.prototype.loadFields = function () {

    if (this.fields().length == 0) {

        this.getOptions(this.url + "/", this.fillFields);

    } else {

        if (!this.optionsLoaded) {

            this.getOptions(this.url + "/");

        }

        this.interpretEnvironment();

        if (!this.fieldsLoaded) {

            this.fieldsLoaded = true;

        }

    }

};