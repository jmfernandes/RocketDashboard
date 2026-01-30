from django.apps import AppConfig


class PagesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # Make sure to scope name of app to be withing the apps namespace.
    name = 'apps.pages'
