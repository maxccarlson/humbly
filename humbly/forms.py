from django import forms
from django.forms import ModelForm, Textarea
from .models import MyRequest

class RequestForm(ModelForm):
    disabled_fields = ('requestNumber','requester')
    


    
    class Meta:
        URGENCY_CHOICES = (
            (1,'1 - Low'),
            (2,'2 - Moderate'),
            (3,'3 - High'),
            (4,'4 - Critical'),
        )
        #urgency = forms.TypedChoiceField(choices=URGENCY_CHOICES, coerce=int)
        model = MyRequest
        fields = '__all__'    
        widgets = {
            'description' : Textarea(attrs={'cols': 80, 'rows': 5}),
            'justification' : Textarea(attrs={'cols': 80, 'rows': 5}),
            'notes' : Textarea(attrs={'cols': 80, 'rows': 5}),
        }
       
    def __init__(self, *args, **kwargs):
        super(RequestForm, self).__init__(*args, **kwargs)   
        for field in self.disabled_fields:
            self.fields[field].disabled = True