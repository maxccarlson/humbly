from django.shortcuts import render
from django.contrib.auth.models import User, Group
from django import template
from .forms import RequestForm

register = template.Library()

# Create your views here.
def create(request):
    if request.method == 'POST':
        form = RequestForm(request.POST)
        if form.is_valid():
            form.save()
            return
    else:
        form = RequestForm(initial={"requestNumber": 0,
                                    "requester": request.user.username,
                                    "price": 0.00,
                                    "urgency": 1,
                                    "state": "Pending"})
        form.fields['state'].disabled = True
        
        #if form.fields['urgency'] > 2:
        #    form.fields['justification'].disabled = True
    
        
    return render(request, 'create.html', {'form': form})

def view(request):    
    return render(request, 'view.html')

