import logging

import requests

logger = logging.getLogger(__name__)


def notify_incident(monitor, incident, event):
    channels = monitor.user.alert_channels.filter(type='ntfy', is_enabled=True)

    if event == 'opened':
        message = f'🔴 {monitor.name} ({monitor.url}) is DOWN. Cause: {incident.cause}'
        title = f'{monitor.name} is down'
    else:
        message = f'✅ {monitor.name} ({monitor.url}) is back UP.'
        title = f'{monitor.name} recovered'

    for channel in channels:
        try:
            response = requests.post(
                f'https://ntfy.sh/{channel.target}',
                data=message.encode('utf-8'),
                # HTTP headers must be latin-1; the emoji lives in the body only.
                headers={'Title': title.encode('utf-8')},
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            # A failing alert must never break the monitoring run.
            logger.warning(
                'ntfy alert failed for monitor=%s channel=%s: %s',
                monitor.pk, channel.pk, exc,
            )
