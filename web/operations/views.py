from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  
from django.db import connection
#from django.db import connections
from django.utils import timezone
from django.db.models import Q
from django.conf import settings


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

import re 
from django.http import HttpResponse #, Http404
import os

import base64
from django.core.files.base import ContentFile

from designer.serializers import FormSimplexSerializer
from designer.utils import dictfetchall
from designer.models import Form
from designer.models import Query
from designer.models import Status
from designer.models import AssetType

from .models import Operation
from .models import OperationData
from .models import OperationAsset
#from .serializers import OperationIDSerializer
from .serializers import OperationSerializer
from .serializers import OperationDataSerializer
from .serializers import OperationFormDataSerializer
from .serializers import FullOperationDataSerializer
from .serializers import OperationAssetSerializer

from collections import namedtuple

from idrisk.settings import MEDIA_URL, OPERATION_ASSETS_URL

from designer.files import removeDirectory
from operations.services import validateInputs, OpFormData

from idrisk.settings import MEDIA_URL


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def operations(request):
   context = {}
   context["dataset"] = Operation.objects.all()
   return render(request, "operations/operations.html", context)



@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_in_use_forms(request):
   """
      Returns all in use forms but not disabled.
   """
   if request.method == 'GET':
      try:
         '''
         _status = Status.objects.only('id').get(name='IN USE')
         forms = Form.objects.all().filter(status = _status)
         '''
         forms = Form.objects.all().filter(status__name = 'IN USE')
         serializer = FormSimplexSerializer(forms, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception:
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


####################################
#  --- TODO: TARGETED DATABASE ---
####################################
@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def exec_query(request):   
   """
      Executes a query and returns the results.
   """
   if request.method == 'POST':
      try:
         _query = Query.objects.filter(pk=request.data.get('query_id'))
         query = _query.values('query')[0]['query']
         origins = request.data.get('origins')

         # #ORIGIN# -> ORIGIN         
         for i in origins:
            #rep = i.replace('$','')
            #print(i)
            query = query.replace(i['query_origin_field'], '"' + str(i['form_origin_value']) + '"')

         # $TARGET$ -> TARGET
         targets = re.findall(r"\$\w{0,50}?\$", query) 
         for i in targets:
            rep = i.replace('$','')
            query = query.replace(i, rep)

         try:
            with connection.cursor() as cursor:
               cursor.execute(query)
               results = dictfetchall(cursor)
               return Response(data=results, status=status.HTTP_200_OK)            
         except Exception as e:
            print (e)
            return Response(data = {'error': e}, status=status.HTTP_200_OK)

      except Query.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def clean_operation_assets(request):
   """
      Removes all unsed assets of a non COMPLETED operation by saving the operation data of a specific operation.

      Body params:
         operation_id (number): Operation ID.         
   """
   if request.method == 'POST':
      try:
         operation_id = request.data.get('operation_id')
         operation = Operation.objects.only('id').get(pk=operation_id)
         
         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)

         operation_data = OperationData.objects.only('id').get(operation=operation)
         operation_data.save()
         return Response(data={}, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, OperationData.DoesNotExist) as e:
         print(e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def new_operation(request):
   """
      Creates a new operation ans sets its status as OPEN.

      Body params:
         form_id (number): Form ID  
         name (string): Operation name
         description (string): Operation description
   """
   if request.method == 'POST':
      try:        
         form = Form.objects.only('id').get(pk=request.data.get('form_id'))
         name = request.data.get('name')
         description = request.data.get('description')
         operation_status = Status.objects.only('id').get(name='OPEN')
         operation = Operation(form=form, name=name, description=description, status=operation_status, author=request.user, updated_by=request.user)
         operation.save()
         operation_data = OperationData(operation=operation, data=None)
         operation_data.save()
         #serializer = OperationIDSerializer(operation)
         serializer = OperationSerializer(operation)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist, OperationData.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


import datetime

@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def new_operation_complete(request):
   """
      Saves an operation.
      Unlike new_operation, it must be provided with everything except the operation ID.

      Body params:
         form (number): Form ID  
         name (string): Operation name
         description (string): Operation description
         date_creation (string): Date of creation
         date_updated (string): Date of the last update
         operation_data (object): Operation data

   """
   if request.method == 'POST':
      try:
         form = Form.objects.only('id').get(pk=request.data.get('form'))
         name = request.data.get('name')
         description = request.data.get('description')
         date_creation = request.data.get('date_creation')
         date_updated = request.data.get('date_updated')
         operation_data = request.data.get('operation_data')
         operation_status = Status.objects.only('id').get(name='OPEN')
         operation = Operation(
            form=form, 
            name=name, 
            description=description, 
            status=operation_status, 
            author=request.user, 
            updated_by=request.user,            
         )
         operation.save()
         # this is stupid ...
         operation.date_creation=date_creation
         operation.date_updated=date_updated
         operation.save()
         data = OperationData(operation=operation, data=operation_data)
         data.save()
         serializer = OperationSerializer(operation)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Status.DoesNotExist, Form.DoesNotExist) as e:
         print (e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def delete_operation(request):
   """
      Deletes a non COMPLETED operation, all its assets and their directory.

      Body params:
         operation_id (number): Operation ID

      Returns: {'id': operation_id}  
   """
   if request.method == 'POST':
      try:
         operation_id = request.data.get('operation_id')
         operation = Operation(pk=operation_id)

         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)  

         operation.delete()

         removeDirectory(OPERATION_ASSETS_URL + str(operation_id) + '/')

         return Response(data = {'id': operation_id}, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist, OperationData.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def update_operation(request):
   """
      Updates a non COMPLETED operation.

      Body params:
         operation_id (number): Operation ID
         name (string): Operation name [optional]
         description (string): Operation description [optional]
         form_id (number): Form ID [optional]
         data (object): Operation data [optional]
      
      Returns: {'operation_description': object, 'operation_data': object}
   """
   if request.method == 'POST':
      try:
         operation = Operation.objects.get(pk=request.data.get('operation_id'))

         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)  

         operation.date_updated = timezone.now()
         operation.updated_by = request.user
         if (request.data.get('name')):
            operation.name = request.data.get('name')
         if (request.data.get('description')):
            operation.description = request.data.get('description')
         if (request.data.get('form_id')):
            form = Form.objects.only('id').get(pk=request.data.get('form_id'))
            operation.form = form
         operation.save()
         if (request.data.get('operation_id')):
            operation_data = OperationData.objects.get(operation=operation)
            if 'data' in request.data:
               operation_data.data = request.data.get('data')
            operation_data.save()
         
         op = namedtuple('operation', ('operation_description', 'operation_data'))
         _qwe = op(operation_description = operation, operation_data = operation_data)
         serializer = FullOperationDataSerializer(_qwe)

         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Operation.DoesNotExist, OperationData.DoesNotExist) as e:
         print(e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_operation(request, pk):
   """
      Returns a specific operation.

      Params:
         pk (number): Operation ID
   """
   if request.method == 'GET':
      try:
         operation = Operation.objects.get(pk = pk)
         serializer = OperationSerializer(operation)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_operations(request, stats):
   """
      Returns all operations with a given status for the current user.

      Params:
         stats (string): Operation STATUS (OPEN | CLOSED | COMPLETED)
   """
   if request.method == 'GET':
      try:
         operations = Operation.objects.all().filter(status__name = stats, author=request.user)
         serializer = OperationSerializer(operations, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_all_operations(request):
   """
      Returns a list of all operations, regardless of the status and user.
   """
   if request.method == 'GET':
      try:
         operations = Operation.objects.all()
         serializer = OperationSerializer(operations, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_non_completed_operations(request):
   """
      Returns all non CLOSED operations, so all (OPEN | CLOSED) for the current user.
   """
   if request.method == 'GET':
      try:
         operations = Operation.objects.exclude(status__name='COMPLETED').filter(author=request.user)
         serializer = OperationSerializer(operations, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_all_non_completed_operations(request):
   """
      Returns all non COMPLETED operations, so all (OPEN | CLOSED).
   """
   if request.method == 'GET':
      try:
         operations = Operation.objects.exclude(status__name='COMPLETED')
         serializer = OperationSerializer(operations, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_operation_data(request, pk):
   """
      Returns the data of a specific operation.
      If an operation has no data, returns an empty object {}.

      Params:
         pk (number): Operation ID
      
      Returns: {}
   """
   if request.method == 'GET':
      try:
         operations = OperationData.objects.get(operation = pk)
         serializer = OperationDataSerializer(operations)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (OperationData.DoesNotExist):
         return Response({}, status=status.HTTP_200_OK)
         #return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def set_operation_status(request):
   """
      Changes the status of a non COMPLETED operation to (OPEN | CLOSED | COMPLETED)
      and update its assets.

      Body params:
         operation_id (number): Operation ID
         status (string): New operation status (OPEN | CLOSED | COMPLETED)
   """
   if request.method == 'POST':
      try: 
         operation = Operation.objects.get(pk=request.data.get('operation_id'))

         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)

         operation.date_updated = timezone.now()
         operation.updated_by = request.user
         operation_status = Status.objects.only('id').get(name=request.data.get('status'))
         operation.status = operation_status
         operation.save()
         # update assets
         operation_data = OperationData.objects.only('id').get(operation=operation)
         operation_data.save()         
         serializer = OperationSerializer(operation)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, Status.DoesNotExist, OperationData.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_operation_form_data(request, pk):
   """
      Returns all the data of a specific operation and its respective form (only id, name and form).
      Ex: field_id, value, dastabase_field.

      Params:
         pk (number): Operation ID
      
      Returns: {'form': form_data, 'data': operation_data}

   """
   if request.method == 'GET':
      try:
         operationdata = OperationData.objects.get(operation = pk)
         _operation = Operation.objects.only('id').get(pk = pk)
         form_id = _operation.form_id
         form = Form.objects.get(pk=form_id)
         Data = namedtuple('Data', ('form', 'data'))
         _qwe = Data(form= form, data= operationdata)
         serializer = OperationFormDataSerializer(_qwe)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, OperationData.DoesNotExist, Form.DoesNotExist) as e:
         print(e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@api_view(["POST"])
def upload_operation_asset(request):
   """
      Uploads an asset and associates it to a non COMPLETED operation.
      #no: Also updates the operation last update date by saving it.

      Body params:
         id (number): Operation ID
         name (string): Asset name
         is_annex (boolean): True if asset is an annex, false otherwise [optional]
         file (File | object): Asset data

   """
   if request.method == 'POST':
      try:
         operation = Operation.objects.get(pk=request.data.get('id'))
         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)  
         #operation.date_updated = timezone.now()
         asset_type = AssetType.objects.only('id').get(name=request.data.get('type'))
         if 'is_annex' in request.data and request.data.get('is_annex'):
            is_annex = True
         else:
            is_annex = False
         if 'file' in request.data:
            data = request.data.get('file')
            format, imgstr = data.split(';base64,')
            image_data = ContentFile(base64.b64decode(imgstr), name=request.data.get('name')) # You can save this as file instance.
            asset = OperationAsset(name=request.data.get('name'), type=asset_type, asset=image_data, operation=operation, is_annex=is_annex)            
            #print(imgstr)
         else:
            asset = OperationAsset(name=request.data.get('name'), type=asset_type, asset=request.FILES['asset-file'], operation=operation, is_annex=is_annex)
         asset.save()
         #operation.save()
         serializer = OperationAssetSerializer(asset)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, AssetType.DoesNotExist, OperationAsset.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@api_view(["POST"])
def upload_operation_asset_complete(request):
   """
      Uploads an asset and associates it to a non COMPLETED operation.
      Also updates the operation last update date.
      Unlike upload_operation_asset it receives all the data required.

      Body params:
         operation_id (number): Operation ID
         name (string): Asset name
         type_name (string): Asset type (IMAGE | CSV | PDF | ...)
         is_annex (boolean): True if asset is an annex, false otherwise [optional]
         date (string): Asset date
         data (File | object): Asset data

   """
   if request.method == 'POST':
      try:
         name = request.data.get('name')
         operation = Operation.objects.get(pk=request.data.get('operation_id'))

         if operation.status.name == 'COMPLETED':
            return Response(status=status.HTTP_403_FORBIDDEN)

         asset_type = AssetType.objects.only('id').get(name=request.data.get('type_name'))
         is_annex = request.data.get('is_annex')
         data = request.data.get('data')
         asset = OperationAsset(
            name=name,
            operation=operation,
            type=asset_type,
            is_annex = True if is_annex=='true' else False
         )
         asset.save()
         # TODO: CHECK THESE LINES
         asset.date = request.data.get('date')
         asset.asset.save(data.name, data)
         asset.save()

         serializer = OperationAssetSerializer(asset)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, AssetType.DoesNotExist, OperationAsset.DoesNotExist) as e:
         print(e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def remove_operation_asset(request):
   '''
      Removes operation assets from a non COMPLETED operation, identified by an array of IDs or 
      full relative names.
      Also updates the operation last_update date.

      Body params:
         id (number): Asset ID
         name (string): Asset name
         save_operation (boolean): If true, save operation => updated_date will be updated [optional]
         keep_date (boolean): If true => updated_date is not changed [optional]
   '''
   if request.method == 'POST':
      try:         
         operation_id = None         

         data = {}
         if 'id' in request.data:
            for id in request.data.get('id'):
               #OperationAsset.objects.filter(pk=id).delete()
               op_asset = OperationAsset.objects.get(pk=id)
               if not operation_id:
                  operation_id = op_asset.operation_id
                  operation = Operation.objects.get(pk=operation_id)
                  if operation.status.name == 'COMPLETED':
                     return Response(status=status.HTTP_403_FORBIDDEN)  
               op_asset.delete()
            data['id'] = [int(num) for num in request.data.get('id')]
         if 'name' in request.data:
            for name in request.data.get('name'):
               filename = name.replace(MEDIA_URL,'')
               #OperationAsset.objects.get(asset=filename).delete()
               op_asset = OperationAsset.objects.get(asset=filename)
               if not operation_id:
                  operation_id = op_asset.operation_id
                  operation = Operation.objects.get(pk=operation_id)
                  if operation.status.name == 'COMPLETED':
                     return Response(status=status.HTTP_403_FORBIDDEN)                    
               op_asset.delete()
            data['name'] = request.data.get('name')

         save_op = True
         keep_date = False
         if 'save_operation' in request.data:
            save_op = True if request.data.get('save_operation') else False
         if 'keep_date' in request.data:
            keep_date = True if request.data.get('keep_date') else False            
         if save_op:
            operation = Operation.objects.get(pk=operation_id)
            if not keep_date:
               operation.date_updated = timezone.now()
            operation.save()

         return Response(data=data, status=status.HTTP_200_OK)
      except (OperationAsset.DoesNotExist, Operation.DoesNotExist) as e:
         print (e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception:
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def validate_operation_inputs(request, pk):
   """
      Validates the inputs of an operation. 
      
      Params:
         pk (number): Operation ID

      Returns: {
        'elements': [[{element_id, [error_messages], [warning_messages]}], ...], 
        'groups': [[{group_id, [error_messages], [warning_messages]}], ...]
      }.
   """
   if request.method == 'GET':
      try:
         data = validateInputs(pk)
         return Response(data, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_op_form_data(request, pk):
   """
      Returns all relevant data from the form (id, name, label, database field, type) 
      and operations (input data, status, visibility) 
      and includes all validations associated with each field.

      Radios and checkpoints are in their respective groups, and validations are
      associated with the group itself and not its individual elements.

      Params:
         pk (number): Operation ID

   """
   if request.method == 'GET':
      try:
         data = OpFormData(pk)
         return Response(data, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_operation_assets(request, pk, name=None):
   """
      Lists all assets or all assets of a specific type of a specific operation.

      Params:
         pk (number): Operation ID
         name (string): Asset type (IMAGE | CSV | PDF | ...)
   """
   if request.method == 'GET':
      try:
         if (name):
            assets = OperationAsset.objects.all().filter(operation = pk, type__name=name)
         else:
            assets = OperationAsset.objects.all().filter(operation = pk)
         serializer = OperationAssetSerializer(assets, many=True)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except OperationAsset.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception:
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_operation_annexes(request, pk):
   """
      Lists all annexes of a specific type of a specific operation.

      Params:
         pk (number): Operation ID
   """
   if request.method == 'GET':
      try:
         assets = OperationAsset.objects.all().filter(operation = pk, is_annex = True)
         serializer = OperationAssetSerializer(assets, many=True)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except OperationAsset.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception:
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@api_view(["GET"])
def download_asset(request, pk):
   """
      Returns an asset.

      Params:
         pk (number): Asset ID
   """
   if request.method == 'GET':
      try:   
         asset = OperationAsset.objects.filter(pk=pk)
         data = list(asset.values())
         if len(data) > 0:
            path = os.path.join(settings.MEDIA_ROOT, data[0]['asset'])
            if os.path.exists(path):
               with open(path, 'rb') as myfile:
                  response = HttpResponse(myfile.read()) #, content_type='text/csv')
                  response['Content-Disposition'] = 'attachment; filename=' + data[0]['name']
                  return response
         return Response(status=status.HTTP_404_NOT_FOUND)  
      except OperationAsset.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def is_operation_signed(request, pk):
   """
      Checks whether or not an operation is signed.
      This is done, by checking the existence of an asset pdf file:

      DOC_SIGNED.pdf

      Params:
         pk (number): Operation ID

      Responses:
         {'exists':true} | {'exists':false} | error
   """
   if request.method == 'GET':
      try:
         #file_2_search = "DOC_" + str(pk) + "_SIGNED.pdf"
         file_2_search = "DOC_SIGNED.pdf"
         # there can be more than 1, so use filter and not get  
         assets = OperationAsset.objects.filter(operation = pk, name=file_2_search)
         if assets.count() > 0:
            return Response({'exists':True}, status=status.HTTP_200_OK)
         else:
            return Response({'exists':False}, status=status.HTTP_200_OK)
      #except OperationAsset.DoesNotExist:
      #   return Response({'exists':False}, status=status.HTTP_200_OK)
      except Exception as e:
         print(e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)