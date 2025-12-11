#!/usr/bin/env python3
"""
BlackRoad OS - Deployment Status Check
Run this script in Pyto on iOS to check deployment status

Usage: python deploy_check.py
"""

import json
import urllib.request
import urllib.error
from datetime import datetime

# Service endpoints to check
SERVICES = {
    "API Gateway": "https://api.blackroad.io/health",
    "Agent Hub": "https://agents.blackroad.io/health",
    "Main Site": "https://blackroad.io",
    "Docs": "https://docs.blackroad.io",
    "App": "https://app.blackroad.io",
}

def check_service(name: str, url: str) -> dict:
    """Check if a service is healthy."""
    try:
        req = urllib.request.Request(url, method='GET')
        req.add_header('User-Agent', 'BlackRoad-Pyto/1.0')

        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            return {
                "name": name,
                "url": url,
                "status": "healthy" if status == 200 else "degraded",
                "code": status,
                "error": None
            }
    except urllib.error.HTTPError as e:
        return {
            "name": name,
            "url": url,
            "status": "error",
            "code": e.code,
            "error": str(e.reason)
        }
    except Exception as e:
        return {
            "name": name,
            "url": url,
            "status": "unreachable",
            "code": None,
            "error": str(e)
        }

def main():
    print("=" * 50)
    print("BlackRoad OS - Deployment Status")
    print(f"Checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    print()

    healthy = 0
    total = len(SERVICES)

    for name, url in SERVICES.items():
        result = check_service(name, url)

        if result["status"] == "healthy":
            icon = "✅"
            healthy += 1
        elif result["status"] == "degraded":
            icon = "⚠️"
        else:
            icon = "❌"

        print(f"{icon} {result['name']}")
        print(f"   URL: {result['url']}")
        print(f"   Status: {result['status'].upper()}")
        if result["code"]:
            print(f"   HTTP: {result['code']}")
        if result["error"]:
            print(f"   Error: {result['error']}")
        print()

    print("=" * 50)
    print(f"Summary: {healthy}/{total} services healthy")

    if healthy == total:
        print("🎉 All systems operational!")
    elif healthy > total / 2:
        print("⚠️ Some services need attention")
    else:
        print("🚨 Critical: Multiple services down!")

    print("=" * 50)

if __name__ == "__main__":
    main()
