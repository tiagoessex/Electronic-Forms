from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  

# Create your views here.

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def editview(request, operation_id):
   """
     Opens a view to edit/view a specific operation.

     Params:
         pk (number): Operation ID
   """
   return render(request,'opeditview/opeditview.html', context = {'operation_id': operation_id})


