""" Django restviews default settings
"""

from django.conf import settings

RESTVIEWS = {

    # Settings

    "ui_implementation": "bootstrap3",

    # URLs

    "urls": {

        "jquery": {
            "production": "http://code.jquery.com/jquery-1.11.0.min.js",
            "debug": "http://code.jquery.com/jquery-1.11.0.js"
        },

        "jquery_hotkeys": {
            "production": "//cdn.jsdelivr.net/jquery.hotkeys/"
                          "0.8b/jquery.hotkeys.min.js",
            "debug": "//cdn.jsdelivr.net/jquery.hotkeys/0.8b/jquery.hotkeys.js"
        },

        "knockout": {

            "production": "http://knockoutjs.com/downloads/knockout-3.0.0.js",
            "debug": "http://knockoutjs.com/downloads/knockout-3.0.0.debug.js"
        },

        "moment": {

            "production": "//cdnjs.cloudflare.com/ajax/libs/moment.js/"
                          "2.5.1/moment-with-langs.min.js",
            "debug": "//cdnjs.cloudflare.com/ajax/libs/moment.js/"
                     "2.5.1/moment-with-langs.js"

        },

        # Bootstrap 3 - implementation-specific

        "bootstrap3": {

            "production": {
                "css": "//netdna.bootstrapcdn.com/bootstrap/"
                       "3.1.1/css/bootstrap.min.css",
                "theme": "//netdna.bootstrapcdn.com/bootstrap/"
                         "3.1.1/css/bootstrap-theme.min.css",
                "js": "//netdna.bootstrapcdn.com/bootstrap/"
                      "3.1.1/js/bootstrap.min.js"
            },
            "debug": {

                "css": "//netdna.bootstrapcdn.com/bootstrap/"
                       "3.1.1/css/bootstrap.css",
                "theme": "//netdna.bootstrapcdn.com/bootstrap/"
                         "3.1.1/css/bootstrap-theme.css",
                "js": "//netdna.bootstrapcdn.com/bootstrap/"
                      "3.1.1/js/bootstrap.js"

            }

        },

        "bootstrap3_datetimepicker": {

            "production": {

                "css": "//cdnjs.cloudflare.com/ajax/libs/"
                       "bootstrap-datetimepicker/"
                       "3.0.0/css/bootstrap-datetimepicker.min.css",
                "js": "//cdnjs.cloudflare.com/ajax/libs/"
                      "bootstrap-datetimepicker/"
                      "3.0.0/js/bootstrap-datetimepicker.min.js"

            },

            "debug": {

                "css": "//cdnjs.cloudflare.com/ajax/libs/"
                       "bootstrap-datetimepicker/"
                       "3.0.0/css/bootstrap-datetimepicker.css",
                "js": "//cdnjs.cloudflare.com/ajax/libs/"
                      "bootstrap-datetimepicker/"
                      "3.0.0/js/bootstrap-datetimepicker.js"

            }

        }

    }

}