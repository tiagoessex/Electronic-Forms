import re
import os

from designer.models import Form
from .models import Operation
from .models import OperationData

from .serializers import OperationDataSerializer
from designer.serializers import FormSimplex3Serializer

from idrisk.settings import OPERATION_ASSETS_URL


# elements that are not listed here, have no validation
VALIDATIONS = {      
    'DBFIELD' : 0x0,
    'TEXT' : 0x27,
    'EMAIL' : 0x27,
    'PHONE' : 0x27,
    'WEBSITE'  : 0x27,
    'TEXTBOX' : 0x26,
    'NUMBER'  : 0x1B,
    'DROPDOWN' : 0x2,
    'CHECKBOX' : 0x2,
    'RADIO' : 0x2,
    'DATE' : 0x3,
    'TIME' : 0x3,
    'PHOTO' : 0x2,
    'BARCODE_TEXT'  : 0x23,
    'BARCODE_IMAGE' : 0x2,
    'GPS_TEXT'  : 0x23,
    'GPS_MAP' : 0x2,
    'SIGNATURE' : 0x2,
    'DRAWING' : 0x2,
    'USERIMAGE'  : 0x2,
    'TABLE'  : 0x0,
}

#MESSAGE_NO_DATABASE_FIELD = {'code':1, 'message': 'No Database Field defined!'}
MESSAGE_NO_VALUE = {'code':1, 'message': 'No value!'}
MESSAGE_INCORRECT_FORMAT = {'code':2, 'message': 'Incorrect format/pattern!'} # PATTERN
MESSAGE_NO_UPPERCASE = {'code':3, 'message': 'No uppercase!'}
MESSAGE_LENGTH_EXCEEED = {'code':4, 'message': 'Max length exceed!'}
MESSAGE_MAX_EXCEEDED = {'code':5, 'message': 'Max value exceeded!'}
MESSAGE_MIN_EXCEEDED = {'code':6, 'message': 'Min value exceeded!'}
MESSAGE_NOTHING_SELECTED = {'code':7, 'message': 'No option selected!'}


def OpFormData(operation_id):
    """Returns all relevant data from the form (id, name, label, database field, type) 
        and operations (input data, status, visibility) 
        and includes all validations associated with each field.

        Radios and checkpoints are in their respective groups, and validations are
        associated with the group itself and not its individual elements."""
    try:
        # operation data
        operation_data = OperationDataSerializer(OperationData.objects.get(operation = operation_id))
        _operation = Operation.objects.only('id').get(pk = operation_id)
        # form data
        form_id = _operation.form_id
        form_data = FormSimplex3Serializer(Form.objects.get(pk=form_id))

        _data = {'elements':[], 'groups':[]}

        form_elements = form_data.data.get('form').get('elements')
        groups = form_data.data.get('form').get('groups')
        try:
            operation_elements =  operation_data.data.get('data').get('elements')
            operation_extras =  operation_data.data.get('data').get('extras')
            operation_annexes =  operation_data.data.get('data').get('annexes')
        except:
            raise TypeError('No data')
        # for each element in operations
        for operation_element in operation_elements:
            obj = {}
            _id = operation_element.get('id')
            value = operation_element.get('value')
            selected = operation_element.get('selected')
            enabled = operation_element.get('enabled')
            visible = operation_element.get('visible')

            # get element details from form
            form_element = None
            for element in form_elements:
                if element.get('id') == _id:
                    form_element = element
                    break

            group = form_element.get('props').get('properties-group')
            required = form_element.get('props').get('properties-required')
            uppercase = form_element.get('props').get('properties-uppercase')
            element_type = form_element.get('type')

            # checkboxes and radios are validated on their groups and not individually
            if (element_type not in ['CHECKBOX','RADIO']):
                
                # which validations should be be applied
                validations = VALIDATIONS.get(element_type)
                # if none => this element has no validations
                if validations:
                    obj['id'] = _id
                    obj['value'] = value
                    obj['name'] = form_element.get('props').get('properties-name')
                    obj['label'] = form_element.get('props').get('properties-label')
                    obj['database'] = form_element.get('props').get('properties-database')
                    obj['type'] = element_type
                    obj['enabled'] = enabled
                    obj['visible'] = visible
                    obj['validations'] = {}
                    
                    if validations & 32:
                        obj['validations']['max-length'] = form_element.get('props').get('properties-max-length')
                    if validations & 16:
                        obj['validations']['max'] = form_element.get('props').get('properties-max')
                    if validations & 8:
                        obj['validations']['min'] = form_element.get('props').get('properties-min')
                    if validations & 4:
                        obj['validations']['uppercase'] = True if form_element.get('props').get('properties-uppercase')=='yes' else False
                    if validations & 2:
                        obj['validations']['required'] = True if form_element.get('props').get('properties-required')=='yes' else False
                    if validations & 1:
                        obj['validations']['pattern'] = form_element.get('props').get('properties-pattern')

                    # extra required validation (from E/A)
                    if _id in operation_extras and 'REQUIRED' in operation_extras.get(_id):
                        if operation_extras.get(_id).get('REQUIRED'):
                            obj['validations']['required'] = True#'yes'
                        else:
                            obj['validations']['required'] = False#'no'

                    _data['elements'].append(obj)

            else:
                # [{'id': 'gp-0', 'name': 'Group 0', 'database': '', 'required': 'yes'}]
                for gp in groups:
                    if gp.get('id') == group:
                        if 'selected_elements' not in gp:
                            gp['selected_elements'] = []


                            #extra required validation (from E/A)
                            if group in operation_extras and 'REQUIRED' in operation_extras.get(group):
                                if operation_extras.get(group).get('REQUIRED'):
                                   gp['required'] = True#'yes'
                                else:
                                    gp['required'] = False#'no'

                        # gp['required']==True --- REQUIRED, SINCE gp['required']=='X' IS ALSO TRUE
                        gp['required'] = True if gp['required']=='yes' or gp['required']==True else False

                        if 'type' not in gp:
                            gp['type'] = element_type

                        gp['enabled'] = enabled
                        gp['visible'] = visible

                        if not selected:
                            break
                        

                        obj['name'] = form_element.get('props').get('properties-name')
                        obj['label'] = form_element.get('props').get('properties-label')
                        obj['id'] = _id

                        gp['selected_elements'].append(obj)

                        break
            
        _data['groups'] = groups
        _data['annexes'] = operation_annexes

        return _data
    except Exception as e: 
        raise e

def validateGroup(group):
    enabled = group.get('enabled')
    visible = group.get('visible')
    if not enabled or not visible:
        return None, None
    error_messages = []
    warning_messages = []
    # required
    if len(group.get('selected_elements')) == 0:
        if group.get('required') == 'yes' or group.get('required') == True:
            error_messages.append(MESSAGE_NOTHING_SELECTED)
        else:
            warning_messages.append(MESSAGE_NOTHING_SELECTED)
    # database
    #if 'database' in group and group.get('database') == '':
    #    warning_messages.append(MESSAGE_NO_DATABASE_FIELD)

    return error_messages, warning_messages

def validateElement(element):
    validations = element.get('validations')        
    enabled = element.get('enabled')
    visible = element.get('visible')
    if not enabled or not visible:
        return None, None
    value = element.get('value')
    error_messages = []
    warning_messages = []
    _value = value

    if value:
        if isinstance(value,dict):
            # if gps
            if 'lat' in value and value.get('lat'):
                _value = str(value.get('lat')) + ',' + str(value.get('lng'))
            else:
                _value = None
            # if barcode
            if 'code' in value and value.get('code'):
                _value = value.get('code')
            else:
                _value = None

    # required validation
    if not _value and validations.get('required') == 'yes':
        error_messages.append(MESSAGE_NO_VALUE)            
    elif not _value:
        warning_messages.append(MESSAGE_NO_VALUE)

    # max length
    if 'max-length' in validations:
        if _value and len(_value) > int(validations['max-length']):
            error_messages.append(MESSAGE_LENGTH_EXCEEED)

    # database        
    #if 'database' in element and element.get('database') == '':
    #    warning_messages.append(MESSAGE_NO_DATABASE_FIELD)

    # max
    if 'max' in validations and _value and _value > float(validations.get('max')):
        error_messages.append(MESSAGE_MAX_EXCEEDED)

    # min
    if 'min' in validations and _value and _value < float(validations.get('min')):
        error_messages.append(MESSAGE_MIN_EXCEEDED)

    # pattern
    if 'pattern' in validations and validations.get('pattern') !='' and validations.get('pattern') != 'Default':
        pattern = "^" + validations.get('pattern') + "$"
        if _value and not re.compile(pattern).search(_value):
            error_messages.append(MESSAGE_INCORRECT_FORMAT)


    return error_messages, warning_messages


def validateInputs(operation_id):
    """Validates the inputs of an operation. 
    Returns {
        'elements': [[{element_id, [error_messages], [warning_messages]}], ...], 
        'groups': [[{group_id, [error_messages], [warning_messages]}], ...]
    }."""
    try:
        data = OpFormData(operation_id)
        validation_results = {'elements': [], 'groups': []}

        for element in data.get('elements'):
            errors, warnings = validateElement(element)
            validation_results['elements'].append({'id': element.get('id'), 'name':element.get('name'), 'label':element.get('label'), 'errors': errors, 'warnings': warnings})
        for group in data.get('groups'):
            errors, warnings = validateGroup(group)
            validation_results['groups'].append({'id': group.get('id'), 'name':group.get('name'), 'errors': errors, 'warnings': warnings})
        return validation_results
    except Exception as e: 
        raise e



def removeEmptyAssetsDirs():
    """Remove all empty assets dir."""    
    folders = list(os.walk(OPERATION_ASSETS_URL))[1:]
    for folder in folders:
        if not folder[2]:
            os.rmdir(folder[0])