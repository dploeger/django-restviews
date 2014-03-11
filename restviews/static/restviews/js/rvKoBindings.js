// Custom Knockout binding handlers for RestViews

ko.bindingHandlers.rvLabel = {
    init: function(
        element,
        valueAccessor,
        allBindings,
        grid,
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
        grid,
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

ko.bindingHandlers.rvInput = {
    update: function(
        element,
        valueAccessor,
        allBindings,
        grid,
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
            "rv.validationFunction",
            "rv.validate"
        );

        el.data(
            "rv.validationString",
            ".*"
        );

        el.data(
            "rv.field",
            bindingContext.$data["_field"]
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

            case "datetime":
                el.attr(
                    "type",
                    "datetime"
                );
                el.data(
                    "rv.validationFunction",
                    "rv.validateDateTime"
                );
                break;

            case "email":
                el.attr(
                    "type",
                    "email"
                );
                el.data(
                    "rv.validationFunction",
                    "rv.validateEmail"
                );
                break;

            case "url":
                el.attr(
                    "type",
                    "url"
                );
                el.data(
                    "rv.validationFunction",
                    "rv.validateUrl"
                );
                break;

            case "color":
                el.attr(
                    "type",
                    "color"
                );
                el.data(
                    "rv.validationFunction",
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

                validated = window[validationFunction](value, validationString);

                validated = validated != -1;

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

        el.change(validateHandler);
        el.keyup(validateHandler);

    }
};