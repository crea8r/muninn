# Instruction

## Production

Service

`sudo nano /etc/systemd/system/muninn-web-server.service`

```yaml
[Unit]
Description=Golang Web Server
After=network.target

[Service]
ExecStart=/root/deploy/muninn/web_api
WorkingDirectory=/root/deploy/muninn/
Restart=always
RestartSec=3
User=root
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

`sudo systemctl daemon-reload`

`sudo systemctl start muninn-web-server`

`sudo systemctl enable muninn-web-server`

`sudo ufw allow 8080`

`sudo ufw reload`

`sudo ufw status`
