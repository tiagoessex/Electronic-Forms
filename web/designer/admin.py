from django.contrib import admin
from .models import Status, Form, FormAsset, AssetType, Query


class StatusAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")

class FormAdmin(admin.ModelAdmin):
    #list_display = ("id", "name", "description", "is_locked", "author", "date_created")
    list_display = ("id", "name", "description", "status", "author", "date_created")#, 'is_temp')

class FormAssetAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "form", "asset", 'type')

class QueryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "query", "date", 'status')


admin.site.register(Status, StatusAdmin)
admin.site.register(Form, FormAdmin)
admin.site.register(FormAsset, FormAssetAdmin)
admin.site.register(AssetType)
admin.site.register(Query, QueryAdmin)

