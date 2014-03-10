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

    configuration = {
        "grid": grid,
        "url": url,
        "hideFields": "",
        "fields": "",
        "paginationEnabled": "false",
        "itemsPerPage": "10",
        "maxPages": "0",
        "currentPage": "1",
        "paginateByParam": "page_size",
        "pageParam": "page"
    }

    for field in configuration.keys():

        if field in kwargs:

            configuration[field] = kwargs[field]

    return render_to_string(
        "restviews/grid.html",
        configuration
    )