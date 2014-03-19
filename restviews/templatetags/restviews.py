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
def restviews_body():

    return render_to_string(
        "restviews/%s/body.html" % (settings.RESTVIEWS["ui_implementation"])
    )

@register.simple_tag()
def restviews_grid(grid, url, *args, **kwargs):

    configuration = {
        "grid": grid,
        "url": url,

        "hideFields": "",
        "hideFieldsView": "",
        "hideFieldsCreate": "",
        "hideFieldsUpdate": "",
        "fields": "",
        "fieldsView": "",
        "fieldsCreate": "",
        "fieldsUpdate": "",

        "actions": "",
        "globalActions": "",

        "itemId": "id",
        "newItemLabel": _("New %(item)s") % {
            "item": grid
        },

        "canCreate": "true",
        "canUpdate": "true",
        "canDelete": "true",

        "uiImplementation": settings.RESTVIEWS["ui_implementation"],

        "paginationEnabled": "false",
        "itemsPerPage": "10",
        "maxPages": "0",
        "currentPage": "1",
        "paginateByParam": "page_size",
        "pageParam": "page",
        "maxPageRange": "5",

        "searchingEnabled": "false",
        "searchParam": "search",
        "minSearch": "3",

        "orderingEnabled": "false",
        "orderingParam": "ordering",
        "orderingField": "",
        "orderingAsc": "true"

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

@register.simple_tag()
def restviews_head():

    # Generate URL context

    context = {
        "ui": settings.RESTVIEWS["ui_implementation"],
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
        "restviews_url_ui": StaticNode.handle_simple(
            "restviews/js/ui/%s.js" % (settings.RESTVIEWS["ui_implementation"])
        )
    }

    for tag, url in settings.RESTVIEWS["urls"].iteritems():

        context[tag] = url["production"]

        if settings.DEBUG:

            context["lib_url_%s" % tag] = url["debug"]

    return render_to_string(
        'restviews/head.html',
        context
    )

