from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  


# Create your views here.

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def previewID(request, form_id):
   """Preview a specific form."""
   return render(request,'preview/preview.html', context = {'form_id': form_id})




