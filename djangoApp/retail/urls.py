from django.urls import path
from . import views

urlpatterns = [
    path('', views.retailer, name='retailer'),
    path('manufacturer', views.manufacturer, name='manufacturer'),
    path('courier', views.courier, name="courier"),

    path('send-order/', views.send_order, name='send_order'),
    path('get-events/', views.get_order_events, name='get_events'),
]