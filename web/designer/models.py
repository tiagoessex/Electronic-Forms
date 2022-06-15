from django.db import models

from idrisk.settings import FORM_ASSETS_DIR


def removeUnusedAssets(form_id, form):
    """
        Removes all usused assets (images and tables) of a form.
        If error, raises an exception.

        :param form_id: Form's ID
        :param form: Form data
        :return: {'status':'ok', 'form': form} is success
    """
    try:
        # ---------- REMOVE ALL UNUSED ASSETS ---------
        # TO KEEP
        in_use = []
        static_images = []
        rasters = []
        tables = []
        assets_to_keep = []

        # GET ALL IMAGES IN USE
        if form:
            for element in form.get('elements'):
                image = element.get('props').get('properties-image-url')
                if image:
                    static_images.append(image)            
            rasters = list(filter(lambda image: image, form.get('rasters')))

            # GET ALL TABLES IN USE
            # dropdowns
            dropdowns = form.get('dropdowns')
            if dropdowns:            
                for drop in dropdowns:
                    if dropdowns[drop].get('source') != 'table':
                        continue
                    drop_table = dropdowns[drop].get('table')
                    if drop_table and dropdowns[drop].get('table') != '':
                        tables.append(dropdowns[drop].get('table'))
            # actions
            eas = form.get('eas')
            if eas:
                for ea in eas:
                    if eas[ea].get('type') == 'TABLEQUERY':
                        table = eas[ea].get('ea').get('actions').get('table')
                        if table != '':
                            print("KEEP TABLE > ", table)
                            tables.append(table)

        in_use = rasters + static_images + tables
        #print(in_use)
         # GET THE IDs OF ALL IMAGE ASSETS USED BY THE FORM
        for asset_in_use in in_use:
            #print("11111111111",FORM_ASSETS_DIR + str(form_id) + '/' + asset_in_use)
            a = FormAsset.objects.get(asset=FORM_ASSETS_DIR + str(form_id) + '/' + asset_in_use)#, form__pk=form_id)
            #print("22222222222")
            assets_to_keep.append(a.id)

        # ALL ASSETS RELATED WITH THE FORM
        #print("33333333333333")
        all_assets = FormAsset.objects.all().filter(form__pk=form_id).values_list('id', flat=True)
        #print("444444444444444")
        # REMOVE
        to_delete = [value for value in all_assets if value not in assets_to_keep]
        for asset_id in to_delete:
            FormAsset.objects.get(pk=asset_id).delete()

        return {'status':'ok', 'form': form}
    except Exception as e: 
        raise e




# OPENED | CLOSED | COMPLETED | LOCKED | DISABLED | TEMPORARY | IN USE

class Status(models.Model):    
    """Status of a form [IN USE | EDITABLE | DISABLED | TEMPORARY]."""
    name = models.CharField(max_length = 80)
    description = models.CharField(max_length = 80, null=True, blank=True)

    class Meta:
        db_table = 'status'
        verbose_name_plural = "status"

    def __str__(self):
        return self.name


#FORM_STATUS_CHOICES = (
#        (7,'TEMPORAY'),
#        (8,'IN USE'),
#        (9,'EDITABLE'),
#        (8,'DISABLED'),
#)

# status: IN USE | EDITABLE | DISABLED | TEMPORARY
class Form(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)
    description = models.CharField(max_length=250, blank=True, null=True)
    status = models.ForeignKey(Status, verbose_name="status", related_name='form', null=True, blank=True, on_delete=models.SET_NULL)
    author = models.ForeignKey('accounts.User', models.SET_NULL, db_column='author', blank=True, null=True, related_name="form_author")
    locked_by = models.ForeignKey('accounts.User', models.SET_NULL, db_column='locked_by', blank=True, null=True, related_name="form_locked_by")
    updated_by = models.ForeignKey('accounts.User', models.SET_NULL, db_column='updated_by', blank=True, null=True, related_name="form_updated_by")
    disabled_by = models.ForeignKey('accounts.User', models.SET_NULL, db_column='disabled_by', blank=True, null=True, related_name="form_disabled_by")
    date_created = models.DateTimeField(blank=True, null=False, auto_now_add=True)
    date_updated = models.DateTimeField(blank=True, null=True, auto_now=True)
    date_locked = models.DateTimeField(blank=True, null=True)
    date_disabled = models.DateTimeField(blank=True, null=True)
    form = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.name


    class Meta:
        #managed = False
        db_table = 'form'
        constraints = [ models.UniqueConstraint(fields=['name'], name="form_name") ]

    @property
    def status_name(self):
        return self.status.name
    
    # everytime it saves, clean it
    def save(self, *args, **kwargs):        
        removeUnusedAssets(self.pk, self.form)
        super(Form, self).save(*args, **kwargs)

    # only for clone
    def saveClone(self, *args, **kwargs):        
        super(Form, self).save(*args, **kwargs)


class AssetType(models.Model):
    """Assets used in a form [CSV | IMAGE]."""
    name = models.CharField(max_length = 10)

    class Meta:
        db_table = 'asset_type'
        constraints = [ models.UniqueConstraint(fields=['name'], name="assettype_name") ]

    def __str__(self):
        return self.name




# Base asset.
class Asset(models.Model):
    name = models.CharField(max_length = 80)
    date = models.DateTimeField(auto_now_add=True)
    type = models.ForeignKey(AssetType, models.SET_NULL, blank=True, null=True, related_name="%(app_label)s_%(class)s_related", default=1)

    class Meta:
        db_table = 'asset'
        abstract = True



def form_asset_path_file_name(instance, filename):
    """Where to save the assets: /form_assets/{form_id}/{filename}"""
    return '/'.join(filter(None, ('form_assets', str(instance.form.id), filename)))


class FormAsset(Asset):
    """
        Each asset is uniquely associated with a form.
        This ensures that assets can be changed without affecting other forms.
    """
    form = models.ForeignKey('Form', on_delete=models.CASCADE, related_name="form_asset_related_name")    
    asset = models.FileField(upload_to=form_asset_path_file_name)

    class Meta(Asset.Meta):
        db_table = 'form_asset'

    def __str__(self):
        return self.name



#QUERY_STATUS_CHOICES = (
#        (5,'LOCKED'),
#        (6,'DISABLED'),
#)

# STATUS: LOCKED | DISABLED
class Query(models.Model):
    name = models.CharField(null=False, max_length = 80)
    description = models.CharField( null=True, blank=True, max_length = 128)
    query = models.CharField(null=False, max_length = 1024)
    date = models.DateTimeField(null=False, auto_now=True)    
    status = models.ForeignKey(Status, verbose_name="status", null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = 'query'
        verbose_name_plural = "Queries"
        constraints = [ models.UniqueConstraint(fields=['name'], name="query_name") ]

    def __str__(self):
        return self.name


