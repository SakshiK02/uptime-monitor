from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import RegisterSerializer, MonitorSerializer, CheckSerializer, IncidentSerializer, Incident, AlertChannelSerializer,  AlertChannel
from .models import Monitor
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.utils import timezone


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'ok'})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)

@api_view(['GET'])
def me(request):
    user = request.user
    return Response({
        'id': str(user.id),
        'username': user.username,
        'email': user.email,
    })

@api_view(['GET', 'POST'])
def monitor_list(request):
    if request.method == 'GET':
        monitors = Monitor.objects.filter(user=request.user)
        serializer = MonitorSerializer(monitors, many=True)
        return Response(serializer.data)

    serializer = MonitorSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=201)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def monitor_detail(request, pk):
    monitor = get_object_or_404(Monitor, pk=pk, user=request.user)

    if request.method == 'GET':
        return Response(MonitorSerializer(monitor).data)

    if request.method == 'DELETE':
        monitor.delete()
        return Response(status=204)

    serializer = MonitorSerializer(
        monitor, data=request.data, partial=(request.method == 'PATCH')
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(['GET'])
def monitor_checks(request, pk):
    monitor = get_object_or_404(Monitor, pk=pk, user=request.user)
    hours = int(request.query_params.get('hours', 24))
    since = timezone.now() - timedelta(hours=hours)
    checks = monitor.checks.filter(timestamp__gte=since)
    return Response(CheckSerializer(checks, many=True).data)

@api_view(['GET'])
def incident_list(request):
    incidents = Incident.objects.filter(monitor__user=request.user)

    monitor_id = request.query_params.get('monitor')
    if monitor_id:
        incidents = incidents.filter(monitor_id=monitor_id)

    return Response(IncidentSerializer(incidents, many=True).data)

@api_view(['GET', 'POST'])
def alert_channel_list(request):
    if request.method == 'GET':
        channels = AlertChannel.objects.filter(user=request.user)
        return Response(AlertChannelSerializer(channels, many=True).data)

    serializer = AlertChannelSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
def alert_channel_detail(request, pk):
    channel = get_object_or_404(AlertChannel, pk=pk, user=request.user)
    channel.delete()
    return Response(status=204)
