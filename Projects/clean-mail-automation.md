---
id: clean-mail-automation
title: Clean Mail Automation
description: Dockerized IMAP mailbox cleanup with configurable retention, weekly scheduling, and optional Telegram notifications.
sidebar_position: 2
tags:
  - Projects
  - Python
  - IMAP
  - Docker
---

# Clean Mail Automation

`clean-mail-automation` is a Docker-first utility that connects to an IMAP mailbox and deletes emails older than a configurable retention period (default: 10 days).  
It executes immediately at container startup and then runs on a weekly cron schedule.

## Demo and repository
- Source code: [github.com/gioxx/clean-mail-automation](https://github.com/gioxx/clean-mail-automation)
- Docker Hub image: `gfsolone/clean-mail-automation`
- GHCR image: `ghcr.io/gioxx/clean-mail-automation`

## Key features
- IMAP over SSL connection with environment-based configuration.
- Retention policy by days (`CLEAN_DAYS`) with per-run CLI override (`--days`).
- Optional Telegram summary notifications (success/failure, deleted count, duration).
- Weekly scheduling through container cron (`SCHEDULE_DAY`, `SCHEDULE_HOUR`, `SCHEDULE_MIN`).
- Logs routed to container stdout/stderr.

## Architecture at a glance
- **Script** (`clean_email.py`): handles IMAP connection, filtering by age, deletion, and optional Telegram notification.
- **Entrypoint** (`entrypoint.sh`): writes cron schedule and runs first cleanup at startup.
- **Container** (`Dockerfile`): Python image running the script on schedule.

## Environment variables
| Name | Used by | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `IMAP_SERVER` | script | Yes | none | IMAP server hostname or IP. |
| `IMAP_PORT` | script | No | `993` | IMAP SSL port. |
| `EMAIL_USER` | script | Yes | none | Username for IMAP login. |
| `EMAIL_PASS` | script | Yes | none | Password for IMAP login. |
| `EMAIL_ADDRESS` | script | No | `EMAIL_USER` | Mailbox label in logs/notifications. |
| `CLEAN_DAYS` | script | No | `10` | Delete messages older than this many days. Ignored if `--days` is passed. |
| `SEND_TELEGRAM_NOTIFICATIONS` | script | No | `false` | Enable Telegram notifications (`1`, `true`, `yes`, `on`). |
| `TELEGRAM_BOT_TOKEN` | script | Conditional | none | Required only if Telegram notifications are enabled. |
| `CLEAN_EMAIL_TELEGRAM_CHAT_ID` | script | Conditional | none | Preferred chat ID for this app. Has priority over `TELEGRAM_CHAT_ID`. |
| `TELEGRAM_CHAT_ID` | script | Conditional | none | Fallback chat ID if `CLEAN_EMAIL_TELEGRAM_CHAT_ID` is not set. |
| `TELEGRAM_TIMEOUT` | script | No | `10` | Telegram API timeout in seconds. |
| `SCHEDULE_MIN` | container entrypoint | No | `0` | Cron minute (`0-59`). |
| `SCHEDULE_HOUR` | container entrypoint | No | `0` | Cron hour (`0-23`). |
| `SCHEDULE_DAY` | container entrypoint | No | `0` | Cron weekday (`0-7`, where `0`/`7` is Sunday). |

## Quick start
### Docker (GHCR, recommended)
```bash
docker run -d \
  -e IMAP_SERVER="imap.server.com" \
  -e IMAP_PORT=993 \
  -e EMAIL_USER="your_username" \
  -e EMAIL_PASS="your_password" \
  -e EMAIL_ADDRESS="mailbox@example.com" \
  -e CLEAN_DAYS=10 \
  -e SEND_TELEGRAM_NOTIFICATIONS=true \
  -e TELEGRAM_BOT_TOKEN="123456:ABCDEF" \
  -e CLEAN_EMAIL_TELEGRAM_CHAT_ID="987654321" \
  -e TELEGRAM_CHAT_ID="123456789" \
  -e SCHEDULE_DAY=1 \
  -e SCHEDULE_HOUR=1 \
  -e SCHEDULE_MIN=30 \
  --name email_cleaner ghcr.io/gioxx/clean-mail-automation:latest
```

### Docker (Docker Hub)
```bash
docker run -d --name email_cleaner gfsolone/clean-mail-automation:latest
```

### Docker build locally (optional)
```bash
docker build -t email-cleaner .
```

```bash
docker run -d \
  -e IMAP_SERVER="imap.server.com" \
  -e IMAP_PORT=993 \
  -e EMAIL_USER="your_username" \
  -e EMAIL_PASS="your_password" \
  -e EMAIL_ADDRESS="mailbox@example.com" \
  -e CLEAN_DAYS=10 \
  -e SEND_TELEGRAM_NOTIFICATIONS=true \
  -e TELEGRAM_BOT_TOKEN="123456:ABCDEF" \
  -e CLEAN_EMAIL_TELEGRAM_CHAT_ID="987654321" \
  -e TELEGRAM_CHAT_ID="123456789" \
  -e SCHEDULE_DAY=1 \
  -e SCHEDULE_HOUR=1 \
  -e SCHEDULE_MIN=30 \
  --name email_cleaner email-cleaner
```

### Docker Compose
`compose.yaml`
```yaml
services:
  clean-mail-automation:
    image: ghcr.io/gioxx/clean-mail-automation:latest
    container_name: email_cleaner
    restart: unless-stopped
    environment:
      IMAP_SERVER: "imap.server.com"
      IMAP_PORT: "993"
      EMAIL_USER: "your_username"
      EMAIL_PASS: "your_password"
      EMAIL_ADDRESS: "mailbox@example.com"
      CLEAN_DAYS: "10"
      SEND_TELEGRAM_NOTIFICATIONS: "true"
      TELEGRAM_BOT_TOKEN: "123456:ABCDEF"
      CLEAN_EMAIL_TELEGRAM_CHAT_ID: "987654321"
      SCHEDULE_DAY: "1"
      SCHEDULE_HOUR: "1"
      SCHEDULE_MIN: "30"
    # Alternative image:
    # image: gfsolone/clean-mail-automation:latest
```

### Local run (no Docker)
Prerequisites:
- Python 3.x
- Network access to your IMAP server

Export variables and run:
```bash
export IMAP_SERVER="imap.server.com"
export IMAP_PORT="993"
export EMAIL_USER="your_username"
export EMAIL_PASS="your_password"
export EMAIL_ADDRESS="mailbox@example.com"
export CLEAN_DAYS="10"

python3 clean_email.py
```

Optional retention override via CLI:
```bash
python3 clean_email.py --days 30
```

For recurring runs without Docker, schedule `python3 clean_email.py` using your platform scheduler (`cron`, `systemd timer`, Windows Task Scheduler).

## Repository structure
```text
clean-mail-automation/
|- clean_email.py
|- entrypoint.sh
|- Dockerfile
|- README.md
`- LICENSE
```

## Operational notes
- `entrypoint.sh` writes cron configuration and executes a first immediate cleanup.
- `SCHEDULE_DAY=1`, `SCHEDULE_HOUR=1`, `SCHEDULE_MIN=30` means every Monday at 01:30.
- `--days` (CLI) overrides `CLEAN_DAYS` for that run.
- Disabled by default; enable with `SEND_TELEGRAM_NOTIFICATIONS=true`.
- Requires `TELEGRAM_BOT_TOKEN` and a chat ID when enabled.
- Chat ID priority: `CLEAN_EMAIL_TELEGRAM_CHAT_ID` first, then `TELEGRAM_CHAT_ID`.
- Container logs are available with `docker logs email_cleaner`.

## License
MIT License. See `LICENSE` in the repository.
