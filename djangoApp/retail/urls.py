from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),

    path('send-order/', views.send_order, name='send_order'),
    path('set-price/', views.set_price, name='set_price'),
    path('cancel/', views.cancel_order, name='cancel_order'),
    # path('pay/', views.pay, name='pay'),
    # path('mark-delivered/', views.mark_delivered, name='mark_delivered'),

]