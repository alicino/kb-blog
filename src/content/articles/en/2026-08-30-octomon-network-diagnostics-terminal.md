---
title: "Octomon: network diagnostics in the terminal to find out if it's the Wi-Fi, the provider or the internet"
description: "Meet Octomon, a terminal tool that shows latency, bandwidth, Wi-Fi and DNS in a single panel and tells you which layer of your connection is failing."
publishDate: 2026-08-30
author: "Alicino"
category: "Ferramentas"
tags: ["networking", "terminal", "diagnostics", "Octomon", "monitoring", "macOS", "Linux", "DNS"]
draft: false
---

<img src="/assets/img/2026-08-30-octomon-network-diagnostics-terminal-en-1.png" alt="Octomon cover: network diagnostics dashboard in the terminal showing latency, bandwidth, Wi-Fi and DNS in a single screen" width="1200" height="333" />

Everyone who works with technology knows the ritual. The internet starts to
feel slow, a page will not load, a video call freezes. So you open
`ping` to see whether the gateway responds. Then a `traceroute` to find where
the bottleneck is. You check the Wi-Fi signal in the system menu. You open
speedtest.cloudflare.com in the browser to measure bandwidth. You verify
whether DNS is resolving. In the end you have answers scattered across five
different windows and you still do not know exactly what is happening.

[Octomon](https://octomon.dev) solves exactly that problem. It gathers all of
those measurements into a single terminal screen and offers something no
separate tool does: a single analysis that names the layer that is failing.

## What Octomon does

Octomon is a dashboard in the style of `btop`, those colorful panels that
update in real time in the terminal, but aimed entirely at networking. It
shows four main panels with detailed information and, below them, an analysis
line that states the state of your connection directly.

The four panels are:

**Connection quality.** ICMP latency to configurable targets with averages,
p95, maximum, jitter and packet loss. A bufferbloat score. And the same
measurement over TCP connections on port 443, which keep working when ping is
being blocked by the network.

**Bandwidth.** Live transfer rate, an on-demand speed test and the list of
processes using the network the most, or traffic organized by remote address.

**Network.** Active interface, connection type (Wi-Fi, Ethernet, cellular,
VPN), addresses, IPv4 and IPv6 gateways, DNS resolution with response time for
each resolver, Wi-Fi SSID and channel, spectrum congestion, and information
about proxy, clock, path-MTU and NAT.

**Machine.** Your own computer as a possible bottleneck: CPU with the busiest
core, memory pressure, load, interface errors and thermal throttling.

## What it detects beyond the graphs

Octomon does not just show numbers. It interprets what it sees and highlights
specific situations that ordinary tools ignore.

It identifies when you are not connected, when there is no default route, when
the address is a self-assigned 169.254, or when there is an address with no
gateway. And it names the cause as such, not as "downstream failure".

It detects captive portals, when the web is blocked but ping works, when IPv6
is broken but IPv4 works, and exactly where the break happens. It also detects
an HTTP proxy configured on the system.

For DNS it does not merely measure speed. It performs an honesty check: it
queries a reference public resolver alongside yours. If yours fails and the
reference works, the answer is "change your DNS". If the opposite happens, the
network is forcing its own DNS. And every minute it verifies whether
non-existent names return NXDOMAIN instead of an ads page, something common in
providers that hijack DNS queries.

It also detects clock skew via NTP, CGNAT or double NAT through the first
hops, path-MTU black holes and blocked outbound ports (SSH, SMTP,
DNS-over-TLS, NTP, QUIC).

## Memory per network and incidents

One of the most useful features of Octomon is that it learns what is normal
for each network you use. It keeps a persistent baseline and an incident
history. When something happens it can say "worse than normal here" and "three
outages this week, concentrated between 8pm and 11pm".

The history is visible in a session bar on screen. Each time slice of the
current run is colored: green for normal, yellow for degraded, red for outage.
The bar adapts to the session length, so a nine-hour run on a flight takes the
same space as a five-minute check. You can navigate the bar to see what was
wrong at every moment.

## How to install

On macOS the installation goes through Homebrew:

```bash
brew tap securitypedant/octomon
brew trust securitypedant/octomon
brew install octomon
```

On Debian and Ubuntu the repository is signed:

```bash
curl -fsSL https://octomon.dev/apt/octomon.gpg | sudo tee /usr/share/keyrings/octomon.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/octomon.gpg] https://octomon.dev/apt stable main" | sudo tee /etc/apt/sources.list.d/octomon.list
sudo apt update && sudo apt install octomon
```

On other Linux distributions, static binaries (musl) work on any distribution.
The installer picks the right architecture and places the binary in
`~/.cargo/bin`:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/securitypedant/octomon/releases/latest/download/octomon-installer.sh | sh
```

On Windows the PowerShell installer works for x64 and ARM64:

```powershell
irm https://github.com/securitypedant/octomon/releases/latest/download/octomon-installer.ps1 | iex
```

And to install from source with Rust:

```bash
cargo install octomon
```

## How to use it

With Octomon installed, just run:

```bash
octomon
```

That opens the full dashboard in the terminal. All measurements start
automatically.

For a quick check without opening the interface, use doctor mode:

```bash
octomon --doctor
```

It watches the network for about 20 seconds and prints a full analysis in the
terminal. Useful to attach to a provider support ticket. The `--json` mode
returns the analysis in JSON format. It redacts SSID, IPs and MACs by default,
so it is safe to share. Use `--full` to see all the data.

For continuous monitoring in the background:

```bash
octomon --watch
```

That runs without the interface and prints every finding to standard output as
it appears and when it is resolved. Combine with `--alert` for desktop
notifications, `--alert-cmd` to run a command when something happens, or
`--alert-url` to send a JSON POST to a webhook.

## Why you should install Octomon

If you manage your own network at home, work with infrastructure, or simply
want to understand what is happening when the internet gets slow, Octomon
replaces the ritual of opening five different tools.

Few terminal tools offer:

1. A consolidated analysis. Instead of looking at isolated numbers, you get a
   line saying "gateway is not responding" or "healthy connection", with the
   full diagnosis one keypress away.

2. Detection of problems ordinary tools ignore. Hijacked DNS, captive portal,
   CGNAT, bufferbloat, path-MTU black holes, forced proxy. Octomon looks for
   all of them automatically.

3. Memory per network. The tool learns what is normal for each network you use
   and keeps an incident history. That turns "the internet is slow" into "it is
   worse than normal for this network, and there were similar outages in the
   last few days at the same time".

4. Doctor mode safe to share. One command generates a full report of your
   connection with sensitive data redacted by default. Perfect to send to
   provider support or to help forums.

5. Works without privileges. Octomon runs without sudo on most platforms. On
   macOS everything works without elevating privileges. On Linux only the
   per-process bandwidth measurement may need sudo.

## Where to learn more

The official repository is on GitHub at
[securitypedant/octomon](https://github.com/securitypedant/octomon). The
official site is [octomon.dev](https://octomon.dev), which includes detailed
installation instructions and links to releases. There is also an
[introductory video](https://www.youtube.com/watch?v=sHPd2LeYvaw) that
explains the purpose of the tool and shows a guided tour of the interface.

## Conclusion

Octomon is a tool that solves a real problem elegantly. Instead of spreading
the diagnosis across ping, traceroute, ifconfig, speed test and activity
monitor, it gathers everything into a single screen with an analysis that
actually helps you understand what is happening. For anyone who works with
networking or simply wants to stop guessing when the internet fails, it is
worth installing.

The tool is open source (MIT or Apache 2.0 license), written in Rust, and runs
on macOS, Linux and Windows.