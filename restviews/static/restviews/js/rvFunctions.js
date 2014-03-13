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
                key
            ]
        );

        rv.registerAction(
            "rv.delete." + key,
            rv.deleteItem,
            [
                "_item",
                key
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

        if (value.searchEnabled) {

            $("#rv_search" + key).on(
                "keyup",
                function (ev) {
                    var el = $(this);

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

                        value.loadData();

                    }
                }
            );

        }

    });

    return true;

};

/**
 * Add a new grid to the grids.
 *
 * @param params The parameters for the new grid.
 */

rv.addGrid = function (params) {

    var model = new rv.model(params);

    rv.showNewItemDialogButtons.push(model.grid);

    // Handle keyboard navigation for this grid

    var $newItemSelector = $("#rv_newItemSelector");

    if ($newItemSelector.length == 0) {

        rv.createNewItemSelector();
        $newItemSelector = $("#rv_newItemSelector");

    }

    // Add the grid to the "new item" selector

    model.newItemSelector = $(document.createElement('option'))
        .text(model.newItemLabel)
        .data("rv.gridName", model.grid);

    $newItemSelector
        .find("select")
        .append(
            model.newItemSelector
        );

    // Load the grid

    model.loadAll();

    // Register grid

    rv.grids[model.grid] = model;

};

/**
 * Add a keyboard shortcut for "Add New Item"
 */

rv.addNewItemShorcut = function () {

    jQuery(document).on(
        "keydown." + rv.msg["HotKeyNewItem"],
        "",
        "NewItem",
        rv.handleShortcut
    );

};

/**
 * Clears a form and resets the default values
 *
 * @param formName The name of the form
 * @param grid The name of the grid
 */

rv.clearForm = function (formName, grid) {

    var fields = rv.grids[grid].fields();

    for (var i = 0; i < fields.length; i = i + 1) {

        var field = fields[i];

        var value = "";

        if (field["default"]) {

            value = field["default"];

        }

        $("#rv_" + grid + "New" + field["_field"]).val(
            value
        );

    }

};

/**
 * Create the "New item"-selection modal available through a shortcut
 */

rv.createNewItemSelector = function () {

    // Not yet initialized. Do it!

    var firstOption = $(document.createElement('option'))
        .text(rv.msg["SelectNewItem"]);

    var newItemSelector = $(document.createElement('div'))
        .addClass("modal")
        .attr({
            "role": "dialog",
            "id": "rv_newItemSelector"
        })
        .append(
            $(document.createElement('div'))
                .addClass("modal-dialog")
                .append(
                    $(document.createElement('div'))
                        .addClass("modal-content")
                        .append(
                            $(document.createElement('div'))
                                .addClass("modal-body")
                                .append(
                                    $(document.createElement('select'))
                                        .addClass("form-control")
                                        .append(
                                            firstOption
                                        )
                                        .on(
                                            "keydown.esc",
                                            function (ev) {

                                                $("#rv_newItemSelector")
                                                    .modal("hide");

                                            }
                                        )
                                )
                        )
                )
        );

    $(document.body).append(newItemSelector);

    $("#rv_newItemSelector")
        .find("select")
        .on(
        "change",
        function (ev) {

            $("#rv_newItemSelector")
                .modal("hide");

            var selected = $(ev.target).find(":selected");

            var gridName = selected.data("rv.gridName");

            selected.removeAttr("selected");

            if (gridName) {

                rv.showNewItemDialog(gridName);

            }

        }
    );

};

/**
 * Delete an item
 *
 * @param item Item data to delete
 * @param grid Name of grid
 */

rv.deleteItem = function (item, grid) {

    var model = rv.grids[grid];

    var url = model.url + "/" + item[model.itemId];

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

    // Reworked Because of jQuery Bug #14884
    //var pageToLoad = link.data("page");

    var pageToLoad = parseInt(link[0].getAttribute("data-page"));
    var grid = link.data("grid");

    if (
        (pageToLoad > rv.grids[grid].maxPages()) ||
        (pageToLoad < 1)
    ) {

        return false;

    }

    rv.grids[grid].currentPage(pageToLoad);
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

        data[$(inputs[i]).data("rv.field")] = $(inputs[i]).val();

    }

    var url = rv.grids[grid].url + "/";
    var type = "POST";
    var $alert = $("#rv_" + grid + "NewItemAlert");
    var $modal = $("#rv_" + grid + "NewItem");

    if (update) {

        type = "PUT";
        url += data[rv.grids[grid].itemId];
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

                rv.clearForm(formName, grid);

                $modal.modal("hide");

            }
        }
    );

};

/**
 * Show the "New Item"-dialog for a grid
 *
 * @param gridName Name of grid
 */

rv.showNewItemDialog = function (gridName) {

    $("#rv_" + gridName + "NewItem").modal();
    $("#rv_" + gridName + "NewItem input")[0].focus();

};

/**
 * Show the "Update Item"-dialog for data
 *
 * @param gridName Name of grid
 * @param data Data for the form
 */

rv.showUpdateItemDialog = function (item, gridName) {

    $.each(
        item,
        function (key, value) {

            $("#rv_" + gridName + "Update" + key).val(value);

        }
    );

    $("#rv_" + gridName + "UpdateItem").modal();
    $("#rv_" + gridName + "UpdateItem input")[0].focus();

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

            // Rewrote because auf jQuery-Bug #14884

            // args[i] = trigger.data("item");

            args[i] = JSON.parse(trigger[0].getAttribute("data-item"));

        }

    }

    caller.apply(document, args);

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

        validated = rv[validationFunction](value, validationString);

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