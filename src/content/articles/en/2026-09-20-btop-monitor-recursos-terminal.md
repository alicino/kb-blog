---
title: "btop: the system resource monitor your terminal is missing"
description: "Learn how to install and use btop, the interactive monitor for CPU, memory, disks, network, and GPU that turns your terminal into a system dashboard."
publishDate: 2026-09-20
author: "Alicino"
category: "Ferramentas"
tags: ["btop", "terminal", "monitor", "CPU", "GPU", "system", "diagnostics", "Linux", "macOS"]
draft: false
---

<img src="/assets/img/2026-09-20-btop-monitor-recursos-terminal-1.png" alt="btop: monitor de recursos no terminal" style="width:80%;height:auto;display:block;margin:2rem auto" />

You are working and the computer starts to slow down. The browser takes longer to open a tab. The compiler is running slower than usual. What is consuming your machine's resources?

`top` answers that question, but the default Unix `top` is hard to read. `htop` improves on it, but its graphs are limited. [btop](https://github.com/aristocratos/btop) is the natural evolution of those tools: a complete, beautiful, and fast system monitor with full mouse support and customizable themes.

It shows CPU, memory, disks, network, GPU, processes, and sensors on a single screen. The interface looks like a game, with real-time graphs and colors that make data easy to scan.

If you also use [Octomon](/en/articles/octomon-network-diagnostics-terminal) for network diagnostics, the two tools form a complete monitoring setup. Octomon watches your connection to the world. btop watches what is running inside your machine.

## What btop shows

btop splits the screen into panels that you can rearrange. Each panel shows a resource category.

**CPU.** Usage per core with bar graphs and a timeline. The calculation uses a weighted average over time instead of the instant value. This avoids spikes that disappear before you can read them.

**Memory.** RAM and swap, with usage per process and memory pressure.

**Disks.** Read and write rates, used space, and IO activity.

**Network.** Download and upload rates per interface.

**GPU.** (Linux) Usage, memory, temperature, and processes using the graphics card.

**Processes.** An interactive list sortable by CPU, memory, PID, or name. You can filter, kill processes, and switch to tree view to see parent-child hierarchy.

**Sensors.** CPU, GPU, disk temperatures, and fan speeds.

Everything is configured through presets. You can save different layouts and switch between them with a shortcut.

## Installation

btop is available for Linux, macOS, and Windows. The simplest way to install is through your distribution's package manager.

### macOS

```bash
brew install btop
```

### Linux (Debian, Ubuntu, Mint)

```bash
sudo apt install btop
```

### Linux (Fedora)

```bash
sudo dnf install btop
```

### Linux (Arch)

```bash
sudo pacman -S btop
```

### Linux (OpenSUSE)

```bash
sudo zypper install btop
```

### Windows

```bash
winget install btop
```

Or download the binary from the [GitHub releases page](https://github.com/aristocratos/btop/releases).

### Docker

There is also a Docker image for environments that do not allow direct installation:

```bash
docker run -it --pid=host --net=host ghcr.io/aristocratos/btop:latest
```

## Getting started

After installation, run:

```bash
btop
```

The interface opens in full screen inside your terminal. You can navigate with the mouse or the keyboard.

**Essential commands:**

- `1` or `2` toggles between CPU views (average, per core)
- `m` toggles memory view (used, free, swap)
- `d` toggles disk view
- `n` toggles network view
- `e` opens details for the selected process
- `t` toggles tree view for processes
- `f` opens the process filter
- `k` sends a signal to the selected process
- `p` opens the presets menu
- `ESC` goes back or exits the current mode
- `q` or `Ctrl+c` exits btop
- `?` shows the full keyboard help

**Mouse.** Every highlighted button and item is clickable. Scrolling works in the process list and menus. You can click panel tabs to switch between views.

## Use cases

### Find which process is using all the CPU

Run `btop` and look at the process panel. The default sort order is by CPU usage, highest first. The process at the top is the culprit. Press `e` to see details: PID, command, threads, memory, and accumulated CPU time.

### Check if RAM is running out

The memory panel shows a total usage bar and a list of top consumers. If the swap bar is also high, the system is starting to use disk as memory, which causes slowdowns. Usual suspects are browsers with many tabs, Docker containers, and heavy IDEs.

### Monitor GPU while training an AI model

If you train models locally, the GPU panel shows usage, memory consumed, and temperature. If the temperature exceeds 80 degrees, thermal throttling reduces performance. You can watch this in real time while training runs.

### Create a preset for server monitoring

btop lets you save presets with different panel combinations. For a headless server, a useful preset includes CPU (all cores), memory, disk, and network, without processes or GPU. Press `p`, choose an empty slot, mark the panels you want, and save.

## Customization

btop is highly customizable without editing config files manually. Press `p` to open the presets menu and configure:

- Which panels appear and in what order
- Graph symbols (braille, block, line)
- Color themes (over 30 themes included)
- Update interval
- Process sorting and filtering

The configuration file is at `~/.config/btop/btop.conf`. You can edit it manually for advanced options:

```bash
# Theme (names in ~/.config/btop/themes/)
color_theme = "dracula"

# Graph symbols: "braille", "block", "tty"
theme_background = false
graph_symbol = "braille"

# Default process sorting: "cpu lazy", "cpu direct", "memory", "pid"
proc_sorting = "cpu lazy"

# Show process tree by default
proc_tree = false
```

### Themes

btop ships with dozens of ready-made themes, including Dracula, Nord, Monokai, Solarized, Catppuccin, and Tokyo Night. To switch, press `Esc` and navigate to Options > Themes.

You can also create your own themes. Just create a `.theme` file in `~/.config/btop/themes/` with your desired colors.

## Comparison with other tools

The main alternative to btop is `htop`, which is lighter and available on more systems. The default `top` is the bare minimum that every Unix machine has.

| Feature | top | htop | btop |
|---|---|---|---|
| CPU graphs | No | Simple bar | Bar + timeline |
| GPU | No | No | Yes (Linux) |
| Multiple panels | No | No | Yes, rearrangeable |
| Mouse support | No | Partial | Full |
| Themes | No | Limited | 30+ themes |
| Presets | No | No | Yes |
| Temperature sensors | No | No | Yes |
| Docker | No | No | Yes (official image) |

For network monitoring specifically, [Octomon](/en/articles/octomon-network-diagnostics-terminal) is the ideal complementary tool. While btop shows transfer rates per interface, Octomon details latency, DNS, Wi-Fi, bufferbloat, and diagnoses whether the problem is the provider, the local network, or DNS. Together they cover hardware and connectivity.

## Limitations

btop uses more resources than `htop` or `top`. On very limited machines (512 MB of RAM or less), `htop` may be a better choice.

On macOS, GPU support is limited because Apple does not expose these metrics in a standardized way. The GPU panel only works fully on Linux.

Some disk and network metrics require elevated permissions. Inside Docker containers without host access, you may see incomplete information.

## Useful links

- GitHub repository: [github.com/aristocratos/btop](https://github.com/aristocratos/btop)
- Documentation: [github.com/aristocratos/btop#readme](https://github.com/aristocratos/btop#readme)
- Releases and binaries: [github.com/aristocratos/btop/releases](https://github.com/aristocratos/btop/releases)
- Community themes: [github.com/aristocratos/btop/wiki/Themes](https://github.com/aristocratos/btop/wiki/Themes)
- Octomon (complementary network diagnostics): [octomon.dev](https://octomon.dev)

## Conclusion

btop is the tool you install once and consult whenever something on your computer feels off. It replaces `top` and `htop` with a more informative and pleasant interface. The real-time graphs, mouse support, and customizable presets make it an essential item in the toolkit of anyone who works with technology.

Pair it with [Octomon](/en/articles/octomon-network-diagnostics-terminal) for network diagnostics, and you have a complete local monitoring system that does not depend on web dashboards, remote agents, or cloud services.