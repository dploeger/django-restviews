""" Django Restviews
"""

from django import template
from django.conf import settings
from django.template.loader import render_to_string
from django.templatetags.static import StaticNode

register = template.Library()

@register.simple_tag()
def restviews_head():

    return render_to_string(
        'restviews/head.html',
        {
            "restviews_url":
                StaticNode.handle_simple("restviews/js/restviews.js"),
            "knockout_url": settings.RESTVIEWS_KNOCKOUT_URL
        }
    )


@register.simple_tag()
def restviews_grid(grid, url, *args, **kwargs):

    hide_columns = ""

    if "hideColumns" in kwargs:

        hide_columns = kwargs["hideColumns"]

    columns = ""

    if "columns" in kwargs:

        columns = kwargs["columns"]

    return render_to_string(
        "restviews/grid.html",
        {
            "grid": grid,
            "url": url,
            "hide_columns": hide_columns,
            "columns": columns
        }
    )