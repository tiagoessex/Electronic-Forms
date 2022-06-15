from django.db import models

from designer.models import Form, Status, Asset

from idrisk.settings import MEDIA_URL, OPERATION_ASSETS_DIR

#from operations.utils import getRelativeUrls

# Create your models here.

def removeUnusedAssets(operation_id, operation_data_id, data):
    """
        Remove all usused assets (images, tables, ...) of an operation.
        Returns {'status':'ok'} is success.
        If error, raises an exception.
    """
    try:
        # to keep
        in_use = []
        if data and 'elements' in data:
            for element in data.get('elements'):
                #getRelativeUrls(element, in_use)
                _id = element.get('id').rsplit('_',1)[0]                
                if _id in ['userimage','photo','signature','drawing']:
                    if element.get('value'):
                        in_use.append(element.get('value'))
                elif _id in ['barcode_image']:
                    if element.get('value').get('image'):
                        in_use.append(element.get('value').get('image'))
                    #print(_id, _id, _id)
            if 'annexes' in data:
                in_use += data.get('annexes')
            assets_to_keep = []
          


            for asset_in_use in in_use:
                #filename = asset_in_use.replace(MEDIA_URL,'')
                filename = OPERATION_ASSETS_DIR + str(operation_id) + '/' + asset_in_use
                try:
                    a = OperationAsset.objects.get(asset=filename)
                    assets_to_keep.append(a.id)
                except:
                    print("OperationData [" + str(operation_data_id) + "]: Asset: [" + filename + "] does not exist!")
                    # check annexes for this file
                    # if yes, remove it
                    if 'annexes' in data:
                        if asset_in_use in data.get('annexes'):
                            data.get('annexes').remove(asset_in_use)

            # all assets associated with the operation
            all_assets = OperationAsset.objects.all().filter(operation=operation_id).values_list('id', flat=True)               
            # assets to remove
            to_delete = [value for value in all_assets if value not in assets_to_keep]
            for asset_id in to_delete:
                OperationAsset.objects.get(pk=asset_id).delete()

        return {'status':'ok'}
    except Exception as e: 
        raise e



#OPERATION_STATUS_CHOICES = (
#        (3,'OPEN'),
#        (2,'CLOSED'),
#        (4,'COMPLETED'),
#)

# status: OPEN | CLOSED | COMPLETED ---- CONSTANTS.JS ~ DB ~ VIEWS.PY
class Operation(models.Model):
    name = models.CharField(max_length = 80, null=True)
    description = models.CharField(max_length=250, null=True)
    form = models.ForeignKey(Form, verbose_name="form", null=True, blank=True, on_delete=models.SET_NULL)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('accounts.User', verbose_name="author", null=True, blank=True, on_delete=models.SET_NULL, related_name="operation_author")
    updated_by = models.ForeignKey('accounts.User', verbose_name="updated_by", blank=True, null=True, on_delete=models.SET_NULL, related_name="operation_updated_by")    
    status = models.ForeignKey(Status, verbose_name="status", null=True, blank=True, on_delete=models.SET_NULL)


    class Meta:
        db_table = 'operation'

    def __str__(self):
        return self.name

    @property
    def status_name(self):
        return self.status.name


class OperationData(models.Model):
    operation = models.ForeignKey(Operation, verbose_name="operation", null=True, blank=True, on_delete=models.CASCADE)
    data = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = 'operation_data'
        verbose_name_plural = "Operations Data"


    def __str__(self):
        return "OperationData " + str(self.id)

    # everytime is saved, clean it
    def save(self, *args, **kwargs):
        removeUnusedAssets(self.operation_id, self.pk, self.data)
        super(OperationData, self).save(*args, **kwargs)


# where to save the assets:
# assets/operation_id/filename
def operation_asset_path_file_name(instance, filename):
    return '/'.join(filter(None, ('operation_assets', str(instance.operation.id), filename)))

# Each asset is associated with a form.
# This ensures that assets can be changed without affecting other forms.
class OperationAsset(Asset):
    operation = models.ForeignKey('Operation', on_delete=models.CASCADE, related_name="operation_asset_related_name")    
    asset = models.FileField(upload_to=operation_asset_path_file_name)
    is_annex = models.BooleanField(default=False)

    class Meta(Asset.Meta):
        db_table = 'operation_asset'

    def __str__(self):
        return self.name
