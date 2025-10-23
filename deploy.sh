#!/bin/bash

# CloudCurio Deployment Script
# This script deploys the main site and all workers

set -e

echo "🚀 Starting CloudCurio deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Deploying main Pages site...${NC}"
wrangler pages deploy public --project-name=cloudcurio-blog

echo -e "${GREEN}✓ Pages deployed${NC}"

echo -e "${BLUE}Step 2: Deploying Blog Generator worker...${NC}"
wrangler deploy --config wrangler-blog-generator.toml

echo -e "${GREEN}✓ Blog Generator deployed${NC}"

echo -e "${BLUE}Step 3: Deploying Vectorize Processor worker...${NC}"
wrangler deploy --config wrangler-vectorize-processor.toml

echo -e "${GREEN}✓ Vectorize Processor deployed${NC}"

echo -e "${BLUE}Step 4: Deploying Research Agent worker...${NC}"
wrangler deploy --config wrangler-research-agent.toml

echo -e "${GREEN}✓ Research Agent deployed${NC}"

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Your CloudCurio site is now live!"
echo "Remember to update your wrangler.toml files with actual IDs for:"
echo "  - D1 database_id"
echo "  - KV namespace id"
echo "  - Vectorize index_name"
