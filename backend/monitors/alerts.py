import requests


def notify_incident(monitor, incident, event):
    channels = monitor.user.alert_channels.filter(type='ntfy', is_enabled=True)

    if event == 'opened':
        message = f'🔴 {monitor.name} ({monitor.url}) is DOWN. Cause: {incident.cause}'
        title = f'{monitor.name} is down'
    else:
        message = f'✅ {monitor.name} ({monitor.url}) is back UP.'
        title = f'{monitor.name} recovered'

    for channel in channels:
        requests.post(
            f'https://ntfy.sh/{channel.target}',
            data=message.encode('utf-8'),
            headers={'Title': title},
        )
