# BlackRoad CLI

**Unified command-line interface for managing all 50 BlackRoad Enterprise products**

## Installation

```bash
# macOS (Homebrew)
brew tap blackroad/cli
brew install blackroad

# Linux (apt)
curl -fsSL https://cli.blackroad.io/install.sh | sh

# npm (cross-platform)
npm install -g @blackroad/cli

# Go (from source)
go install github.com/BlackRoad-OS/blackroad-cli@latest
```

## Usage

```bash
# List all products
blackroad list

# Deploy a product
blackroad deploy vllm

# Check product status
blackroad status ollama

# Show CLI version
blackroad version
```

## Products (50 Total - 5 Waves)

<<<<<<< HEAD
### Wave 1 - Foundation (11)
- vLLM, Ollama, LocalAI, Headscale, MinIO, NetBird, Restic, Authelia, EspoCRM, Focalboard, Whisper
=======
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
>>>>>>> fe685a4 (feat: Add policy, secrets, and workflow commands + new libs)

### Wave 2 - Expansion (10)
- ClickHouse, Synapse, Taiga, Dendrite, SuiteCRM, ArangoDB, Borg, Innernet, TTS, Vosk

### Wave 3 - Acceleration (10)
- Mattermost, GitLab, Nextcloud, Keycloak, Grafana, Prometheus, Vault, RabbitMQ, Redis, PostgreSQL

### Wave 4 - DevOps Dominance (9)
- Ansible, Jenkins, Harbor, Consul, Etcd, Traefik, Nginx, Caddy, HAProxy

### Wave 5 - Observability & GitOps (10)
- OpenSearch, Loki, VictoriaMetrics, Cortex, Thanos, Rook, Longhorn, Velero, ArgoCD, Flux

## Features

✅ **Unified Management** - Single CLI for all products
✅ **Deploy Anywhere** - Cloud, on-premise, or hybrid
✅ **Monitor Everything** - Real-time status and metrics
✅ **Auto-Updates** - CLI updates automatically
✅ **Cross-Platform** - macOS, Linux, Windows

## Revenue Potential

**$35.9M/year** across all 50 products
**150 SKUs** (50 products × 3 tiers)

## License

**PROPRIETARY** - BlackRoad OS, Inc.

---

**🖤 Built with BlackRoad 🛣️**
