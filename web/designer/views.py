import uuid

from django.shortcuts import render
#from django.http import JsonResponse
#from django.db import connections
#from django.db import connection
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponse #, Http404
import os
#import re 

from designer.serializers import FormSerializer
from designer.serializers import FormSimplexSerializer
from designer.serializers import FormSimplex2Serializer
from designer.serializers import FormAssetSerializer
from designer.serializers import QuerySerializer

from designer.models import Form
from designer.models import FormAsset
from designer.models import AssetType
from designer.models import Query
from designer.models import Status

from idrisk.settings import FORM_ASSETS_DIR#,MEDIA_URL


from designer.databases import getDBAndTables, getDBTableColumnsInfo, getDBTables
from designer.databases import getDBColumns, getDBColumnValues, getDBs, getDBsInfo
from designer.tables import csv_to_json, get_columns, get_column_values
#from designer.utils import dictfetchall, get_key
from designer.files import removeDirectory


# Create your views here.


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def designer(request):
   """
      View to Create/Edit a form.
   """   
   return render(request,'designer/designer.html')#, context = {'form_id': 999})


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def designerID(request, form_id):
   """
      View to Open a specific form.
   """
   return render(request,'designer/designer.html', context = {'form_id': form_id})




@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def change(request):
   """
      Updates the form's status, name and description.
      If the form status is not (EDITABLE | TEMPORARY) then 403_FORBIDDEN

      Body params:
         id (number): Form ID
         name (string): Form name
         description (string): Form description
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         if form.status.name != 'EDITABLE' and form.status.name != 'TEMPORARY':
            # NOT EDITABLE|TEMP => CANNOT EDIT => CANNOT SAVE
            return Response(status=status.HTTP_403_FORBIDDEN)         
         form.name = request.data.get('name')
         form.description = request.data.get('description')
         form.updated_by = request.user         
         form.status = Status.objects.only('id').get(name='EDITABLE')
         form.save()
         serializer = FormSimplex2Serializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def check_name(request):
   """
      Checks if a form with a specific name already exists.
      If yes then returns a CONFLICT message else OK.

      Body params:
         id (number): Form ID
         name (string): Form name

      Returns:
         {'status': 666, 'result': 'CONFLICT'}

         {'status': 200, 'result': 'OK'}
   """
   if request.method == 'POST':
      try:
         forms = Form.objects.filter(~Q(id=request.data.get('id')) & Q(name = request.data.get('name')))
         if forms.count() > 0:
            data = {'status': 666, 'result': 'CONFLICT'}
         else: 
            data = {'status': 200, 'result': 'OK'}
         print(data)
         return Response(data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def new_form(request):
   """
      Creates a new Form and set its status as TEMPORARY.
      If a name is not given, then it will automatically create an universally unique identifier.

      Body params:
         name (string): Form name [optional]
   """
   if request.method == 'POST':
      try:
         if 'name' in request.data:
            name = request.data.get('name')
         else:
            name = str(uuid.uuid4())
         _status = Status.objects.only('id').get(name='TEMPORARY')
         form = Form(name=name, author=request.user, updated_by = request.user, status = _status)
         form.save()
         serializer = FormSimplex2Serializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def save(request):
   """
      Saves a form and change its status as well, if necessary, to EDITABLE.
      If the form status is not (EDITABLE | TEMPORARY) then 403_FORBIDDEN

      Body params:
         id (number): Form ID
         form (object): Form data
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         if form.status.name != 'EDITABLE' and form.status.name != 'TEMPORARY':
            # NOT EDITABLE|TEMP => CANNOT EDIT => CANNOT SAVE
            return Response(status=status.HTTP_403_FORBIDDEN)  
         form.form = request.data.get('form')
         form.updated_by = request.user
         form.status = Status.objects.only('id').get(name='EDITABLE')
         form.save()
         serializer = FormSimplex2Serializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def editable_forms(request):
   """
      Lists all EDITABLE forms (status = EDITABLE | TEMPORARY).
   """
   if request.method == 'GET':
      try:
         forms = Form.objects.all().filter(Q(status__name = 'EDITABLE') | Q(status__name = 'TEMPORARY'))
         serializer = FormSimplexSerializer(forms, many=True)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@api_view(["POST"])
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def upload_form_asset(request):
   """
      Uploads an asset to the media directory.
      The directory should be /media/form_assets/{form_id}/.
      
      Body params:
         id (number): Form ID
         type (string): Asset type (IMAGE | CSV | PDF | ...)
         name (string): Asset name
         FILES['asset-file'] (FILE | object): Asset data
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         asset_type = AssetType.objects.only('id').get(name=request.data.get('type'))
         asset = FormAsset(name=request.data.get('name'), type=asset_type, asset=request.FILES['asset-file'], form=form )
         asset.save()
         serializer = FormAssetSerializer(asset)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, FormAsset.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_form(request, pk):
   """
      Gets a specific form.

      Params:
         pk (number): Form ID
   """
   if request.method == 'GET':
      try:
         form = Form.objects.get(id=pk)
         serializer = FormSerializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_editable_form(request, pk):
   """
      Gets a specific editable form (status = EDITABLE | TEMPORARY).

      Params:
         pk (number): Form ID
   """
   if request.method == 'GET':
      try:
         form = Form.objects.get(Q(id=pk) & (Q(status__name = 'EDITABLE') | Q(status__name = 'TEMPORARY')))         
         serializer = FormSerializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def list_form_assets(request, pk, name=None):
   """
      Lists all assets or all assets of a specific type of a specific form.

      Params:
         pk (number): Form ID
         name (string): Asset type (IMAGE | CSV | PDF | ...)
   """
   if request.method == 'GET':
      try:
         if (name):
            assets = FormAsset.objects.all().filter(form = pk, type__name=name)
         else:
            assets = FormAsset.objects.all().filter(form = pk)
         serializer = FormAssetSerializer(assets, many=True)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except FormAsset.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def form_content(request, pk):
   """
      Returns the form contents (no id, name, description, ...).

      Params:
         pk (number): Form ID
   """
   if request.method == 'GET':
      try:
         form = Form.objects.get(id=pk)
         return Response(form.form, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def delete_temp(request):
   """
      Deletes a temporary form, deletes all its assets and their directory.

      Body params:
         pk (number): Form ID
   """
   if request.method == 'POST':
      try:
         #_status = Status.objects.only('id').get(name='TEMPORARY')
         #Form.objects.filter(pk=request.data.get('id'), status = _status).delete()         
         Form.objects.filter(pk=request.data.get('id'), status__name = 'TEMPORARY').delete()
         removeDirectory('media/form_assets/' + str(request.data.get('id')) + '/')
         # for now return nothing
         return Response(data={}, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def remove_form_asset(request):
   '''
      Removes form assets, identified by an array of IDs or full relative names.

      Body params:
         id (array of number): Assets IDs
         name (array of strings): Assets names

   '''
   if request.method == 'POST':
      try:
         if 'id' in request.data:            
            for id in request.data.get('id'):
               FormAsset.objects.filter(pk=id).delete()
         if 'name' in request.data:
            for name in request.data.get('name'):
               #filename = name.replace(MEDIA_URL,'')
               filename = FORM_ASSETS_DIR + str(request.data.get('extras')) + '/' + name
               FormAsset.objects.get(asset=filename).delete()
               #FormAsset.objects.get(pk=asset.id).delete()
         return Response(data={}, status=status.HTTP_200_OK)
      except FormAsset.DoesNotExist as e:
         print(e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def download(request, pk):
   """
      Downloads an asset.

      Params:
         pk (number): Asset ID
   """
   if request.method == 'GET':
      try:   
         asset = FormAsset.objects.filter(pk=pk)
         data = list(asset.values())
         if len(data) > 0:
            path = os.path.join(settings.MEDIA_ROOT, data[0]['asset'])
            if os.path.exists(path):
               with open(path, 'rb') as myfile:
                  response = HttpResponse(myfile.read()) #, content_type='text/csv')
                  response['Content-Disposition'] = 'attachment; filename=' + data[0]['name']
                  return response
         return Response(status=status.HTTP_404_NOT_FOUND)  
      except FormAsset.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


################
# TABLES - csv #
################

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_table(request, form, table):
   """
      Gets the contents of a CSV file as a json object.

      Params:
         form (number): Form ID
         table (string): Table/Asset name
   """
   if request.method == 'GET':
      try:
         _table = settings.FORM_ASSETS_DIR + str(form) + '/' +  table
         path = os.path.join(settings.MEDIA_ROOT, _table)
         if os.path.exists(path):
            return Response(data=csv_to_json(path), status=status.HTTP_200_OK)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_table_columns(request, form, table):
   """
      Given the id of an table (asset) returns all columns of the table.

      Params:
         form (number): Form ID
         table (string): Table/Asset name
   """
   if request.method == 'GET':
      try:
         _table = settings.FORM_ASSETS_DIR + str(form) + '/' +  table
         path = os.path.join(settings.MEDIA_ROOT, _table)
         if os.path.exists(path):            
            return Response(data=get_columns(path), status=status.HTTP_200_OK)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_table_column(request, form, table, column):
   '''
      Gets a list of all values of a specific column of a CSV table.

      Params:
         form (number): Form ID
         table (string): Table/Asset name      
         column (string): Column name
   '''
   if request.method == 'GET':
      try:
         _table = settings.FORM_ASSETS_DIR + str(form) + '/' +  table
         path = os.path.join(settings.MEDIA_ROOT, _table)      
         if os.path.exists(path):
            return Response(data=get_column_values(path, column), status=status.HTTP_200_OK)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


#############
# DATABASES #
#############


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_databases(request):
   """
      Returns a list of all databases the server is connected to and some info about them.
   """
   if request.method == 'GET':
      try:
         databases = getDBsInfo()
         return Response(databases, status=status.HTTP_200_OK)
      except Exception as e:
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)         
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def db_tables(request):
   """
      Returns a json with all databases elements that can be created from and their respective tables.
   """
   if request.method == 'GET':
      try:
         data = getDBAndTables()
         return Response(data, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def db_table_columns(request):
   """
      Returns the columns and their properties (type, size, ...) of a specific table and database.
      
      Body params:
         database (string): Database name
         table (string): Table name
   """
   if request.method == 'GET':
      try:
         if 'database' in request.GET and 'table' in request.GET:
            database = request.GET.get('database')
            table = request.GET.get('table')
         else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

         data = getDBTableColumnsInfo(database, table)
         return Response(data, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_dbs(request):
   """
      Returns a list with the name of all databases that elements can be created from, as defined in settings.py.
   """
   if request.method == 'GET':
      try:
         databases = getDBs()
         return Response(databases, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_db_tables(request, db):
   """
      Returns a list of all tables in a specific database where elements and data can be extracted from.

      Params:
         db (string): Database name
   """
   if request.method == 'GET':
      try:
         tables = getDBTables(db)
         return Response(tables, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_db_table_cols(request, db, table):
   """
      Returns a list of all columns/fields of a specific table of a specific database where 
      elements and data can be extracted from.

      Params:
         db (string): Database name
         table (string): Table name
   """
   if request.method == 'GET':
      try:
         columns = getDBColumns(db, table)
         return Response(columns, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_db_table_col(request, db, table, column):
   """
      Returns all the values of a columns of table of database where elements and data can be extracted from.

      Params:
         db (string): Database name
         table (string): Table name
         column (string): Column name
   """
   if request.method == 'GET':
      try:
         values = getDBColumnValues(db, table, column)
         return Response(values, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def get_db_table_col_unique(request, db, table, column):
   """
      Returns all the unique values of a columns of table of database where elements and data can be extracted from.

      Params:
         db (string): Database name
         table (string): Table name
         column (string): Column name
   """
   if request.method == 'GET':
      try:
         values = getDBColumnValues(db, table, column, True)
         return Response(values, status=status.HTTP_200_OK)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def list_queries(request):
   """
      Returns all LOCKED queries.
   """
   if request.method == 'GET':
      try:
         queries = Query.objects.filter(status__name='LOCKED')
         serializer = QuerySerializer(queries, many=True)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Query.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

