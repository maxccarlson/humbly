from django.db import models

# Create your models here.

class MyRequest(models.Model):
    reqNo = models.IntegerField()
    state = models.CharField(max_length=20)
    requester = models.CharField(max_length=100)
    desc = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    urgency = models.IntegerField()
    justification = models.CharField(max_length=500)
    notes = models.CharField(max_length=1000)
    
    def __int__(self):
        return self.reqNo
    

