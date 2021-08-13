from rest_framework import serializers
from .models import MyRequest

class HumblySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyRequest
        fields = ('requestNumber', 'state', 'requester', 'description' ,'price','urgency','justification','notes')