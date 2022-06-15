from django.db import models
from designer.tables import get_columns
from django.conf import settings
import os
from django.core.files.storage import FileSystemStorage

FOODEX2_ATTRIBUTES_FILE = 'data/foodex_attributes_EN.csv'
FOODEX2_TERMS_FILE = 'data/foodex_terms_EN.csv'
FOODEX2_ATTRIBUTES_COLS = ['code', 'label']
FOODEX2_TERMS_COLS = ['termCode', 'masterParentCode','termScopeNote','termExtendedName','allFacets','deprecated']


def checkFileFields(file):
    if os.path.exists(file.path):
        cols = get_columns(file.path)
        if file.name == FOODEX2_ATTRIBUTES_FILE:
            return all(item in cols for item in FOODEX2_ATTRIBUTES_COLS)
        if file.name == FOODEX2_TERMS_FILE:
            return all(item in cols for item in FOODEX2_TERMS_COLS)
    return False



# Create your models here.

class OverwriteStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        # If the filename already exists, remove it as if it was a true file system
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return name

class Files(models.Model): 
    CONFIGURATION = 1
    APPLICATION = 2
    DATA = 3 
    DOC = 4   
    TYPE = (
       (CONFIGURATION, 'Configuration file'),
       (APPLICATION, 'Application or Program'),
       (DATA, 'Data file'),
       (DOC, 'Document'),
    )    
    title = models.CharField(null=True, blank=True, max_length = 80)
    description = models.CharField(null=True, blank=True, max_length = 256)
    date_created = models.DateTimeField(blank=True, null=False, auto_now_add=True)
    date_updated = models.DateTimeField(blank=True, null=True, auto_now=True)
    file = models.FileField(upload_to='files/', max_length=256, storage=OverwriteStorage())
    is_valid = models.BooleanField(default = True)
    type = models.PositiveSmallIntegerField(
        choices=TYPE,
        default=DATA,
    )    

 
    class Meta:
        ordering = ['title']
        verbose_name_plural = "Files"
        db_table = 'files'
     
    def __str__(self):
        return f"{self.title}"

    def save(self, *args, **kwargs):    
        super(Files, self).save(*args, **kwargs)
        if type == 3:
            is_valid = checkFileFields(self.file)
            # TODO: only update field
            if is_valid != self.is_valid:
                self.is_valid = is_valid
                super(Files, self).save(*args, **kwargs)
        
