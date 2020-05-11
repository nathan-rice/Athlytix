SERVER_URL = "www.athlytix.org"
SECRET_KEY = '...'
SQLALCHEMY_DATABASE_URI = '...'
MAIL_USERNAME = 'athlytix.org@gmail.com'
SUPPORT_EMAIL_ADDRESS = MAIL_USERNAME
MAIL_PASSWORD = '...'
MAIL_DEFAULT_SENDER = '"Athlytix" <athlytix.org@gmail.com>'
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 465
MAIL_USE_SSL = True
MAIL_USE_TLS = False
PROPAGATE_EXCEPTIONS = False
USER_APP_NAME = 'Athlytix'
USER_ENABLE_EMAIL = True
USER_ENABLE_USERNAME = False
USER_ENABLE_CONFIRM_EMAIL = False
USER_ENABLE_CHANGE_USERNAME = False
USER_ENABLE_LOGIN_WITHOUT_CONFIRM_EMAIL = True
USER_AFTER_CHANGE_PASSWORD_ENDPOINT = ''
USER_AFTER_CHANGE_USERNAME_ENDPOINT = ''
USER_AFTER_CONFIRM_ENDPOINT = ''
USER_AFTER_FORGOT_PASSWORD_ENDPOINT = ''
USER_AFTER_LOGIN_ENDPOINT = ''
USER_AFTER_LOGOUT_ENDPOINT = 'user.login'
USER_AFTER_REGISTER_ENDPOINT = ''
USER_AFTER_RESEND_CONFIRM_EMAIL_ENDPOINT = ''
USER_AFTER_RESET_PASSWORD_ENDPOINT = ''
USER_INVITE_ENDPOINT = ''
CORS_SUPPORTS_CREDENTIALS = True
FLASK_PROFILER = {
    "enabled": True,
    "storage": {
        "engine": "sqlite"
    },
    "basicAuth": {
        "enabled": True,
        "username": "admin",
        "password": "flask_profiler_insecure_password"
    },
    "ignore": [
        "^/static/.*"
    ]
}
