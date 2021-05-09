from django.contrib import admin
from humbly.models import MyRequest

# Register your models here.

class RequestAdmin(admin.ModelAdmin):
    list_display= ('requestNumber', 'state', 'requester', 'description', 'price', 'urgency', 'justification', 'notes')
    
  
admin.site.register(MyRequest, RequestAdmin)