from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from django.contrib import admin
        admin.site.site_header = 'Celtrix Admin'
        admin.site.site_title = 'Celtrix Admin Portal'
        admin.site.index_title = 'Welcome to the Celtrix Admin Panel'
