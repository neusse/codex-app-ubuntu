# Codex App Fedora

Unofficial Fedora installer for running the OpenAI Codex desktop app from a
user-supplied macOS Intel DMG.

This repository does not contain the Codex desktop app, the DMG, a repacked
`app.asar`, Electron binaries, icons, extracted assets, auth files, user data,
logs, or screenshots. It contains only installer scripts, compatibility
patches, and documentation.

## Status

- Tested on Fedora 44 Workstation x86_64 with GNOME/X11 compatibility mode.
- Requires an OpenAI Codex desktop DMG that you already obtained from OpenAI.
- Requires the Codex CLI to be installed and authenticated separately.
- This is unsupported by OpenAI.

OpenAI's public docs describe the Codex app as available on macOS and Windows.
The open-source component used by rich clients is the Codex app-server in the
`openai/codex` repository; the desktop app itself is not redistributed here.

## Quick Start

This installer needs the official macOS Intel Codex DMG. The DMG is not
included in this repository.

Download it from either source:

- Official Codex app download page:
  <https://developers.openai.com/codex/app>
- Direct current macOS Intel DMG:
  <https://persistent.oaistatic.com/codex-app-prod/Codex-latest-x64.dmg>

On Fedora x86_64:

Install system dependencies first:

```bash
sudo dnf install -y curl p7zip p7zip-plugins rsync xdg-utils python3 make gcc-c++ nodejs npm
```

Verify Node.js 22 or newer is available:

```bash
node --version
```

Download the required DMG, or place an existing copy in this repository root as
`Codex-latest-x64.dmg`:

```bash
mkdir -p ~/Downloads
curl -L --fail \
  -o ~/Downloads/Codex-latest-x64.dmg \
  https://persistent.oaistatic.com/codex-app-prod/Codex-latest-x64.dmg
```

Install the Codex CLI and sign in. If sign-in opens a browser, finish the
browser flow before continuing:

```bash
npm install -g @openai/codex
codex login
```

Clone this repository, run the installer, and launch the app:

```bash
git clone https://github.com/neusse/codex-app-ubuntu.git codex-app-fedora
cd codex-app-fedora
./scripts/install.sh ~/Downloads/Codex-latest-x64.dmg
codex-desktop-linux
```

If the DMG is in the repository root, run:

```bash
./scripts/install.sh ./Codex-latest-x64.dmg
codex-desktop-linux
```

You can also launch it from your app menu as **Codex Fedora Port**.

## AI Agent Runbook

Give this section to an AI agent with shell access on Fedora x86_64. The agent
should run the commands from a normal working directory such as `~/dev`.

```bash
set -euo pipefail

sudo dnf install -y curl p7zip p7zip-plugins rsync xdg-utils python3 make gcc-c++ nodejs npm

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)" -lt 22 ]; then
  echo "Node.js 22 or newer is required." >&2
  exit 1
fi

mkdir -p "$HOME/Downloads"
curl -L --fail \
  -o "$HOME/Downloads/Codex-latest-x64.dmg" \
  https://persistent.oaistatic.com/codex-app-prod/Codex-latest-x64.dmg

npm install -g @openai/codex
codex login

mkdir -p "$HOME/dev"
cd "$HOME/dev"
git clone https://github.com/neusse/codex-app-ubuntu.git codex-app-fedora
cd codex-app-fedora

./scripts/install.sh "$HOME/Downloads/Codex-latest-x64.dmg"
codex-desktop-linux
```

Agent rules:

- Stop at `codex login` if user interaction is required, then continue after
  the user finishes sign-in.
- Do not commit or upload `Codex-latest-x64.dmg`, `Codex.app`, `app.asar`,
  extracted app folders, Electron runtime folders, user-data, logs, screenshots,
  or credentials.
- Before pushing any repository changes, run:

```bash
./scripts/prepublish-audit.sh
git status --short
```

Optional user service:

```bash
./scripts/install.sh --service ~/Downloads/Codex-latest-x64.dmg
systemctl --user start codex-app-fedora
```

## What The Installer Does

1. Extracts `Codex.app` from the DMG locally.
2. Extracts the app's `app.asar` into a temporary staging directory.
3. Installs a matching Linux Electron runtime from npm.
4. Rebuilds Linux native modules used by the app.
5. Applies Linux window-manager compatibility patches.
6. Adds Linux folder/reveal actions using `xdg-open`.
7. Adds Linux open targets for VS Code, Terminal, and Ferrite.
8. Installs a small Linux Node REPL/MCP shim for Browser Use.
9. Repackages the local app into `~/.local/share/codex-app-fedora`.
10. Creates a launcher and desktop entry.

## Linux Folder And Reveal Integration

The upstream app defines file-manager launch targets for macOS Finder and
Windows File Explorer. This port adds a Linux target and patches reveal-style
actions to use `xdg-open`, supplied by Fedora's `xdg-utils` package.

Patched Linux actions include:

- Project list **Open in File Manager**
- Downloads **Show in folder** and **Show downloads folder**
- Browser downloads that request opening the folder when complete
- Image context-menu reveal actions
- Generic system-default open actions that Electron routes through
  `shell.openPath`

To force a specific opener at runtime, set `CODEX_LINUX_FILE_MANAGER` before
launching:

```bash
CODEX_LINUX_FILE_MANAGER=nautilus codex-desktop-linux
```

## Linux Editor And Terminal Targets

The upstream app's open-target registry is mostly macOS and Windows oriented.
This port adds Linux targets for:

- **VS Code**: uses `code` on `PATH`, or falls back to the Flatpak app ID
  `com.visualstudio.code`.
- **Terminal**: detects common Linux terminals and opens the selected project
  directory. On Fedora Workstation this uses `gnome-terminal` when available.
- **Ferrite**: uses `ferrite` on `PATH`, or falls back to the Flatpak app ID
  `io.github.olaproeis.Ferrite`.

Flatpak targets require the `flatpak` command to be available on the host.

## Security Boundary

Do not commit or publish anything produced by the installer. Generated output
contains upstream app code and may contain local state if you run the app.

Before publishing changes to this repository, run:

```bash
./scripts/prepublish-audit.sh
```

The audit fails on known risky file types, extracted app directories, auth
caches, user-data, large binaries, and common token patterns.

## Authentication

This port uses your existing Codex CLI authentication. Codex local credentials
live in `~/.codex/auth.json` or your OS credential store, depending on your
Codex configuration. The installer does not copy those credentials into this
repository.

To log out:

```bash
codex logout
rm -rf ~/.local/share/codex-app-fedora/user-data
```

## Legal Notes

The MIT license in this repository applies only to this repository's original
scripts and documentation. It does not grant rights to redistribute OpenAI
Codex Desktop, OpenAI assets, OpenAI trademarks, Electron, Node.js, or any
third-party dependency.

If you fork this project, keep it as an installer/patcher. Do not publish the
converted app, DMG contents, repacked ASAR, icons, logs, user-data, or auth
files.
