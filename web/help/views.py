from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test  

# Create your views here.

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def api(request):
   """API help."""   
   return render(request,'help/api.html')

@login_required
@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
def examples(request):
   """EXAMPLES help."""   
   return render(request,'help/examples.html')


@login_required
def videos(request):
   """VIDEOS help."""   
   return render(request,'help/videos.html')



#@login_required
#def help(request):
#   """Help."""   
#   return render(request,'help/help.html')


#@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
#def designer(request):
#   """Designer help."""   
#   return render(request,'help/designer.html')

#@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
#def manager(request):
#   """Manager help."""   
#   return render(request,'help/manager.html')

#@login_required
#def app(request):
#   """App help."""   
#   return render(request,'help/app.html')

#@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
#def operations(request):
#   """Operations manager help."""   
#   return render(request,'help/operations.html')



#@login_required
#@user_passes_test(lambda u: u.groups.filter(name='manager').exists())
#def faq(request):
#   """FAQ help."""   
#   return render(request,'help/faq.html')


