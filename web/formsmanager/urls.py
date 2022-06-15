from django.urls import path
from formsmanager import views

app_name = "formsmanager"
urlpatterns = [
    path('', views.formsmanager, name='formsmanager'),    

    path('api/use/', views.use, name="use"),
    path('api/disable/', views.disable, name="disable"),
    path('api/delete/', views.delete, name="delete"),    
    path('api/delete_temps/', views.delete_temps, name="delete_temps"),
    path('api/clone/', views.clone, name="clone"),    
    path('api/forms/', views.forms, name="forms"),    

]
