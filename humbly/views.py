from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User, Group
from django import template
from rest_framework import viewsets
from .forms import RequestForm
from .models import MyRequest
from .serializers import HumblySerializer

register = template.Library()

# Create your views here.

class viewView(viewsets.ModelViewSet):
    serializer_class = HumblySerializer
    queryset = MyRequest.objects.all()

def create(request):       
        
    if request.method == 'POST':
        form = RequestForm(request.POST)       
        if form.is_valid():
            form.save()
            return redirect('view')


    else:
        form = RequestForm(initial={"requestNumber": 0,
                                    "requester": request.user.username,
                                    "price": 0.00,
                                    "urgency": 1,
                                    "state": "Pending"})                
        
    return render(request, 'create.html', {'form': form})


def view(request):    
    myRequests = MyRequest.objects.filter(requester=request.user.username)
    allRequests = MyRequest.objects.all()

    if request.user.groups.filter(name='Approver').exists():
        myList = allRequests
    else:
        myList = myRequests

    context = {'myList': myList}
    return render(request, 'view.html', context)
