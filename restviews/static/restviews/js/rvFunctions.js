// RestView functions

/**
 * This function is called later and applies the Knockout-Bindings once
 * all grids are fully loaded.
 */

rv.activateGrids = function () {

    var notAllLoaded = $.grep(
        rv.grids,
        function (grid, gridName) {
            return grid.allLoaded();
        },
        true
    ).length > 0;

    if (notAllLoaded) {

        setTimeout(rv.activateGrids, 1000);

        return false;

    }

    // Apply grid bindings

    ko.applyBindings(rv.grids);

    // Additional things to do for the grids

    $.each(rv.grids, function (key, value) {

        // Register Update and delete actions

        rv.registerAction(
            "rv.update." + key,
            rv.showUpdateItemDialog,
            [
                "_item",
                "_grid"
            ]
        );

        rv.registerAction(
            "rv.delete." + key,
            rv.deleteItem,
            [
                "_item",
                "grid"
            ]
        );

        rv.registerAction(
            "rv.refresh." + key,
            rv.refresh,
            [
                "_grid"
            ]
        );

        rv.registerAction(
            "rv.create." + key,
            rv.showNewItemDialog,
            [
                "_grid"
            ]
        );

        // Bind Ctrl-Enter and Escape-hotkeys for the modals

        $("#rv_" + key + "NewItem, #rv_" + key + "NewItem :input")
            .on(
            "keydown.esc",
            function (ev) { $("#rv_cancelNewItem" + key).click() }
        )
            .on(
            "keydown.ctrl_return",
            function (ev) { $("#rv_saveNewItem" + key).click() }
        );

        $("#rv_" + key + "UpdateItem, #rv_" + key + "UpdateItem :input")
            .on(
            "keydown.esc",
            function (ev) { $("#rv_cancelUpdateItem" + key).click() }
        )
            .on(
            "keydown.ctrl_return",
            function (ev) { $("#rv_saveUpdateItem" + key).click() }
        );

        // Handle searching

        if (value.searchingEnabled) {

            $("#rv_search" + key).on(
                "keyup",
                function (ev) {
                    var el = $(this);

                    if (el.val() == value.currentSearch) {

                        return;

                    }

                    if (
                        (el.val().length >= value.minSearch) ||
                        (
                            (value.currentSearch != "") &&
                            (el.val().length < value.minSearch)
                        )
                    ) {

                        value.currentSearch = el.val();

                        if (el.val().length < value.minSearch) {

                            value.currentSearch = "";

                        }

                        // Reset current page for new searches

                        value.currentPage(1);

                        value.loadData();

                    }
                }
            );

        }

        // Handle ordering

        if (value.orderingEnabled) {

            $.each(
                value.fieldsView(),
                function (fieldKey, fieldValue) {

                    $("#rv_header" + key + fieldValue["_field"])
                        .on(
                            "click",
                            rv.setOrdering
                        )

                }
            );

        }

        // Enable date pickers

        $.each(
            ["fieldsView", "fieldsCreate", "fieldsUpdate"],
            function (k,v) {

                $.each(
                    value[v].apply(),
                    function (fieldKey, fieldValue) {

                        $.each(
                            ["New", "Update"],
                            function (typekey, typevalue) {

                                var $picker =
                                    $("#rv_"
                                            + typevalue
                                            + fieldValue.type
                                            + key
                                            + fieldValue["_field"]
                                    );

                                if (fieldValue.type == "datetime") {

                                    $picker
                                        .datetimepicker({
                                            language: navigator.language ||
                                                navigator.userLanguage
                                        });

                                }

                                if (fieldValue.type == "date") {

                                    $picker
                                        .datetimepicker({
                                            pickTime: false,
                                            language: navigator.language ||
                                                navigator.userLanguage
                                        });

                                }

                                if (fieldValue.type == "time") {

                                    $picker
                                        .datetimepicker({
                                            pickDate: false,
                                            language: navigator.language ||
                                                navigator.userLanguage
                                        });

                                }

                                $picker
                                    .find("input")
                                    .data(
                                    "DateTimePicker",
                                    $picker.data("DateTimePicker")
                                );

                                $picker
                                    .on(
                                    "dp.change",
                                    function (ev) {
                                        $picker.find("input").change();
                                    }
                                );

                            });

                    });

            });

    });

    return true;

};

/**
 * Add a new grid to the grids.
 *
 * @param params The parameters for the new grid.
 */

rv.addGrid = function (params) {

    var grid = new rv.model(params);

    rv.showNewItemDialogButtons.push(grid.grid);

    // Handle keyboard navigation for this grid

    // Add the grid to the "new item" selector

    grid.newItemSelector = $(document.createElement('option'))
        .text(grid.newItemLabel)
        .data("rv.gridName", grid.grid);

    rv.$newItemSelector
        .find("select")
        .append(
            grid.newItemSelector
        );

    // Load the grid

    grid.loadAll();

    // Register grid

    rv.grids[grid.grid] = grid;

};

/**
 * Add a keyboard shortcut for "Add New Item"
 */

rv.addNewItemShorcut = function () {

    $(document).on(
        "keydown." + rv.msg["HotKeyNewItem"],
        "",
        "NewItem",
        rv.handleShortcut
    );

};

/**
 * Clears a form and resets the default values
 *
 * @param methodTag What form are we in ("New", "Update"?)
 * @param grid The name of the grid
 */

rv.clearForm = function (methodTag, grid) {

    var fields;

    if (methodTag == "New") {

        rv.grids[grid].fieldsCreate();

    } else {

        rv.grids[grid].fieldsUpdate();

    }

    for (var i = 0; i < fields.length; i = i + 1) {

        var field = fields[i];

        var value = "";

        if (field["default"]) {

            value = field["default"];

        }

        $("#rv_" + grid + methodTag + field["_field"]).val(
            value
        );

    }

};

/**
 * Delete an item
 *
 * @param item Item data to delete
 * @param grid Name of grid
 */

rv.deleteItem = function (item, grid) {

    var model = rv.grids[grid];

    var url = model.url + "/" + item[model.itemId] + "/";

    $.ajax(
        url,
        {
            type: "DELETE",
            headers: {
                "X-CSRFToken": rv.grids[grid].csrftoken
            },
            contentType: "application/json",
            error: function(xhr, status, error) {

                var alert = $("#" + grid + "Alert");

                alert
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-danger shown")
                    .html(rv.msg["DeleteError"] +
                        '<hr /><pre class="pre-scrollable">' +
                        xhr.responseText +
                        "</pre>"
                    );

            },
            success: function (httpdata, status, xhr) {

                // Update grid

                rv.grids[grid].loadData();

                var alert = $("#" + grid + "Alert");

                alert
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-success shown")
                    .html(rv.msg["DeleteSuccess"]);

            }
        }
    );

};

rv.handleNewItemSelector = function (ev) {

    $("#rv_newItemSelector")
        .modal("hide");

    var selected = $(ev.target).find(":selected");

    var gridName = selected.data("rv.gridName");

    selected.removeAttr("selected");

    if (gridName) {

        rv.showNewItemDialog(gridName);

    }

};

/**
 * Handle shortcuts
 *
 * @param ev
 */

rv.handleShortcut = function (ev) {

    var action = ev.data;

    if (action == "NewItem") {

        if (rv.showNewItemDialogButtons.length == 1) {

            rv.showNewItemDialog(rv.showNewItemDialogButtons[0]);

        }

        // No, multiple buttons. Show a selection menu

        $("#rv_newItemSelector")
            .modal()
            .find("select")
            .focus();

        return false;
    }

    return true;

};

/**
 * Load a specified page
 *
 * @param link A element with page and grid-data
 */

rv.loadPage = function (link) {

    link = $(link);

    var pageToLoad = parseInt(link.attr("data-page"));
    var grid = link.data("grid");

    if (
        (pageToLoad > rv.grids[grid].maxPages()) ||
        (pageToLoad < 1)
    ) {

        return false;

    }

    rv.grids[grid].currentPage(pageToLoad);
    rv.grids[grid].loadData();

    return true;

};

/**
 * Refresh the grid's data
 *
 * @param grid the grid
 */

rv.refresh = function (grid) {

    rv.grids[grid].loadData();

};

/**
 * Register an action to be called from an object or global level later.
 * (use "_item" as an argument to include the current item as an object)
 *
 * @param name Name of the action
 * @param func Javascript function to be called
 * @param args Arguments for the function
 */

rv.registerAction = function (name, func, args) {

    rv.actionsRegistry[name] = {
        "func": func,
        "args": args
    };

};

/**
 * Save a restviews form
 *
 * @param formName The name of the form
 * @param grid The name of the grid
 * @param update Is this an update operation?
 */

rv.saveForm = function (formName, grid, update) {

    var inputs = $("#" + formName + " input").toArray();

    var methodTag = update ? "Update" : "New";

    // Add textareas

    inputs = inputs.concat($("#" + formName + " textarea").toArray());

    var data = {};

    for (var i = 0; i < inputs.length; i = i + 1) {

        if (!$(inputs[i]).data("rv.isValid")) {

            // Form is invalid. Cancel saving and do some shaking.

            $("#" + formName)
                .animate({ left: "+=50" }, 50)
                .animate({ left: "-=50" }, 50)
                .animate({ left: "+=50" }, 50)
                .animate({ left: "-=50" }, 50);

            return;

        }

        var value = $(inputs[i]).val();
        var fieldType = $(inputs[i]).data("rv.type");
        var field = $(inputs[i]).data("rv.field");

        if ($.inArray(fieldType, ["date", "datetime", "time"]) != -1) {

            // convert datetime value to supported django model format

            value = rv.ui[rv.uiImplementation].convertDateTime(
                methodTag,
                fieldType,
                grid,
                field
            );

        }

        data[field] = value;

    }

    var url = rv.grids[grid].url + "/";
    var type = "POST";
    var $alert = $("#rv_" + grid + "NewItemAlert");
    var $modal = $("#rv_" + grid + "NewItem");

    if (update) {

        type = "PUT";
        url += data[rv.grids[grid].itemId] + "/";
        $alert = $("#rv_" + grid + "UpdateItemAlert");
        $modal = $("#rv_" + grid + "UpdateItem")

    }

    $.ajax(
        url,
        {
            data: ko.toJSON(data),
            type: type,
            headers: {
                "X-CSRFToken": rv.grids[grid].csrftoken
            },
            contentType: "application/json",
            error: function(xhr, status, error) {

                $alert
                    .removeClass("alert-success alert-danger hidden")
                    .addClass("alert-danger shown")
                    .html(
                        rv.msg["SaveError"] +
                            '<hr /><pre class="pre-scrollable">' +
                            xhr.responseText +
                            "</pre>"
                    );

            },
            success: function (httpdata, status, xhr) {

                // Update grid

                rv.grids[grid].loadData();

                rv.clearForm(update ? "Update" : "New", grid);

                $modal.modal("hide");

            }
        }
    );

};

/**
 * Set the ordering field
 *
 * @param ev DOM Event of the click
 */

rv.setOrdering = function (ev) {

    var $el = $(ev.target);

    var gridName = $el.data("gridname");
    var fieldName = $el.data("fieldname");

    if (fieldName == rv.grids[gridName].orderingField()) {

        rv.grids[gridName].orderingAsc(!rv.grids[gridName].orderingAsc());

    } else {

        rv.grids[gridName].orderingField(fieldName);

    }

    rv.grids[gridName].loadData();

};

/**
 * Show the "New Item"-dialog for a grid
 *
 * @param gridName Name of grid
 */

rv.showNewItemDialog = function (gridName) {

    $("#rv_" + gridName + "NewItem").modal();
    $("#rv_" + gridName + "NewItem input[type!='hidden']")[0].focus();

};

/**
 * Show the "Update Item"-dialog for data
 *
 * @param item Data for the form
 * @param gridName Name of grid
 */

rv.showUpdateItemDialog = function (item, gridName) {

    $.each(
        item,
        function (key, value) {

            $("#rv_" + gridName + "Update" + key).val(value);

        }
    );

    $("#rv_" + gridName + "UpdateItem").modal();
    $("#rv_" + gridName + "UpdateItem input[type!='hidden']")[0].focus();

};

/**
 * Run an item action
 *
 * @param trigger The action button, that has been pushed
 */

rv.triggerAction = function (trigger) {

    trigger = $(trigger);

    var action = trigger.data("action");

    if (!rv.actionsRegistry[action]) {

        // Action not registered

        return false;

    }

    var caller = rv.actionsRegistry[action]["func"];
    var originalArgs = rv.actionsRegistry[action]["args"];

    var args = JSON.parse(JSON.stringify(originalArgs));

    // Replace "_item" with the provided item

    for (var i = 0; i < args.length; i = i + 1) {

        if (args[i] == "_item") {

            args[i] = JSON.parse(trigger.attr("data-item"));

        }

        if (args[i] == "_grid") {

            args[i] = trigger.attr("data-grid");

        }

    }

    caller.apply(document, args);

    return true;

};

/**
 * Validation handler for input fields
 *
 * @param ev Validation event
 */

rv.validateHandler = function(ev) {

    var el = $(ev.target);

    var value = el.val();

    var validationFunction = el.data(
        "rv.validationFunction"
    );
    var validationString = el.data(
        "rv.validationString"
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
        (el.data("rv.required")) &&
            (value == "")
        ) {

        validated = false;

    } else {

        validated = rv[validationFunction](el, value, validationString);

    }

    el.data(
        "rv.isValid",
        validated
    );

    if (validated) {

        formGroup.addClass("has-success");

    } else {

        formGroup.addClass("has-error");

    }

};