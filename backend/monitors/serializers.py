from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Monitor, Check, Incident, AlertChannel

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class MonitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Monitor
        fields = [
            'id', 'name', 'url', 'interval_minutes', 'is_active',
            'current_status', 'last_checked_at', 'created_at',
        ]
        read_only_fields = ['current_status', 'last_checked_at', 'created_at']

class CheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Check
        fields = ['id', 'monitor', 'timestamp', 'status', 'response_time_ms', 'status_code']

class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['id', 'monitor', 'started_at', 'resolved_at', 'cause']

class AlertChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertChannel
        fields = ['id', 'type', 'target', 'is_enabled']