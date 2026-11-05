from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.register, name='register'),
    path('auth/me/', views.me, name='me'),
    path('monitors/', views.monitor_list, name='monitor_list'),
    path('monitors/<int:pk>/', views.monitor_detail, name='monitor_detail'),
    path('monitors/<int:pk>/checks/', views.monitor_checks, name='monitor_checks'),
    path('incidents/', views.incident_list, name='incident_list'),
    path('alert-channels/', views.alert_channel_list, name='alert_channel_list'),
    path('alert-channels/<int:pk>/', views.alert_channel_detail, name='alert_channel_detail'),

]