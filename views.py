from django.shortcuts import render, redirect
from django.contrib.auth.models import User, Group
from django import template
from .forms import RequestForm
from .models import MyRequest

register = template.Library()

# Create your views here.
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
        
        #if form.fields['urgency'].get_urgency_display > 2:
        #    form.fields['justification'].disabled = True
        form.fields['urgency'].widget.attrs['onchange'] = 'check_justification()'
        
        
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
