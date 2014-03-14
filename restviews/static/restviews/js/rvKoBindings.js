// Custom Knockout binding handlers for RestViews

/**
 * Input-field handling
 */

ko.bindingHandlers.rvInput = {
    update: function(
        element,
        valueAccessor,
        allBindings,
        grid,
        bindingContext
        ) {

        var el = $(element);
        var type = bindingContext.$data.type;

        el.attr(
            "id",
            "rv_" + valueAccessor() + el.data("form") +
                bindingContext.$data["_field"]
        );

        el.data(
            "rv.field",
            bindingContext.$data["_field"]
        );

        el.data(
            "rv.type",
            type
        );

        if (bindingContext.$data.hidden) {

            el.data("rv.isValid", true);

            // Nothing more to do for hidden fields

            return;

        }

        el.data(
            "rv.validationFunction",
            "validate"
        );

        el.data(
            "rv.validationString",
            ".*"
        );

        el.attr(
            "type",
            "text"
        );

        el.data(
            "rv.required",
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
                "rv.isValid",
                false
            );

        } else {

            el.parent().parent().addClass("has-success");

            el.data(
                "rv.isValid",
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
                    "rv.validationString",
                    "[0-9]+"
                );
                break;

            case "float":
                el.attr(
                    "type",
                    "number"
                );
                el.data(
                    "data-rv.validationString",
                    "[0-9,.]*"
                );
                break;

            case "password":
                el.attr(
                    "type",
                    "password"
                );
                break;

            case "date":

                if (rv.uiImplementation != "bootstrap3") {

                    el.attr(
                        "type",
                        "date"
                    );

                }

                el.data(
                    "rv.validationFunction",
                    "validateDate"
                );
                break;

            case "datetime":

                if (rv.uiImplementation != "bootstrap3") {

                    el.attr(
                        "type",
                        "datetime"
                    );

                }

                el.data(
                    "rv.validationFunction",
                    "validateDateTime"
                );
                break;

            case "time":

                if (rv.uiImplementation != "bootstrap3") {

                    el.attr(
                        "type",
                        "time"
                    );

                }

                el.data(
                    "rv.validationFunction",
                    "validateTime"
                );
                break;

            case "email":
                el.attr(
                    "type",
                    "email"
                );
                el.data(
                    "rv.validationFunction",
                    "validateEmail"
                );
                break;

            case "url":
                el.attr(
                    "type",
                    "url"
                );
                el.data(
                    "rv.validationFunction",
                    "validateUrl"
                );
                break;

            case "color":
                el.attr(
                    "type",
                    "color"
                );
                el.data(
                    "rv.validationString",
                    "^#[0-9]{6}"
                );
                break;

            default:
                break;

        }

        el.change(rv.validateHandler);
        el.keyup(rv.validateHandler);

    }
};

/**
 * Label generation
 */

ko.bindingHandlers.rvLabel = {
    init: function(
        element,
        valueAccessor,
        allBindings,
        grid,
        bindingContext
        ) {

        var el = $(element);

        el.attr(
            "for",
            "rv_"
                + valueAccessor()
                + el.data("form")
                + bindingContext.$data.label
        );

    },

    update: function(
        element,
        valueAccessor,
        allBindings,
        grid,
        bindingContext
        ) {

        var el = $(element);

        el.attr(
            "for",
            "rv_"
                + valueAccessor()
                + el.data("form")
                + bindingContext.$data.label
        );

        var label = bindingContext.$data.label;

        if (bindingContext.$data.required) {

            label = "*" + label;
        }

        el.html(label);

    }
};
