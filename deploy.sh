#!/bin/bash
# BlackRoad OS Deployment Script
# Usage: ./deploy.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║         BlackRoad OS Deployment Script               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Commands
COMMAND=${1:-help}

case $COMMAND in
  # Deploy to all platforms
  all)
    echo -e "${GREEN}Deploying to all platforms...${NC}"
    echo ""

    echo -e "${BLUE}1. Railway${NC}"
    if command -v railway &> /dev/null; then
      railway up --detach
    else
      echo -e "${YELLOW}Railway CLI not installed. Skipping...${NC}"
    fi

    echo ""
    echo -e "${BLUE}2. Cloudflare${NC}"
    if command -v wrangler &> /dev/null; then
      wrangler pages deploy ./dist --project-name=blackroad
    else
      echo -e "${YELLOW}Wrangler CLI not installed. Skipping...${NC}"
    fi

    echo ""
    echo -e "${BLUE}3. Vercel${NC}"
    if command -v vercel &> /dev/null; then
      vercel --prod --yes
    else
      echo -e "${YELLOW}Vercel CLI not installed. Skipping...${NC}"
    fi

    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    ;;

  # Deploy to Railway
  railway)
    echo -e "${GREEN}Deploying to Railway...${NC}"
    railway up --detach
    ;;

  # Deploy to Cloudflare
  cloudflare)
    echo -e "${GREEN}Deploying to Cloudflare Pages...${NC}"
    npm run build
    wrangler pages deploy ./dist --project-name=blackroad
    ;;

  # Deploy to Vercel
  vercel)
    echo -e "${GREEN}Deploying to Vercel...${NC}"
    vercel --prod --yes
    ;;

  # Deploy to DigitalOcean Droplet
  droplet)
    echo -e "${GREEN}Deploying to DigitalOcean Droplet...${NC}"
    DROPLET_IP=${DROPLET_IP:-159.65.43.12}

    echo "Syncing files..."
    rsync -avz --exclude='.git' --exclude='node_modules' \
      ./ root@$DROPLET_IP:/opt/blackroad/

    echo "Restarting services..."
    ssh root@$DROPLET_IP 'cd /opt/blackroad && docker compose up -d --build'

    echo -e "${GREEN}Droplet deployment complete!${NC}"
    ;;

  # Deploy to Raspberry Pi fleet
  pis)
    echo -e "${GREEN}Deploying to Raspberry Pi fleet...${NC}"

    PIS=("192.168.4.38" "192.168.4.64" "192.168.4.49")

    for PI in "${PIS[@]}"; do
      echo -e "${BLUE}Deploying to $PI...${NC}"
      rsync -avz --exclude='.git' --exclude='node_modules' \
        ./ pi@$PI:/home/pi/blackroad/ || echo -e "${YELLOW}Failed to deploy to $PI${NC}"
    done

    echo -e "${GREEN}Pi fleet deployment complete!${NC}"
    ;;

  # Start Docker services
  docker)
    echo -e "${GREEN}Starting Docker services...${NC}"
    docker compose up -d --build
    docker compose ps
    ;;

  # Stop Docker services
  stop)
    echo -e "${YELLOW}Stopping Docker services...${NC}"
    docker compose down
    ;;

  # Restart services
  restart)
    echo -e "${YELLOW}Restarting services...${NC}"
    docker compose down
    docker compose up -d --build
    docker compose ps
    ;;

  # View logs
  logs)
    SERVICE=${2:-}
    if [ -n "$SERVICE" ]; then
      docker compose logs -f $SERVICE
    else
      docker compose logs -f
    fi
    ;;

  # Health check
  health)
    echo -e "${GREEN}Running health checks...${NC}"
    echo ""

    SERVICES=("blackroad.io" "api.blackroad.io" "agents.blackroad.io" "docs.blackroad.io")

    for SERVICE in "${SERVICES[@]}"; do
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$SERVICE" || echo "000")
      if [ "$STATUS" == "200" ] || [ "$STATUS" == "301" ] || [ "$STATUS" == "302" ]; then
        echo -e "  ${GREEN}✓${NC} $SERVICE - $STATUS"
      else
        echo -e "  ${RED}✗${NC} $SERVICE - $STATUS"
      fi
    done
    ;;

  # Start tunnels
  tunnel)
    TUNNEL_TYPE=${2:-cloudflare}

    case $TUNNEL_TYPE in
      cloudflare)
        echo -e "${GREEN}Starting Cloudflare Tunnel...${NC}"
        cloudflared tunnel run blackroad
        ;;
      ngrok)
        echo -e "${GREEN}Starting ngrok tunnels...${NC}"
        ngrok start --all --config .ngrok/ngrok.yml
        ;;
      *)
        echo -e "${RED}Unknown tunnel type: $TUNNEL_TYPE${NC}"
        echo "Available: cloudflare, ngrok"
        ;;
    esac
    ;;

  # Build
  build)
    echo -e "${GREEN}Building application...${NC}"
    npm run build
    ;;

  # Test
  test)
    echo -e "${GREEN}Running tests...${NC}"
    npm test
    ;;

  # Status
  status)
    echo -e "${GREEN}Checking status...${NC}"
    node bin/br.js status
    ;;

  # Help
  help|*)
    echo "Usage: ./deploy.sh <command> [options]"
    echo ""
    echo "Deployment Commands:"
    echo "  all         Deploy to all platforms"
    echo "  railway     Deploy to Railway"
    echo "  cloudflare  Deploy to Cloudflare Pages"
    echo "  vercel      Deploy to Vercel"
    echo "  droplet     Deploy to DigitalOcean Droplet"
    echo "  pis         Deploy to Raspberry Pi fleet"
    echo ""
    echo "Docker Commands:"
    echo "  docker      Start Docker services"
    echo "  stop        Stop Docker services"
    echo "  restart     Restart Docker services"
    echo "  logs [svc]  View logs (optionally for specific service)"
    echo ""
    echo "Tunnel Commands:"
    echo "  tunnel cloudflare  Start Cloudflare Tunnel"
    echo "  tunnel ngrok       Start ngrok tunnels"
    echo ""
    echo "Other Commands:"
    echo "  build       Build the application"
    echo "  test        Run tests"
    echo "  health      Run health checks"
    echo "  status      Check service status"
    echo "  help        Show this help message"
    ;;
esac
