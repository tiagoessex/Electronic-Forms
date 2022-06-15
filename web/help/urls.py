from django.urls import path
from help import views

app_name = "help"
urlpatterns = [
    #path('', views.help, name='help'),
    #path('designer/', views.designer, name='designer'),
    #path('manager/', views.manager, name='manager'),
    #path('app/', views.app, name='app'),
    #path('operations/', views.operations, name='operations'),
    path('api/', views.api, name='api'),
    #path('faq/', views.faq, name='faq'),
    path('examples/', views.examples, name='examples'),
    path('videos/', views.videos, name='videos'),

]