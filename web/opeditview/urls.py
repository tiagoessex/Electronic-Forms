
from django.urls import path
from opeditview import views

app_name = "opeditview"
urlpatterns = [
    path('<int:operation_id>/', views.editview, name='editview'),
]


    
