##################################################
#  
#  TODO:
#     - LIMIT USER INPUT FIELD SIZE
#
##################################################

from django.shortcuts import render
#from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  
from django.utils import timezone
#from django.db.models import Q
import uuid
#import json


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
#from rest_framework.views import APIView

from designer.serializers import FormSimplex2Serializer
from designer.models import Form
from designer.models import FormAsset
#from designer.models import AssetType
from designer.models import Status

#_status = Status.objects.only('id').get(name='EDITABLE')
#from django.http import HttpResponse

from idrisk.settings import FORM_ASSETS_URL

from designer.files import copyDirectory, removeDirectory

from formsmanager.services import removeAllTempForms



################

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def formsmanager(request):
   """
      Forms manager view.
   """
   context = {}
   context["dataset"] = Form.objects.all()
   return render(request, "formsmanager/formsmanager.html", context)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def use(request):
   """
      Locks a form, by setting its status to IN USE.
      Now the form is ready to be used => no editing possible from now on.

      Body params:
         id (number): Form ID
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         form.updated_by = request.user
         _status = Status.objects.only('id').get(name='IN USE')
         form.status = _status
         form.save()
         serializer = FormSimplex2Serializer(form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, Status.DoesNotExist, FormAsset.DoesNotExist):
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def disable(request):
   """
      Disables a form, by setting its status to DISABLED.

      Body params:
         id (number): Form ID
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         form.date_locked = timezone.now()
         form.locked_by = request.user
         form.updated_by = request.user
         form.disabled_by = request.user
         form.date_disabled = timezone.now()
         _status = Status.objects.only('id').get(name='DISABLED')
         form.status = _status
         form.save()
         serializer = FormSimplex2Serializer(form)
         return Response(serializer.data)
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
def delete(request):
   """
      Deletes a form.
      Only EDITABLE and TEMPORARTY forms can be deleted.
      Returns 403_FORBIDDEN otherwise.

      Body params:
         id (number): Form ID
   """
   if request.method == 'POST':
      try:
         form = Form.objects.get(pk=request.data.get('id'))
         if form.status.name != 'EDITABLE' and form.status.name != 'TEMPORARY':
            return Response(status=status.HTTP_403_FORBIDDEN)  

         form.delete()
         removeDirectory(FORM_ASSETS_URL + str(request.data.get('id')) + '/')
         return Response(data={}, status=status.HTTP_200_OK)
      except Form.DoesNotExist as e:
         print(e)
         # returns ok - it doesn't exists most likely because it was a temporary form that was clean up
         # before this request - example: designer > formsmanager => temporary file may still be listed
         # despite the fact it was already eliminated ... just not in time
         return Response(data={}, status=status.HTTP_202_ACCEPTED)
         #return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)


@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["POST"])
def delete_temps(request):
   """
      Deletes all temporary forms.
   """
   if request.method == 'POST':
      try:
         removeAllTempForms()
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
def clone(request):
   """
      Clones a specific form:
         - generates a unique identifier as its name
         - sets the clone to EDITABLE
         - clones all the assets

      Body params:
         id (number): Form ID
   """
   if request.method == 'POST':
      try:
         # clone the form
         form_2_clone = Form.objects.get(pk=request.data.get('id'))
         _status = Status.objects.only('id').get(name='EDITABLE')   # EDITABLE
         #print(form_2_clone.form)
         cloned_form = Form(name=str(uuid.uuid4()), author=request.user, form = form_2_clone.form, description = form_2_clone.description, status = _status,)
         # if use normal save => call remove unused assets => error because there are not assets yet
         cloned_form.saveClone()
         # change the form id
         form_data = cloned_form.form         
         if form_data:
            form_data['id'] = cloned_form.pk
            cloned_form.saveClone()

         # clone the assets
         # create the asset directory and clone the original assets
         copyDirectory(FORM_ASSETS_URL + str(request.data.get('id')) + '/', FORM_ASSETS_URL + str(cloned_form.pk) + '/')
         # duplicate the assets objects
         assets_2_clone = FormAsset.objects.all().filter(form = request.data.get('id'))
         for asset in assets_2_clone:
            asset.pk = None
            asset.form = cloned_form
            asset.asset.name = asset.asset.name.replace('/' + str(request.data.get('id')) + '/', '/' + str(cloned_form.pk) + '/')
            asset.save()

         serializer = FormSimplex2Serializer(cloned_form)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Form.DoesNotExist, FormAsset.DoesNotExist, Status.DoesNotExist) as e:
         print (e)
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)



@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
@api_view(["GET"])
def forms(request):
   """
      Returns a list of all the forms.
   """
   if request.method == 'GET':
      try:
         forms = Form.objects.all()
         serializer = FormSimplex2Serializer(forms, many=True)         
         return Response(serializer.data, status=status.HTTP_200_OK)
      except Form.DoesNotExist:
         return Response(status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
   else:
      return Response(status=status.HTTP_400_BAD_REQUEST)




