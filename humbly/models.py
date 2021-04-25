from django.db import models
from django.utils.safestring import mark_safe

# Create your models here.

STATE_CHOICES = (
    ('pending','Pending'),
    ('approved','Approved'),
    ('denied','Denied'),
)

URGENCY_CHOICES = (
    (1,'1 - Low'),
    (2,'2 - Moderate'),
    (3,'3 - High'),
    (4,'4 - Critical'),
)

class MyRequest(models.Model):
    requestNumber = models.IntegerField()
    state = models.CharField(max_length=10, choices=STATE_CHOICES, default='pending')
    requester = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    urgency = models.IntegerField(choices=URGENCY_CHOICES, default=1)
    justification = models.CharField(max_length=500)
    notes = models.CharField(max_length=1000)
    
    def __int__(self):
        return self.requestNumber
    

