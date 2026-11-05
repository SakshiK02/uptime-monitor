from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class Monitor(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='monitors')
    name = models.CharField(max_length=100)
    url = models.URLField()
    interval_minutes = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    current_status = models.CharField(
        max_length=10,
        choices=[('up', 'Up'), ('down', 'Down'), ('pending', 'Pending')],
        default='pending',
    )
    last_checked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Check(models.Model):
    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='checks')
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=4, choices=[('up', 'Up'), ('down', 'Down')])
    response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']


class Incident(models.Model):
    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='incidents')
    started_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    cause = models.CharField(max_length=200)

    class Meta:
        ordering = ['-started_at']


class AlertChannel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alert_channels')
    type = models.CharField(max_length=10, choices=[('email', 'Email'), ('telegram', 'Telegram'), ('ntfy', 'Ntfy')])
    target = models.CharField(max_length=200)
    is_enabled = models.BooleanField(default=True)
