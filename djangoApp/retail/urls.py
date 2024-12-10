from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),

    path('send-order/', views.send_order, name='send_order'),
    path('get-events/', views.get_order_events, name='get_events'),
]