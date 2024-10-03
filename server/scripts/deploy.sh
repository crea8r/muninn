#!/bin/bash
# This file should stay out side of the Git repository

# Path to your project folder and main.go
PROJECT_DIR="/root/muninn/server"
MAIN_GO="$PROJECT_DIR/cmd/api/main.go"

# Pull the latest code from GitHub
echo "Fetching the latest code from GitHub..."
cd $PROJECT_DIR || exit
git pull origin production

# Build the Go application
echo "Building the Go application..."
# Create this folder /root/deploy/muninn
go build -o /root/deploy/muninn/web_api $MAIN_GO

# Restart the service
echo "Restarting the Golang web server..."
sudo systemctl restart go-web-muninn

echo "Deployment complete."