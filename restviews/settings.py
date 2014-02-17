""" Django restviews default settings
"""

from django.conf import settings

# URL to the knockout library
RESTVIEWS_KNOCKOUT_URL = "http://knockoutjs.com/downloads/knockout-3.0.0.js"

# Use debug URL
if settings.DEBUG:
    RESTVIEWS_KNOCKOUT_URL = "http://knockoutjs.com/downloads/knockout-3.0.0" \
                             ".debug.js"