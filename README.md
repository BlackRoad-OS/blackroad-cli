# blackroad-cli

**AI Agent Orchestration CLI with consent management, policy enforcement, and audit trails.**

```bash
pip install blackroad-cli
```

## What is this?

`blackroad-cli` is a command-line tool for orchestrating AI agents with built-in:

- **Consent Management** - Agents must consent before executing tasks
- **Policy Enforcement** - SEC Rule 2042 compliance gate included
- **Audit Trails** - Full lineage tracking for every action
- **Task Routing** - Priority-based task distribution across bot fleet

## Quick Start

```bash
# List available bots
blackroad bot list

# Submit a task
blackroad task submit --type "code-review" --priority high "Review PR #123"

# Check task status
blackroad task status TSK-20241130-143022

# View audit trail
blackroad task lineage TSK-20241130-143022
```

## Commands

### Services & Deployment
| Command | Description |
|---------|-------------|
| `br status` | Check status of all BlackRoad services |
| `br deploy [service]` | Deploy a service to Railway |
| `br health` | Run health check on all services |
| `br services` | List all services and their URLs |
| `br logs [service]` | View logs for a service |
| `br open <target>` | Open service/dashboard in browser |

### Infrastructure Management
| Command | Description |
|---------|-------------|
| `br ssh [target]` | SSH into servers (codex, lucidia, pi) |
| `br ssh --list` | List all available SSH hosts |
| `br ssh --test` | Test SSH connections to all hosts |
| `br tunnel` | Manage Cloudflare Tunnel |
| `br tunnel --start` | Start the Cloudflare tunnel |
| `br tunnel --dns <subdomain>` | Create DNS record |
| `br network` | Show network map |
| `br network --scan` | Ping all hosts |
| `br network --ports <host>` | Scan common ports |

### Platform Management
| Command | Description |
|---------|-------------|
| `br cf --kv` | List Cloudflare KV namespaces |
| `br cf --kv-get <ns:key>` | Get KV value |
| `br cf --d1` | List D1 databases |
| `br cf --pages` | List Pages projects |
| `br git --status` | Git status |
| `br git --pr` | List pull requests |
| `br git --pr-create` | Create new PR |
| `br rw --list` | List Railway services |
| `br rw --logs <service>` | View Railway logs |
| `br rw --redeploy <service>` | Redeploy a service |

### Advanced Features
| Command | Description |
|---------|-------------|
| `br windows` | 🪟  Multi-window terminal (7 windows: SSH + AI) |

### Fun Commands
| Command | Description |
|---------|-------------|
| `br emoji [text]` | 🗣️  Translate text to emoji |
| `br quiz` | 🎮 Play emoji language games |
| `br notify` | 🔔 Emoji-based notifications |

## 🪟 Multi-Window Terminal

The killer feature! Access 7 simultaneous environments in one terminal:

**SSH Windows:**
- ARIA (192.168.4.64) - Raspberry Pi
- CODEX (159.65.43.12) - DigitalOcean
- SHELLFISH (174.138.44.45) - Cloud Server
- ALICE (192.168.4.49) - Pi Network
- LUCIDIA (192.168.4.38) - Raspberry Pi

**AI Windows:**
- CLAUDE - Anthropic Claude 3.5 with internet access
- OLLAMA - Local AI (llama3.2, codellama, mistral)

**Features:**
- Real-time updates (1 second refresh)
- Inter-window copy/paste (Ctrl+Y / Ctrl+P)
- Scrolling with mouse or keyboard
- Full internet access for all windows
- AI windows can fetch web content, ping hosts, run curl
- Tab to switch windows
- Vim-style navigation

```bash
br windows
```

See [WINDOWS.md](WINDOWS.md) for complete documentation.

## Architecture

```
blackroad-cli/
├── cli/           # Typer CLI entry points
│   ├── console.py      # Main CLI app
│   ├── consent_cli.py  # Consent management commands
│   ├── agent_manager.py # Agent lifecycle
│   └── consciousness_care.py # Agent wellbeing
├── orchestrator/  # Core orchestration engine
│   ├── router.py       # Task routing logic
│   ├── policy.py       # Policy enforcement
│   ├── lineage.py      # Audit trail tracking
│   └── consent.py      # Consent protocols
├── bots/          # Bot implementations
└── config/        # Configuration schemas
```

## Configuration

Create `~/.blackroad/config.yaml`:

```yaml
approvals:
  - alice@company.com
  - bob@company.com

policies:
  sec_2042:
    enabled: true
    require_human_approval: true

lineage:
  storage: local
  path: ~/.blackroad/lineage.jsonl
```

## License

MIT - See [LICENSE](LICENSE) for details.

---

Built by [BlackRoad OS](https://blackroad.io)
