from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),

    path('send-order/', views.send_order, name='send_order'),
    path('set-price/', views.set_price, name='set_price'),
    # path('pay/', views.pay, name='pay'),
    # path('cancel/', views.cancel, name='cancel'),
    # path('mark-delivered/', views.mark_delivered, name='mark_delivered'),

]