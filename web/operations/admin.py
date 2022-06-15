from django.contrib import admin

from .models import Operation, OperationData, OperationAsset

# Register your models here.

    
class OperationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description", "form", "date_creation", "date_updated","author", "status")

class OperationDataAdmin(admin.ModelAdmin):
    list_display = ("id", "operation")

class OperationAssetAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "operation", "asset", 'type', 'is_annex')

admin.site.register(Operation, OperationAdmin)
admin.site.register(OperationData, OperationDataAdmin)
admin.site.register(OperationAsset, OperationAssetAdmin)
