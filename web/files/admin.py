from django.contrib import admin
from .models import Files


# Register your models here.

class FilesAdmin(admin.ModelAdmin):
    readonly_fields = ["is_valid"]
    list_display = ("id", "title", "description", "date_created", 'date_updated','type', 'is_valid')


admin.site.register(Files, FilesAdmin)
