
from django.urls import path
from preview import views

app_name = "preview"
urlpatterns = [
    path('<int:form_id>/', views.previewID, name='previewID'),
]


    
