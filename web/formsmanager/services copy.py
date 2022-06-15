
from django.db.models import Q
from idrisk.settings import MEDIA_URL, FORM_ASSETS_URL, FORM_ASSETS_DIR

from designer.models import Form
from designer.models import FormAsset
from designer.models import AssetType
from designer.models import Status

from designer.files import copyDirectory, removeDirectory


def removeUnusedAssets(form_id):
    """
        Remove all usused assets (images and tables) of a form.
        Returns {'status':'ok', 'form': form} is success.
        If error, raises an exception.
    """
    try:
        form = Form.objects.get(pk=form_id)

        # ---------- REMOVE ALL UNUSED ASSETS ---------
        # TO KEEP
        in_use = []
        static_images = []
        rasters = []
         
        if form.form:
            for element in form.form.get('elements'):
                image = element.get('props').get('properties-image-url')
                if image:
                    static_images.append(image)            
            rasters = form.form.get('rasters')
        # --- TODO --- TABLES
        in_use = rasters + static_images

        # GET THE IDs OF ALL ASSETS USED BY THE FORM
        assets_to_keep = []
        for asset_in_use in in_use:            
            a = FormAsset.objects.get(asset=FORM_ASSETS_DIR + form_id + '/' + asset_in_use)#, form__pk=form_id)
            assets_to_keep.append(a.id)
        
        # ALL ASSETS RELATED WITH THE FORM
        # --- EXCEPT TABLES --- FOR NOW
        '''
        asset_type_csv = AssetType.objects.only('id').get(name='CSV')
        all_assets = FormAsset.objects.all().filter(~Q(id=request.data.get('id')) & ~Q(type = asset_type_csv)).values_list('id', flat=True)
        '''
        all_assets = FormAsset.objects.all().filter(Q(form__pk=form_id) & ~Q(type__name = 'CSV')).values_list('id', flat=True)
        # REMOVE
        to_delete = [value for value in all_assets if value not in assets_to_keep]
        '''
        print(all_assets)
        print(assets_to_keep)
        print(to_delete)
        raise "exit"        
        '''
        for asset_id in to_delete:
            FormAsset.objects.get(pk=asset_id).delete()

        return {'status':'ok', 'form': form}
    except Exception as e: 
        raise e



def removeAllTempForms():
    """
        Remove all temporary forms and their assets.
        Returns {'status':'ok'} is success.
        If error, raises an exception.
    """    
    try:
        _status = Status.objects.only('id').get(name='TEMPORARY')
        forms_2_delete = Form.objects.filter(status = _status)#.delete()

        for form in forms_2_delete:
            removeDirectory(FORM_ASSETS_URL + str(form.pk) + '/')

        forms_2_delete.delete()

        return {'status':'ok'}
    except Exception as e: 
        raise e


def task1():
    print("task1")
    print("task1")
    print("task1")
    print("task1")
    print("task1")
    print("task1")