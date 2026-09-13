---
title: "Octomon: Network Diagnostics Tool for the Terminal"
description: "Discover Octomon, a lightweight terminal-based network diagnostic tool. Real-time monitoring, troubleshooting, and performance analysis from the command line."
publishDate: 2026-08-30
author: "Alicino"
category: "Ferramentas"
tags: ["octomon", "networking", "diagnostics", "terminal", "devops", "monitoring"]
draft: false
---

Network problems are vague. When someone says "the internet is slow," that tells you almost nothing. Is it your connection? The DNS server? The destination server? Packet loss? Jitter? Latency? Something else entirely?

Traditional tools like ping, traceroute, and netstat are powerful but scattered. You end up running five different commands just to understand a single problem.

Octomon is a single tool that shows you what's happening on your network in real time. It's built for terminal users who need to troubleshoot fast.

Octomon is a lightweight, open-source network diagnostics tool written in Go. It combines ping for testing connectivity and latency, traceroute to visualize the network path, DNS lookup to resolve domain names, HTTP monitoring to check website availability, port scanning to find open ports, and bandwidth testing to measure speed. All of that functionality in one interface, all in the terminal.

The repository is at github.com/cyberdyne-enterprises/octomon if you want to check it out.

## Installation

### macOS

```bash
brew install octomon
```

### Linux (Debian/Ubuntu)

```bash
sudo apt-get install octomon
```

### Linux (Arch)

```bash
yay -S octomon
```

### From source

```bash
git clone https://github.com/cyberdyne-enterprises/octomon
cd octomon
cargo build --release
./target/release/octomon
```

### Docker

```bash
docker run -it --network host cyberdyne/octomon
```

## Basic commands

### Ping a host

```bash
octomon ping google.com
```

Output:
```
PING google.com (142.250.185.46)

64 bytes from 142.250.185.46: icmp_seq=1 time=12.3ms TTL=55
64 bytes from 142.250.185.46: icmp_seq=2 time=11.8ms TTL=55
64 bytes from 142.250.185.46: icmp_seq=3 time=12.1ms TTL=55

--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/stddev = 11.8/12.1/12.3/0.2 ms
```

### Trace route to a host

```bash
octomon traceroute example.com
```

Output:
```
TRACEROUTE to example.com (93.184.216.34), 30 hops max

 1  192.168.1.1 (192.168.1.1)  1.2ms
 2  10.0.0.1 (10.0.0.1)  5.3ms
 3  203.0.113.45 (203.0.113.45)  8.7ms
 4  203.0.113.60 (203.0.113.60)  12.1ms
 5  example.com (93.184.216.34)  14.5ms
```

### DNS lookup

```bash
octomon dns google.com
```

Output:
```
DNS LOOKUP for google.com

A records:
  142.250.185.46

AAAA records:
  2607:f8b0:4004:80a::200e

MX records:
  10 smtp.google.com
  20 smtp2.google.com

Lookup time: 23ms
```

### HTTP status check

```bash
octomon http https://example.com
```

Output:
```
HTTP GET https://example.com

Status: 200 OK
Response time: 145ms
Content-Length: 1256 bytes
Server: nginx/1.21.0

Redirect chain:
  https://example.com -> https://www.example.com (301)
  https://www.example.com -> 200 OK
```

### Port scan

```bash
octomon scan example.com
```

Output:
```
PORT SCAN for example.com

Port 22 (SSH): closed
Port 80 (HTTP): open
Port 443 (HTTPS): open
Port 3306 (MySQL): closed
Port 5432 (PostgreSQL): closed

Scan complete: 3 open ports found
```

## Real-world troubleshooting scenarios

### Scenario 1: Website is slow

```bash
octomon http https://myapp.example.com --verbose
```

This shows:
- DNS resolution time
- Connection time
- SSL/TLS handshake time
- Time to first byte (TTFB)
- Total response time

If TTFB is high, the server is slow. If DNS is high, the DNS server is slow.

### Scenario 2: Connection to a database server is timing out

```bash
octomon ping db.example.com
octomon traceroute db.example.com
octomon scan db.example.com -p 5432
```

- Ping tells you if the host is reachable
- Traceroute shows the path and where it fails
- Port scan shows if the database port is open

### Scenario 3: Email isn't sending

```bash
octomon dns gmail.com --type MX
octomon scan smtp.gmail.com -p 587
octomon http https://smtp.gmail.com --verbose
```

Check:
- MX records (where email goes)
- SMTP port reachability
- Connection details

## Advanced usage

### Continuous monitoring

```bash
# Monitor a host continuously
octomon ping google.com --continuous

# With interval
octomon ping google.com --continuous --interval 2s
```

Output updates every 2 seconds, showing real-time statistics.

### Custom resolution (DNS)

```bash
# Use a specific DNS server
octomon dns google.com --server 8.8.8.8

# Query a specific record type
octomon dns google.com --type CNAME
```

### Bandwidth testing

```bash
# Test download speed
octomon speedtest

# Test to a specific server
octomon speedtest --server speedtest.example.com
```

Output:
```
SPEED TEST

Download: 125.3 Mbps
Upload: 45.7 Mbps
Latency: 12ms
Jitter: 1.2ms
```

### Concurrent tests

```bash
# Test multiple hosts at once
octomon ping google.com github.com example.com --concurrent
```

Useful for checking if a DNS provider is down.

### Export results

```bash
# Export to JSON
octomon ping google.com --output json > result.json

# Export to CSV
octomon ping google.com --output csv > result.csv
```

Use for automation, logging, or processing in other tools.

## Integration examples

### Bash script: Monitor uptime

```bash
#!/bin/bash
HOSTS=(
  "google.com"
  "example.com"
  "my-api.example.com"
)

for host in "${HOSTS[@]}"; do
  echo "Testing $host..."
  result=$(octomon ping "$host" --count 3 --output json)
  packet_loss=$(echo "$result" | jq '.packet_loss')
  
  if [ "$packet_loss" -gt 10 ]; then
    echo "ALERT: $host has ${packet_loss}% packet loss"
    # Send alert (email, Slack, etc)
  fi
done
```

### Python: Network dashboard

```python
import subprocess
import json

def check_host(host):
    result = subprocess.run(
        ['octomon', 'ping', host, '--count', '5', '--output', 'json'],
        capture_output=True,
        text=True
    )
    data = json.loads(result.stdout)
    return {
        'host': host,
        'avg_time': data['avg_rtt_ms'],
        'packet_loss': data['packet_loss_percent']
    }

hosts = ['google.com', 'example.com', 'api.github.com']
status = [check_host(h) for h in hosts]

for result in status:
    print(f"{result['host']}: {result['avg_time']:.1f}ms, {result['packet_loss']:.1f}% loss")
```

### Cron job: Regular health checks

```bash
# /etc/cron.d/octomon-health-check
0 * * * * root octomon ping api.example.com --count 10 >> /var/log/octomon.log 2>&1
0 * * * * root octomon http https://status.example.com >> /var/log/octomon.log 2>&1
```

## Tips and tricks

If you want faster DNS lookups, try using faster DNS servers. Google's DNS is 8.8.8.8. Cloudflare's is 1.1.1.1. Quad9 is 9.9.9.9. Just pass the --server flag.

If you're testing on slow international links, increase the timeout. The default is 2 seconds, but you can bump it to 5 seconds or more with the --timeout flag.

Some network functions require root privileges. If you need to do low-level diagnostics, use sudo.

You can combine Octomon with other tools. Pipe the output through grep to filter results. Send results to JSON format and pipe them into other monitoring systems.

## Limitations

Some networks block ICMP ping. If ping doesn't work, try traceroute or an HTTP check instead. Scanning ports below 1024 requires sudo. Results are printed to stdout, so if you want to save them, redirect to a file. Port scanning is serial, not parallel, so if you need to scan multiple hosts, use the --concurrent flag.

## Comparison with alternatives

| Tool | Ping | Traceroute | DNS | HTTP | Port Scan | Speed Test |
|---|---|---|---|---|---|---|
| ping | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| traceroute | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| dig | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| curl | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| nmap | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| speedtest | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **octomon** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Octomon consolidates all common tools into one.

## Conclusion

Network troubleshooting is part of any developer or sysadmin's work. Octomon makes it fast and simple.

Instead of running five separate commands and trying to piece together the results, you run one. Get results in seconds. Move on to fixing the actual problem.

If you work in infrastructure or DevOps, or you're just tired of remembering all the different network command syntax, Octomon is worth adding to your toolkit.
