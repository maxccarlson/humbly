from django.forms import ModelForm
from .models import MyRequest

class RequestForm(ModelForm):
    class Meta:
        model = MyRequest
        fields = '__all__'