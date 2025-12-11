#!/usr/bin/env python3
"""
BlackRoad OS - Agent Spawn Script
Run this script in Pyto on iOS to spawn AI agents

Usage: python agent_spawn.py
"""

import json
import urllib.request
import urllib.error
from datetime import datetime

# API Configuration
API_BASE = "https://api.blackroad.io"

# Available agents
AGENTS = {
    "nexus": {
        "name": "Nexus",
        "role": "Integration Engineer",
        "description": "API integrations, webhooks, third-party services"
    },
    "cece": {
        "name": "Cece",
        "role": "Software Engineer",
        "description": "Code review, implementation, testing"
    },
    "atlas": {
        "name": "Atlas",
        "role": "DevOps Engineer",
        "description": "CI/CD, deployment, infrastructure"
    },
    "sentinel": {
        "name": "Sentinel",
        "role": "Security Engineer",
        "description": "Security scanning, vulnerability detection"
    },
    "codex": {
        "name": "Codex",
        "role": "System Architect",
        "description": "Architecture review, system design"
    },
    "oracle": {
        "name": "Oracle",
        "role": "Data Scientist",
        "description": "Data analysis, ML models, insights"
    }
}

def list_agents():
    """List all available agents."""
    print("\n📋 Available Agents:")
    print("-" * 40)
    for key, agent in AGENTS.items():
        print(f"\n🤖 {agent['name']} ({key})")
        print(f"   Role: {agent['role']}")
        print(f"   {agent['description']}")
    print()

def spawn_agent(agent_key: str, task: str = None):
    """Spawn an agent with optional task."""
    if agent_key not in AGENTS:
        print(f"❌ Unknown agent: {agent_key}")
        list_agents()
        return

    agent = AGENTS[agent_key]

    print(f"\n🚀 Spawning {agent['name']}...")
    print(f"   Role: {agent['role']}")

    # Prepare request
    payload = json.dumps({
        "agent": agent_key,
        "task": task,
        "timestamp": datetime.now().isoformat()
    }).encode('utf-8')

    try:
        req = urllib.request.Request(
            f"{API_BASE}/v1/agents/spawn",
            data=payload,
            method='POST'
        )
        req.add_header('Content-Type', 'application/json')
        req.add_header('User-Agent', 'BlackRoad-Pyto/1.0')

        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            print(f"\n✅ Agent spawned successfully!")
            print(f"   Agent ID: {result.get('agent_id', 'N/A')}")
            print(f"   Status: {result.get('status', 'active')}")
            if task:
                print(f"   Task: {task}")
            return result

    except urllib.error.HTTPError as e:
        print(f"\n❌ API Error: {e.code} - {e.reason}")
    except urllib.error.URLError as e:
        print(f"\n❌ Connection Error: {e.reason}")
        print("   (Running in offline mode - simulating spawn)")
        # Simulate successful spawn for offline testing
        print(f"\n✅ [SIMULATED] Agent {agent['name']} spawned!")
        print(f"   Agent ID: sim-{agent_key}-{datetime.now().strftime('%H%M%S')}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

def interactive_menu():
    """Interactive agent selection menu."""
    print("=" * 50)
    print("🤖 BlackRoad OS - Agent Spawner")
    print("=" * 50)

    list_agents()

    print("\nCommands:")
    print("  [agent_key] - Spawn an agent (e.g., 'nexus')")
    print("  list        - List all agents")
    print("  quit        - Exit")
    print()

    while True:
        try:
            cmd = input("🎯 Enter agent key: ").strip().lower()

            if cmd == 'quit' or cmd == 'q':
                print("👋 Goodbye!")
                break
            elif cmd == 'list' or cmd == 'l':
                list_agents()
            elif cmd in AGENTS:
                task = input("📝 Task (optional, press Enter to skip): ").strip()
                spawn_agent(cmd, task if task else None)
            else:
                print(f"❓ Unknown command: {cmd}")
                print("   Type 'list' to see available agents")
        except EOFError:
            break
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break

def main():
    # If running with arguments, spawn directly
    import sys
    if len(sys.argv) > 1:
        agent_key = sys.argv[1].lower()
        task = sys.argv[2] if len(sys.argv) > 2 else None
        spawn_agent(agent_key, task)
    else:
        interactive_menu()

if __name__ == "__main__":
    main()
