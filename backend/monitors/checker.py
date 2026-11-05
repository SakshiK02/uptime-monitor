import time

import requests
from django.utils import timezone

from .models import Check, Incident
from .alerts import notify_incident


def check_monitor(monitor):
    start = time.perf_counter()
    cause = ''
    try:
        response = requests.get(monitor.url, timeout=10)
        response_time_ms = int((time.perf_counter() - start) * 1000)
        status_code = response.status_code
        status = 'up' if status_code < 400 else 'down'
        if status == 'down':
            cause = f'HTTP {status_code}'
    except requests.RequestException as e:
        response_time_ms = None
        status_code = None
        status = 'down'
        cause = type(e).__name__

    check = Check.objects.create(
        monitor=monitor,
        status=status,
        response_time_ms=response_time_ms,
        status_code=status_code,
    )

    monitor.current_status = status
    monitor.last_checked_at = timezone.now()
    monitor.save()

    open_incident = Incident.objects.filter(
        monitor=monitor, resolved_at__isnull=True
    ).first()

    if status == 'down' and open_incident is None:
        incident = Incident.objects.create(monitor=monitor, cause=cause)
        notify_incident(monitor, incident, event='opened')
    elif status == 'up' and open_incident is not None:
        open_incident.resolved_at = timezone.now()
        open_incident.save()
        notify_incident(monitor, open_incident, event='resolved')

    return check
