""" Django Restviews
"""
import json

from django import template
from django.conf import settings
from django.template.loader import render_to_string
from django.templatetags.static import StaticNode
from django.utils.translation import ugettext as _

register = template.Library()

@register.simple_tag()
def restviews_head():

    return render_to_string(
        'restviews/head.html',
        {
            "restviews_url_bootstrap": StaticNode.handle_simple(
                "restviews/js/rvBootstrap.js"
            ),
            "restviews_url_model": StaticNode.handle_simple(
                "restviews/js/rvModel.js"
            ),
            "restviews_url_functions": StaticNode.handle_simple(
                "restviews/js/rvFunctions.js"
            ),
            "restviews_url_validators": StaticNode.handle_simple(
                "restviews/js/rvValidators.js"
            ),
            "restviews_url_ko_bindings": StaticNode.handle_simple(
                "restviews/js/rvKoBindings.js"
            ),
            "knockout_url": settings.RESTVIEWS_KNOCKOUT_URL,
            "jquery_hotkeys_url": settings.RESTVIEWS_JQUERY_HOTKEYS_URL
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
        "pageParam": "page",
        "itemId": "id",
        "newItemLabel": _("New %(item)s") % {
            "item": grid
        },
        "canCreate": "true",
        "canUpdate": "true",
        "canDelete": "true",
        "uiImplementation": settings.RESTVIEWS_UI_IMPLEMENTATION
    }

    for field in configuration.keys():

        if field in kwargs:

            configuration[field] = kwargs[field]

    return render_to_string(
        "restviews/%s/template.html" % (configuration["uiImplementation"]),
        {
            "grid": configuration["grid"],
            "params": json.dumps(configuration, indent=8)
        }
    )