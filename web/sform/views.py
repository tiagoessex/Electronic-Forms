from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from idrisk.settings import PWA_SERVICE_WORKER_PATH, BASE_DIR

@login_required
def sform(request):
   return render(request, "sform/sform.html")

