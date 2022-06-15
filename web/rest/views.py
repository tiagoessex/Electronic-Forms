from django.utils import timezone
from collections import namedtuple

from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from designer.models import Form
from designer.models import Status

from operations.models import Operation
from operations.models import OperationData
from operations.models import OperationAsset


from operations.serializers import OperationSerializer
from operations.serializers import OperationDataSerializer
from operations.serializers import OperationFormDataSerializer
from operations.serializers import OperationAssetSerializer

from idrisk.settings import OPERATION_ASSETS_URL

from operations.services import validateInputs, OpFormData
from designer.files import removeDirectory



class CustomAuthToken(ObtainAuthToken):
   """
      Generate an access token.

      Body params:
         username (string): Username
         password (string): Password
      
      Returns:
         token (string): Security token associated with the credentials user 
         user_id (number): User ID
         email (string): User email

   """
   def post(self, request, *args, **kwargs):
      serializer = self.serializer_class(data=request.data,context={'request': request})
      serializer.is_valid(raise_exception=True)        
      user = serializer.validated_data['user']
      if user.groups.filter(name = 'manager').exists():
         token, created = Token.objects.get_or_create(user=user)
         return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
         }, status=status.HTTP_200_OK)
      else:
         return Response ({'message':'You do not have permission to generate a token'}, status=status.HTTP_401_UNAUTHORIZED)



class ListOperations(generics.ListCreateAPIView):
   """
      Returns a list of all operations, regardless of the status and user.
      
      Returns:
         Array of operations
   """
   authentication_classes = [TokenAuthentication]
   #permission_classes = [IsAuthenticated]   
   queryset = Operation.objects.all()    
   serializer_class = OperationSerializer
   http_method_names = ['get']


class ListNonCompletedOperations(generics.ListCreateAPIView):
   """
      Returns all non CLOSED operations, so all (OPEN, CLOSED) for the current user.

      Returns:
         Array of operations
   """
   authentication_classes = [TokenAuthentication]
   queryset = Operation.objects.exclude(status__name='COMPLETED')
   serializer_class = OperationSerializer
   http_method_names = ['get']




class GetOperation(generics.ListCreateAPIView):
   """
      Returns a specific operation.
      
      Params:
         pk (number): Operation ID

      Returns:
         Operation or []
   """
   authentication_classes = [TokenAuthentication]
   serializer_class = OperationSerializer
   http_method_names = ['get']
   def get_queryset(self):
      query_set = Operation.objects.filter(pk = self.kwargs['pk'])
      return query_set    



class GetOperationData(generics.ListCreateAPIView):
   """
      Returns the data of a specific operation.
      If an operation has no data, returns an empty object [].

      Params:
         pk (number): Operation ID

      Returns:
         Operation data or []
   """
   authentication_classes = [TokenAuthentication]
   serializer_class = OperationDataSerializer
   http_method_names = ['get']
   def get_queryset(self):
      query_set = OperationData.objects.filter(operation = self.kwargs['pk'])
      return query_set


class GetOperationFormData(generics.GenericAPIView):
   """
      Returns all the data of a specific operation and its respective form (only id, name and form).
      Ex: field_id, value, dastabase_field.

      Params:
         pk (number): Operation ID

      Returns:
         Form and Operation data
   """
   def get(self, request, *args, **kwargs):
      try:
         query_set1 = OperationData.objects.get(operation = self.kwargs['pk'])
         query_set2 = Operation.objects.only('id').get(pk = self.kwargs['pk'])     
         form_id = query_set2.form_id
         query_set3 = Form.objects.get(pk=form_id)
         Data = namedtuple('Data', ('form', 'data'))
         query_set = Data(form= query_set3, data= query_set1)
         return Response(OperationFormDataSerializer(query_set).data)
      except (Operation.DoesNotExist, OperationData.DoesNotExist, Form.DoesNotExist):
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

class ValidateOperationInputs(generics.GenericAPIView):
   """
      Validates the inputs of an operation. 

      Params:
         pk (number): Operation ID

      Returns:
         The result of the validation process.

         {
         'elements': [[{element_id, [error_messages], [warning_messages]}], ...], 
         'groups': [[{group_id, [error_messages], [warning_messages]}], ...]
         }
   """
   def get(self, request, *args, **kwargs):
      try:
         data = validateInputs(self.kwargs['pk'])
         return Response(data)
      except (Operation.DoesNotExist, OperationData.DoesNotExist, Form.DoesNotExist):
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

class GetFormOperationDataValidations(generics.GenericAPIView):
   """
      Returns all relevant data from the form (id, name, label, database field, type) 
      and operations (input data, status, visibility) 
      and includes all validations associated with each field.

      Radios and checkpoints are in their respective groups, and validations are
      associated with the group itself and not its individual elements.

      Params:
         pk (number): Operation ID

      Returns:
         An array of elements and groups with identifiying each editable element and the validations to apply
         to each one of them.
   """
   def get(self, request, *args, **kwargs):
      try:
         data = OpFormData(self.kwargs['pk'])
         return Response(data)
      except TypeError:
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except (Operation.DoesNotExist, OperationData.DoesNotExist, Form.DoesNotExist):
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print (e)
         return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

class DeleteOperation(generics.GenericAPIView):
   """
      Deletes a non COMPLETED operation.

      Body params:
         operation_id (number): Operation ID
      
      Returns:
         []
   """
   def post(self, request, format=None):
      try:
         if 'operation_id' not in request.data:            
            raise ValueError
         operation_id = request.data.get('operation_id')
         #operation = Operation(pk=operation_id)
         operation = Operation.objects.get(pk=operation_id)

         if operation.status.name == 'COMPLETED':
            return Response([], status=status.HTTP_403_FORBIDDEN)

         operation.delete()
         removeDirectory(OPERATION_ASSETS_URL + str(operation_id) + '/')
         return Response([], status=status.HTTP_200_OK)
      except Operation.DoesNotExist:
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except ValueError:
         return Response([], status=status.HTTP_400_BAD_REQUEST)
      except Exception as e:
         print (e)
         return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)  



class SetOperationStatus(generics.GenericAPIView):
   """
      Sets the operation status of a non COMPLETED OPERATION.

      Body params:
         operation_id (number): Operation ID
         status (string): New operation status ('CLOSED' | 'OPEN' |'COMPLETED')
      
      Returns:
         Updated operation
   """
   def post(self, request, format=None):
      try:
         if 'operation_id' not in request.data or 'status' not in request.data:
            raise ValueError
         operation_id = request.data.get('operation_id')
         _status = request.data.get('status')
         if _status not in ['CLOSED','OPEN','COMPLETED']:
            raise ValueError

         #if (_status == 'CLOSED'):
         #   try:
         #      removeUnusedAssets(operation_id)
         #   except OperationData.DoesNotExist:
         #      print("Operation [" + str(operation_id) + "] has no data!")

         # ----------- SET NEW OPERATION STATUS --------------
         operation = Operation.objects.get(pk=operation_id)

         if operation.status.name == 'COMPLETED':
            return Response([], status=status.HTTP_403_FORBIDDEN)

         operation.date_updated = timezone.now()
         operation.updated_by = request.user
         operation_status = Status.objects.only('id').get(name=_status)
         operation.status = operation_status
         operation.save()
         serializer = OperationSerializer(operation)
         return Response(serializer.data, status=status.HTTP_200_OK)
      except (Operation.DoesNotExist, Status.DoesNotExist, OperationAsset.DoesNotExist):
         return Response([], status=status.HTTP_404_NOT_FOUND)
      except ValueError:
         return Response([], status=status.HTTP_400_BAD_REQUEST)
      except Exception as e:
         print (e)
         return Response([], status=status.HTTP_500_INTERNAL_SERVER_ERROR)  




class ListOperationAssets(generics.ListCreateAPIView):
   """
      Returns a list of all annexes of a certain operation.

      Params:
         pk (number): Operation ID

      Returns:
         An array of objects listing all annexes and their properties.
   """
   authentication_classes = [TokenAuthentication]
   serializer_class = OperationAssetSerializer
   http_method_names = ['get']
   def get_queryset(self):
      query_set = OperationAsset.objects.all().filter(operation = self.kwargs['pk'])
      return query_set   

 