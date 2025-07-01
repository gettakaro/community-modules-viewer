#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting E2E test workflow...${NC}"

# Configuration
CONTAINER_NAME="community-modules-test"
IMAGE_NAME="community-modules-viewer:test"
TEST_PORT=3002

# Function to cleanup container
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Clean up any existing container
cleanup

# Step 1: Build the production Docker image
echo -e "${YELLOW}Building production Docker image...${NC}"
docker build -f Dockerfile.prod -t $IMAGE_NAME .

# Step 2: Run the container
echo -e "${YELLOW}Starting production container on port $TEST_PORT...${NC}"
docker run -d --name $CONTAINER_NAME -p $TEST_PORT:80 $IMAGE_NAME

# Step 3: Wait for container to be ready
echo -e "${YELLOW}Waiting for container to be ready...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT | grep -q "200"; then
        echo -e "${GREEN}Container is ready!${NC}"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}Container failed to start after $MAX_ATTEMPTS attempts${NC}"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    
    echo "Waiting for container... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

# Step 4: Run Playwright tests
echo -e "${YELLOW}Running Playwright tests...${NC}"
npx playwright test --config=playwright.config.prod.js

# Capture test exit code
TEST_EXIT_CODE=$?

# Step 5: Show test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed!${NC}"
    # Show container logs for debugging
    echo -e "${YELLOW}Container logs:${NC}"
    docker logs $CONTAINER_NAME
fi

# Cleanup is handled by trap
exit $TEST_EXIT_CODE