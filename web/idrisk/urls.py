"""idrisk URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView

from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView
from django.conf.urls.static import static
from django.conf import settings

#from idrisk.views import handler404, handler500
from django.conf.urls import handler404, handler500

#from idrisk import views

from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('pwa.urls')),
    #path('api-token-auth/', views.obtain_auth_token, name='api-tokn-auth'),

    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('applications/', TemplateView.as_view(template_name='applications.html'), name='applications'),
    
    path('designer/', include('designer.urls')),
    path('preview/', include('preview.urls')),
    path('formsmanager/', include('formsmanager.urls')),
    path('sform/', include('sform.urls')),
    path('operations/', include('operations.urls')),
    path('opeditview/', include('opeditview.urls')),    
    path('help/', include('help.urls')),
    path('rest/', include('rest.urls')),
    path('files/', include('files.urls')),


    # for locale
    path('i18n/', include('django.conf.urls.i18n')),

	path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('images/icons/favicon.ico'))),

    path('desert/', TemplateView.as_view(template_name='error_pages/desert.html'), name='desert'),
    # only for testing ... remove it when deploy
    #path('404/',handler404, name="handler404"),
    #path('500/',handler500, name="handler500"),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


handler404 = 'idrisk.views.handler404'
handler500 = 'idrisk.views.handler500'

#handler403 = 'mysite.views.my_custom_permission_denied_view'
#handler400 = 'mysite.views.my_custom_bad_request_view'

# auth urls:
# accounts/login/ [name='login']
# accounts/logout/ [name='logout']
# accounts/password_change/ [name='password_change']
# accounts/password_change/done/ [name='password_change_done']
# accounts/password_reset/ [name='password_reset']
# accounts/password_reset/done/ [name='password_reset_done']
# accounts/reset/<uidb64>/<token>/ [name='password_reset_confirm']
# accounts/reset/done/ [name='password_reset_complete']
