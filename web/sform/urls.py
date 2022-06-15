from django.urls import path
from sform import views

app_name = "sform"
urlpatterns = [
    path('', views.sform, name='sform'),
]
