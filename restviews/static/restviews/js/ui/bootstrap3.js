// Specific bootstrap3 functions

rv.ui["bootstrap3"] = {

    "convertDateTime" : function (methodTag, fieldType, grid, field) {

        var tmpDate = $("#rv_" + methodTag + fieldType + grid + field)
            .data("DateTimePicker")
            .date;
        var value;

        switch (fieldType) {

            case "date":
                value = tmpDate.format("YYYY-MM-DD");
                break;
            case "time":
                value = tmpDate.format("HH:mm:ss");
                break;
            case "datetime":
                value = tmpDate.format("YYYY-MM-DD HH:mm:ss");
                break;

        }

        return value;

    },

    "getDeleteAction" : function (grid) {

        return {
            'label': '<span class="glyphicon glyphicon-remove"></span>',
            'addClass': 'btn-link',
            'action': "rv.delete." + grid
        }

    },

    "getUpdateAction" : function (grid) {

        return {
            'label': '<span class="glyphicon glyphicon-edit"></span>',
            'addClass': 'btn-link',
            'action': "rv.update." + grid
        }

    }

};