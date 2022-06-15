from django.shortcuts import render
#from django.shortcuts import render_to_response


def handler404(request, *args, **argv):
    return render(request,'error_pages/404.html', status=404)


def handler500(request, *args, **argv):
    return render(request,'error_pages/500.html', status=500)