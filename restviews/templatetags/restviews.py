""" Django Restviews
"""

from django import template
from django.conf import settings
from django.templatetags.static import StaticNode

register = template.Library()

@register.simple_tag()
def restviews_head():

    return """

    <!-- Call Knockout -->

    <script src="%(knockout_url)s"></script>

    <!-- Include Restviews.js -->

    <script src="%(restviews_url)s"></script>

    """ % {
        "restviews_url": StaticNode.handle_simple("restviews/js/restviews.js"),
        "knockout_url": settings.RESTVIEWS_KNOCKOUT_URL
    }


@register.simple_tag()
def restviews_grid(grid, url, *args, **kwargs):

    hide_columns = ""

    if "hideColumns" in kwargs:

        hide_columns = kwargs["hideColumns"]

    columns = ""

    if "columns" in kwargs:

        columns = kwargs["columns"]


    grid = """
    <div class="row" data-bind="with: %(grid)s">
        <table class="table">
            <thead>
                <tr>

                    <!-- ko foreach: headers -->

                    <th data-bind="text: label">
                    </th>

                    <!-- /ko -->

                    <th>
                        <span data-bind="if: canCreate">
                            <button type="button"
                                    class="btn btn-primary pull-right">
                                <span class="glyphicon glyphicon-plus"></span>
                            </button>
                        </span>
                    </th>

                </tr>
            </thead>
            <tbody data-bind="foreach: rows">
                <tr>

                    <!-- ko foreach: $parent.headers -->

                    <td style="white-space: pre-wrap"
                        data-bind="text: $parent[_field]">
                    </td>

                    <!-- /ko -->

                    <td>
                    </td>

                </tr>
            </tbody>
        </table>
    </div>

    <script type="text/javascript">

        var %(grid)sModel = new GridViewModel('%(url)s');

        %(grid)sModel.hideColumns = "%(hide_columns)s".split(",");

        if ("%(columns)s" != "") {

            columns = "%(columns)s".split(",")

            headers = [];

            $.each(columns, function (index,value) {

                tmp = value.split(":");

                headers.push({

                    "_field": tmp[0],
                    "label": tmp[1]

                });

            });

            %(grid)sModel.headers = ko.observableArray(headers);

        }

        %(grid)sModel.loadAll();

        gridModels['%(grid)s'] = %(grid)sModel;

        activateGrids = true;

    </script>
    """ % {
        "grid": grid,
        "url": url,
        "hide_columns": hide_columns,
        "columns": columns
    }

    return grid