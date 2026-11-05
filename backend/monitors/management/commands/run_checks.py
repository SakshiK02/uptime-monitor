from django.core.management.base import BaseCommand
from django.utils import timezone
from monitors.models import Monitor
from monitors.checker import check_monitor


class Command(BaseCommand):
    help = 'Checks every active monitor that is due for a ping'

    def handle(self, *args, **options):
        monitors = Monitor.objects.filter(is_active=True)
        checked_count = 0

        for monitor in monitors:
            due = (
                monitor.last_checked_at is None
                or (timezone.now() - monitor.last_checked_at).total_seconds() >= monitor.interval_minutes * 60
            )
            if due:
                check_monitor(monitor)
                checked_count += 1

        self.stdout.write(self.style.SUCCESS(f'Checked {checked_count} of {monitors.count()} active monitors'))
