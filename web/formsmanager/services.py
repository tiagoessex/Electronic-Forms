
import os

from idrisk.settings import FORM_ASSETS_URL

from designer.models import Form
from designer.models import Status

from designer.files import removeDirectory



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


def removeEmptyAssetsDirs():
    """Remove all empty assets dir."""    
    folders = list(os.walk(FORM_ASSETS_URL))[1:]
    for folder in folders:
        if not folder[2]:
            os.rmdir(folder[0])