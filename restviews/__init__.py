""" Django Restviews
"""

import sys


# Based on http://stackoverflow.com/a/7205107/2918840

def merge(a, b, path=None):

    if path is None: path = []
    for key in b:
        if key in a:
            if isinstance(a[key], dict) and isinstance(b[key], dict):
                merge(a[key], b[key], path + [str(key)])
            elif a[key] == b[key]:
                pass # same leaf value
            else:
                a[key] = b[key]
        else:
            a[key] = b[key]
    return a


# Based on http://passingcuriosity.com/
# 2010/default-settings-for-django-applications/

def inject_app_defaults(application):
    """Inject an application's default settings"""
    try:
        __import__('%s.settings' % application)

        # Import our defaults, project defaults, and project settings
        _app_settings = sys.modules['%s.settings' % application]
        _def_settings = sys.modules['django.conf.global_settings']
        _settings = sys.modules['django.conf'].settings

        # Add the values from the application.settings module
        for _k in dir(_app_settings):
            if _k.isupper():
                # Add the value to the default settings module
                setattr(_def_settings, _k, getattr(_app_settings, _k))

                # Add the value to the settings, if not already present
                if not hasattr(_settings, _k):
                    setattr(_settings, _k, getattr(_app_settings, _k))
                elif type(getattr(_app_settings, _k)) is dict:

                    setattr(
                        _settings,
                        _k,
                        merge(
                            getattr(_app_settings, _k),
                            getattr(_settings, _k)
                        )
                    )

    except ImportError:
        # Silently skip failing settings modules
        pass

inject_app_defaults(__name__)