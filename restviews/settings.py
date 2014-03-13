""" Django restviews default settings
"""

from django.conf import settings

# URL to the knockout library
RESTVIEWS_KNOCKOUT_URL = "http://knockoutjs.com/downloads/knockout-3.0.0.js"

# Use debug URL
if settings.DEBUG:
    RESTVIEWS_KNOCKOUT_URL = "http://knockoutjs.com/downloads/knockout-3.0.0" \
                             ".debug.js"

# URL to the jquery.hotkeys library
RESTVIEWS_JQUERY_HOTKEYS_URL = "//cdn.jsdelivr.net/jquery.hotkeys/0.8b/" \
                               "jquery.hotkeys.min.js"

# Use debug URL

if settings.DEBUG:

    # URL to the jquery.hotkeys library
    RESTVIEWS_JQUERY_HOTKEYS_URL = "//cdn.jsdelivr.net/jquery.hotkeys/0.8b/" \
                                   "jquery.hotkeys.js"

# Restviews default UI implementation

RESTVIEWS_UI_IMPLEMENTATION = "bootstrap3"