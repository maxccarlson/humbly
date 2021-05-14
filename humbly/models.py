from django.db import models
from django.utils.safestring import mark_safe

# Create your models here.

STATE_CHOICES = (
    ('pending','Pending'),
    ('approved','Approved'),
    ('denied','Denied'),
)

class Urgency(models.IntegerChoices):
    low = (1,'LOW')
    moderate = (2,'MODERATE')
    high = (3,'HIGH')
    critical = (4,'CRITITCAL')


class MyRequest(models.Model):
    requestNumber = models.IntegerField()
    state = models.CharField(max_length=10, choices=STATE_CHOICES, default='pending')
    requester = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    urgency = models.PositiveSmallIntegerField(choices=Urgency.choices, default=1)
    justification = models.CharField(max_length=500)
    notes = models.CharField(max_length=1000)
    
    def __int__(self):
        return self.requestNumber
    

