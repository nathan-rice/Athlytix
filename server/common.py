import hashlib

from flask_user import current_user

import models


class NotAuthorizedError(Exception):
    status_code = 401
    message = "Only a user and their specified trainer may access account details"


def access_user(user_id, read_only=False):
    if current_user.id == user_id:
        return current_user
    else:
        user = models.User.query.get(user_id)
        if current_user.is_trainer and user.trainer_id == current_user.id:
            return user
        elif read_only and current_user.is_public:
            return user
    raise NotAuthorizedError


def gravatar(email, size=80):
    m = hashlib.md5()
    m.update(email.lower().encode("utf-8"))
    return "https://www.gravatar.com/avatar/{}?s={}&d=mm".format(m.hexdigest(), int(size))
