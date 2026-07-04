# How It Works

The official desktop app is an Electron application packaged for supported
desktop platforms. This project performs a local compatibility conversion:

- keep the user's upstream DMG local
- extract the app locally
- replace the Electron runtime with Linux Electron
- rebuild Linux native modules for the app's Electron ABI
- patch Linux window options so GNOME manages the windows normally
- add Linux folder/reveal fallbacks for `xdg-open`
- add Linux open targets for VS Code, Terminal, and Ferrite
- install a Linux launcher and desktop entry

The most important Linux window patch is avoiding unmanaged override-redirect
windows for the primary app window. The patch keeps Linux primary windows
framed, taskbar-visible, minimizable, maximizable, resizable, and workspace
managed.

The upstream file-manager target only defines macOS Finder and Windows File
Explorer handlers. The Fedora patch adds a Linux target and routes reveal-style
actions through `xdg-open`, including project folder opens, download reveal
actions, image context-menu reveals, and generic system-default folder opens.
Users can override the command by launching with `CODEX_LINUX_FILE_MANAGER=<command>`.

The upstream open-target registry has rich macOS and Windows entries but few
Linux entries. The Fedora patch adds:

- VS Code via `code`, or Flatpak `com.visualstudio.code`
- Terminal via common Linux terminal commands such as `gnome-terminal`
- Ferrite via `ferrite`, or Flatpak `io.github.olaproeis.Ferrite`

The Browser Use helper in the macOS bundle is a Mach-O executable. The installer
keeps the original file as a local backup and replaces `node_repl` with a small
Linux Node.js MCP shim. That shim is original code in this repository.

Generated files are installed under:

```text
~/.local/share/codex-app-fedora/
~/.local/bin/codex-desktop-linux
~/.local/share/applications/codex-app-fedora.desktop
```

Those paths are install output, not source code for this repository.
