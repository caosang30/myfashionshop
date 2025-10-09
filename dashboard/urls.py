from django.urls import path
from .views import *

urlpatterns = [
    path('', management, name='management'),

    path("create-user/", create_user, name="create_user"),
    path('edit-user/<int:user_id>/', edit_user, name='edit_user'),
    path('delete_user/<int:user_id>/', delete_user, name='delete_user'),
]
