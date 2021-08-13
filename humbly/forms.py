from django import forms
from django.forms import ModelForm, Textarea
from .models import MyRequest

class RequestForm(ModelForm):        
    #disabled_fields = ('requestNumber','requester','state')

    class Meta:
        model = MyRequest
        fields = '__all__'   
        #exclude = ('requestNumber','requester','state',) 
        widgets = {
            'description' : Textarea(attrs={'cols': 80, 'rows': 5}),
            'justification' : Textarea(attrs={'cols': 80, 'rows': 5}),
            'notes' : Textarea(attrs={'cols': 80, 'rows': 5}),
        }
       

    def __init__(self, *args, **kwargs):                
        super(RequestForm, self).__init__(*args, **kwargs)                   
        #for field in self.disabled_fields:
        #    self.fields[field].disabled = True
    