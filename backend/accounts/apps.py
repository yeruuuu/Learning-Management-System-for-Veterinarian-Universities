from django.apps import AppConfig

#this class already created when the project was created by Django
class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    label = "user_accounts"


    def ready(self):
        import accounts.signals  # getting the signals, this it get them load automatically when the app is ready.
