"""
System behavior monitoring agent.

This script gathers host telemetry using psutil and posts it to the Flask
system_status endpoint every 10 seconds.
"""

import socket
import time
from datetime import datetime, timezone

import psutil
import requests


API_URL = "http://127.0.0.1:5000/system-status"
SEND_INTERVAL_SECONDS = 10


def utc_now_isoformat():
    """Return a UTC ISO-8601 timestamp compatible with the Flask API."""
    return datetime.now(timezone.utc).isoformat()


def get_cpu_usage():
    """Return CPU usage percentage."""
    return psutil.cpu_percent(interval=None)


def get_ram_usage():
    """Return memory usage percentage."""
    memory = psutil.virtual_memory()
    return memory.percent


def get_disk_usage():
    """Return disk usage percentage."""
    disk = psutil.disk_usage('/')
    return disk.percent


def get_process_count():
    """Return number of running processes."""
    return len(psutil.pids())


def get_network_connections():
    """Return number of active/internet connections."""
    try:
        connections = psutil.net_connections(kind='inet')
        return len(connections)
    except (psutil.AccessDenied, OSError):
        return 0


def collect_system_status():
    """Collect telemetry into the exact JSON shape required by the API."""
    telemetry = {
        "timestamp": utc_now_isoformat(),
        "hostname": socket.gethostname(),
        "cpu_usage": get_cpu_usage(),
        "memory_usage": get_ram_usage(),
        "disk_usage": get_disk_usage(),
        "process_count": get_process_count(),
        "network_connections": get_network_connections(),
    }
    return telemetry


def send_telemetry(payload):
    """Send a telemetry payload to the Flask system-status endpoint."""
    try:
        response = requests.post(API_URL, json=payload, timeout=5)
        response.raise_for_status()
        return True, response.json()
    except requests.exceptions.RequestException as exc:
        return False, str(exc)


def main():
    """Continuously send telemetry until the user presses Ctrl+C."""
    print("[INFO] System monitor agent started. Press Ctrl+C to stop.")

    try:
        while True:
            telemetry = collect_system_status()

            success, result = send_telemetry(telemetry)

            if success:
                print(
                    "[OK] Host: {hostname} | CPU: {cpu}% | RAM: {ram}% | "
                    "Processes: {processes} | Connections: {connections}".format(
                        hostname=telemetry["hostname"],
                        cpu=int(round(telemetry["cpu_usage"])),
                        ram=int(round(telemetry["memory_usage"])),
                        processes=telemetry["process_count"],
                        connections=telemetry["network_connections"],
                    )
                )
            else:
                print(
                    "[WARN] Could not reach Flask API at {}. "
                    "Retrying in {}s. Error: {}".format(
                        API_URL,
                        SEND_INTERVAL_SECONDS,
                        result,
                    )
                )

            time.sleep(SEND_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n[INFO] System monitor agent stopped cleanly.")


if __name__ == "__main__":
    main()
