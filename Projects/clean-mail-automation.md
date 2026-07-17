---
id: clean-mail-automation
title: Clean Mail Automation
description: Dockerized IMAP mailbox cleanup with multi-mailbox support, configurable retention, weekly scheduling, a web status page, and optional Telegram notifications.
sidebar_position: 2
tags:
  - Projects
  - Python
  - IMAP
  - Docker
---

# Clean Mail Automation

`clean-mail-automation` is a Docker-first utility that connects to one or more IMAP mailboxes and deletes emails older than a configurable retention period (default: 10 days).
It executes immediately at container startup, then runs on a cron schedule, and always serves a read-only web status page inside the container.

## Demo and repository
- Source code: [github.com/gioxx/clean-mail-automation](https://github.com/gioxx/clean-mail-automation)
- Docker Hub image: `gfsolone/clean-mail-automation`
- GHCR image: `ghcr.io/gioxx/clean-mail-automation`

## Key features
- IMAP over SSL connection with environment-based configuration.
- Single or multi-mailbox cleanup in the same container run (`MAILBOX_CONFIGS` JSON array).
- Retention policy by days (`CLEAN_DAYS`, per-mailbox `clean_days`) with per-run CLI override (`--days`).
- Web status page (`status_server.py`), always available on `WEB_PORT` (default `8080`), showing config and last-run results; auto-refreshes every 60s.
- Optional Telegram notifications: `always` (per run) or `digest` (accumulated, sent on its own schedule), plus `TELEGRAM_NOTIFY_ONLY_IF_DELETED` to suppress no-op runs.
- Cron scheduling through the container entrypoint (`SCHEDULE_DAY`, `SCHEDULE_HOUR`, `SCHEDULE_MIN`), with a separate digest schedule when digest mode is used.
- Logs routed to container stdout/stderr.

## Architecture at a glance
- **Script** (`clean_email.py`): stdlib-only, handles IMAP connection(s), filtering by age, deletion, and optional Telegram notification/digest.
- **Status server** (`status_server.py`): HTTP server for the read-only web dashboard; started by `entrypoint.sh`, not by the script directly.
- **Entrypoint** (`entrypoint.sh`): writes cron schedule(s), starts the status server, then runs the first cleanup at startup.
- **Container** (`Dockerfile`): Python image running the script on schedule.

## Environment variables
| Name | Used by | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `IMAP_SERVER` | script | Yes\* | none | IMAP server hostname or IP. |
| `IMAP_PORT` | script | No | `993` | IMAP SSL port. |
| `EMAIL_USER` | script | Yes\* | none | Username for IMAP login. |
| `EMAIL_PASS` | script | Yes\* | none | Password for IMAP login. |
| `EMAIL_ADDRESS` | script | No | `EMAIL_USER` | Mailbox label in logs/notifications. |
| `MAILBOX` | script | No | `INBOX` | IMAP folder to clean. |
| `CLEAN_DAYS` | script | No | `10` | Delete messages older than this many days. Ignored if `--days` is passed. |
| `MAILBOX_CONFIGS` | script | No | none | JSON array for multi-mailbox mode; overrides the single-mailbox vars above (see [Multi-Mailbox Mode](#multi-mailbox-mode)). |
| `SEND_TELEGRAM_NOTIFICATIONS` | script | No | `false` | Enable Telegram notifications (`1`, `true`, `yes`, `on`). |
| `TELEGRAM_BOT_TOKEN` | script | Conditional | none | Required only if Telegram notifications are enabled. |
| `CLEAN_EMAIL_TELEGRAM_CHAT_ID` | script | Conditional | none | Preferred chat ID for this app. Has priority over `TELEGRAM_CHAT_ID`. |
| `TELEGRAM_CHAT_ID` | script | Conditional | none | Fallback chat ID if `CLEAN_EMAIL_TELEGRAM_CHAT_ID` is not set. |
| `TELEGRAM_TIMEOUT` | script | No | `10` | Telegram API timeout in seconds. |
| `TELEGRAM_NOTIFY_MODE` | script | No | `always` | `always` sends after every run; `digest` accumulates results and sends on the `DIGEST_SCHEDULE_*` cron instead. |
| `TELEGRAM_NOTIFY_ONLY_IF_DELETED` | script | No | `false` | Skip notifications for runs where nothing was deleted (either mode). |
| `SCHEDULE_MIN` | container entrypoint | No | `0` | Cron minute (`0-59`). |
| `SCHEDULE_HOUR` | container entrypoint | No | `0` | Cron hour (`0-23`). |
| `SCHEDULE_DAY` | container entrypoint | No | `0` | Cron weekday (`0-7`, where `0`/`7` is Sunday; `*` runs every day). |
| `DIGEST_SCHEDULE_MIN` | container entrypoint | No | `0` | Digest send cron minute (digest mode only). |
| `DIGEST_SCHEDULE_HOUR` | container entrypoint | No | `8` | Digest send cron hour (digest mode only). |
| `DIGEST_SCHEDULE_DAY` | container entrypoint | No | `0` | Digest send cron weekday (digest mode only). |
| `WEB_PORT` | container entrypoint | No | `8080` | Port the web status page listens on inside the container; always started. |
| `TZ` | container OS | No | `UTC` | Container timezone; affects timestamps written by the script (last run, digest period, logs). Status page clock uses the browser's local time regardless. |

\* Not required at the top level when `MAILBOX_CONFIGS` supplies per-mailbox credentials instead.

## Multi-Mailbox Mode
Set `MAILBOX_CONFIGS` to a JSON array to clean multiple mailboxes in one container run. Each entry accepts `imap_server`, `imap_port` (default `993`), `email_user`, `email_pass`, `email_address` (defaults to `email_user`), `mailbox` (default `INBOX`), and `clean_days` (default from `CLEAN_DAYS` or `10`).

```bash
-e MAILBOX_CONFIGS='[
  {"imap_server":"imap.server.com","email_user":"user1","email_pass":"pass1","email_address":"mail1@example.com","mailbox":"INBOX","clean_days":10},
  {"imap_server":"imap.server.com","email_user":"user2","email_pass":"pass2","email_address":"mail2@example.com","mailbox":"Archive","clean_days":30}
]'
```
In Docker Compose, keep the value on a single line (or use an `.env` file) — multi-line JSON is not reliably parsed by Compose's env handling.

## Web status page
Always served at `http://<host>:<port>/` (default `8080`) by the container. Shows configured mailboxes (server, folder, retention — no passwords), the schedule in human-readable form, Telegram notification status, and the last cleanup run's per-mailbox results (status, deleted count, duration, errors). Auto-refreshes every 60 seconds. Not started when running `clean_email.py` directly outside Docker.

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
  -p 8080:8080 \
  --name email_cleaner ghcr.io/gioxx/clean-mail-automation:latest
```

### Docker (Docker Hub)
```bash
docker run -d -p 8080:8080 --name email_cleaner gfsolone/clean-mail-automation:latest
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
  -p 8080:8080 \
  --name email_cleaner email-cleaner
```

### Docker Compose — single mailbox
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
    ports:
      - "8080:8080"
    # Alternative image:
    # image: gfsolone/clean-mail-automation:latest
```
Ready-to-use compose files ship in [`examples/`](https://github.com/gioxx/clean-mail-automation/tree/main/examples): `docker-compose.single.yml` and `docker-compose.multi.yml` (weekly digest). To expose the status page on a different host port, remap `ports` (e.g. `"3200:8080"`) — no need to change `WEB_PORT` unless the internal port itself conflicts.

### Docker Compose — multi-mailbox
```yaml
services:
  email-cleaner:
    image: ghcr.io/gioxx/clean-mail-automation:latest
    environment:
      - MAILBOX_CONFIGS=[{"imap_server":"imap.server.com","email_user":"user1@example.com","email_pass":"pass1","email_address":"user1@example.com","mailbox":"INBOX","clean_days":10},{"imap_server":"imap.server.com","email_user":"user2@example.com","email_pass":"pass2","email_address":"user2@example.com","mailbox":"INBOX","clean_days":30},{"imap_server":"imap.other.com","email_user":"user3@example.com","email_pass":"pass3","email_address":"user3@example.com","mailbox":"Archive","clean_days":60}]
      - SCHEDULE_DAY=1
      - SCHEDULE_HOUR=1
      - SCHEDULE_MIN=30
      - SEND_TELEGRAM_NOTIFICATIONS=true
      - TELEGRAM_BOT_TOKEN=123456:ABCDEF
      - TELEGRAM_CHAT_ID=987654321
    ports:
      - "8080:8080"
    restart: unless-stopped
```
Prefer keeping credentials in an `.env` file referenced via `env_file` if you don't want them in the compose file directly.

### Local run (no Docker)
Prerequisites:
- Python 3.8+ (stdlib only, no dependencies)
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

The web status page is **not** started when running the script directly — it only runs inside the container via `entrypoint.sh`. For recurring runs without Docker, schedule `python3 clean_email.py` using your platform scheduler (`cron`, `systemd timer`, Windows Task Scheduler).

## Telegram notifications
- Disabled by default; enable with `SEND_TELEGRAM_NOTIFICATIONS=true`.
- Requires `TELEGRAM_BOT_TOKEN` and a chat ID when enabled. Chat ID priority: `CLEAN_EMAIL_TELEGRAM_CHAT_ID` first, then `TELEGRAM_CHAT_ID`.
- Success messages include mailbox address, folder, retention days, deleted count, and duration; failure messages include the same plus error details.
- In multi-mailbox mode, one notification is sent per mailbox after each cleanup (in `always` mode) or bundled into the digest.
- `TELEGRAM_NOTIFY_MODE=digest` accumulates results locally and sends them together on the `DIGEST_SCHEDULE_*` cron — useful when cleanup runs frequently but you only want a single periodic summary. `--send-digest` (called automatically by the container's digest cron) sends the accumulated digest and clears it.
- `TELEGRAM_NOTIFY_ONLY_IF_DELETED=true` suppresses notifications for quiet runs, in either mode.

## Repository structure
```text
clean-mail-automation/
|- clean_email.py       # Core script: IMAP connection(s), deletion, notifications
|- status_server.py     # Web status page HTTP server (started by entrypoint.sh)
|- entrypoint.sh         # Cron setup, starts status server, runs first cleanup
|- Dockerfile
|- examples/             # Ready-to-use docker-compose files
|- README.md
`- LICENSE
```

## Operational notes
- `entrypoint.sh` writes cron configuration(s), starts the status server, and executes a first immediate cleanup.
- `SCHEDULE_DAY=1`, `SCHEDULE_HOUR=1`, `SCHEDULE_MIN=30` means every Monday at 01:30.
- `--days` (CLI) overrides `CLEAN_DAYS` for that run.
- Container logs are available with `docker logs email_cleaner`.

## License
MIT License. See `LICENSE` in the repository.
