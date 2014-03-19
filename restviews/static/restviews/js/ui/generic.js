// functions for a generic UI implementation

rv.ui["generic"] = {

    "convertDateTime" : function (methodTag, fieldType, grid, field) {

        return $("#rv_" + methodTag + fieldType + grid + field).val();

    },

    "getDeleteAction" : function (grid) {

        return {
            'label': rv.msg["DELETE"],
            'addClass': '',
            'action': "rv.delete." + grid
        }

    },

    "getUpdateAction" : function (grid) {

        return {
            'label': rv.msg["UPDATE"],
            'addClass': '',
            'action': "rv.update." + grid
        }

    }

};