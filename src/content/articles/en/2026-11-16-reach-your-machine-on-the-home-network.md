---
title: "Reaching your machine on the home network without leaving the couch"
description: "How to reach a server, Raspberry Pi or container that sits on your own network without plugging in a monitor. Names that work, what breaks in Docker and why .local has limits."
publishDate: 2026-11-16
author: "Alicino"
category: "Infraestrutura e Redes"
tags: ["rede doméstica", "mDNS", "Docker", "servidor caseiro", "Raspberry Pi", "acesso remoto"]
draft: false
---

<img src="/assets/img/2026-11-16-reach-your-machine-on-the-home-network-1.png" alt="Cover about reaching a machine on your home network without a monitor: a home server, the .local name and Docker ports" width="1200" height="333" />

You put together a server at home, plugged in the network cable and left it in a corner. Now you need to reach it and you hit the problem: no monitor, no keyboard, no idea which address to use.

This is the most common situation for anyone with an idle computer running something. A Raspberry Pi with Pi-hole, a mini PC holding files, a container running Home Assistant, an old machine that became a server. All with the same issue: you do not want to walk over to it.

The good news is that only two things need solving. A name so you do not memorise numbers, and a port published the right way. The bad news is that each has a specific trap, and this post is about those traps.

## The trouble with IP addresses

The path almost everyone tries first is using the IP directly. Something like `192.168.1.198`. It works, and that is exactly what makes it misleading.

Three reasons it stops being useful:

1. **You have to remember it.** One server is manageable, but with two or three nobody remembers which is which.
2. **The IP can change.** Even with a router reservation, swapping equipment or resetting gives the address back to the dynamic pool.
3. **Nobody else can use it.** When someone in the house wants to reach it, "type 192.168.1.198" is not a reasonable instruction.

The cleaner path is to give the machine a name and let the network resolve it. That is where the part almost nobody explains properly begins.

## .local, .lan, .home: what actually works

You will find people online recommending `.local`, `.lan`, `.home`, `.intranet`, `.rede`. The difference between them is not taste. It is a question of who answers for translating the name.

I tested this on my own network, and the result is clear. From the Mac I write on, with the network working normally:

```
mac-mini-server.local       -> 192.168.1.198   ok
mac-mini-server.lan         -> does not resolve
mac-mini-server.intranet    -> does not resolve
mac-mini-server.rede        -> does not resolve
mac-mini-server.home        -> does not resolve
```

Only `.local` worked **without me configuring anything**. The other four do not resolve because nothing on the network knows how to answer for them.

### Why .local is special

`.local` is not a friendly nickname for an internal network. It is a domain reserved by standard, and the standard is **RFC 6762**, from 2013.

The RFC says this, directly: any name ending in `.local` is *link-local*, and names in that domain are meaningful only on the link where they originate. It compares them to `192.168.x.x` and `169.254.x.x` addresses, which also only mean something inside your own network.

It then defines the rule that makes everything work: **every query for a name ending in `.local` must be sent by multicast**, to address `224.0.0.251`, on port `5353`. No central server answers. Each machine announces itself and answers for itself.

That mechanism has a name: **mDNS**, or Bonjour in Apple's vocabulary. On your Mac or iPhone it is already running out of the box. That is why only `.local` worked in my test.

The name that `.local` uses comes from the system itself. On macOS it is the "local hostname" in Settings, and you can read it from the terminal:

```bash
scutil --get LocalHostName
```

```text
mac-mini-server
```

### Why .lan and .home do not work on their own

`.lan`, `.home`, `.intranet`, `.internal`, `.private` and `.corp` are also private use suffixes. RFC 6762 names them explicitly as options for internal networks.

But there is a difference that changes everything: **none of them has a protocol attached**. `.local` was paired with mDNS by standard. The others are just names the community agreed to use.

That means they **only work if a DNS server on your network answers for them**. Without that server, your computer asks the router, the router does not know the name, and the query fails. That is exactly what the four errors in my test show.

When you want to use `.lan` or a domain of your own like `casa.lab`, the path is setting up internal DNS. It is worth knowing that, for home use, there is a suffix with backing in a standard, defined in **RFC 8375**: `.home.arpa`, created specifically to collide with nothing.

### An escape hatch when nothing resolves

If the name does not resolve and you do not want to configure anything, there is a way out on the originating computer:

```bash
sudo tee -a /etc/hosts <<'EOF'
192.168.1.198   servidor.home
EOF
```

That works on the machine where you edited the file, and only there. It is useful as a test, to confirm the problem is name resolution and not connectivity. But it does not scale: every new device needs the same line, and the IP can change.

## The Docker trap

Here is the part that makes many people conclude, wrongly, that "the container does not work on the network".

I will show it with a measurement. I started two identical nginx containers, on the same machine, changing **one thing only** in how the port is published:

```bash
# container A: pinned to loopback
docker run -d --name teste-loopback -p 127.0.0.1:8081:80 nginx:alpine

# container B: all interfaces
docker run -d --name teste-all -p 8082:80 nginx:alpine
```

Notice the difference. In container A I wrote `127.0.0.1:8081:80`. In B, just `8082:80`, with no address in front.

Docker records the difference plainly:

```text
teste-loopback   127.0.0.1:8081->80/tcp
teste-all        0.0.0.0:8082->80/tcp, [::]:8082->80/tcp
```

`127.0.0.1` is loopback: this machine only. `0.0.0.0` is every interface, meaning everyone who can reach this machine on the network.

### The measurement

I tested connections to both, the same way. The result:

```text
127.0.0.1:8081          connected  (loopback, pinned to the host)
192.168.1.198:8081     REFUSED    (LAN IP reaching loopback)
mac-mini-server.local:8081  REFUSED    (by name, same destination)

127.0.0.1:8082          connected  (all interfaces)
192.168.1.198:8082     connected  (LAN IP)
mac-mini-server.local:8082  connected  (by name)
```

Read the second line carefully. The machine's address on the network **refused** a connection on port 8081, even though the container was running and answering on `127.0.0.1:8081`.

That explains the confusing symptom. You log into the machine, test `curl localhost:8081`, it works, and you conclude everything is fine. From the laptop, on the couch, it does not open. You blame the firewall, the router, mDNS. The problem was in the first command.

### The rule

When publishing a port in Docker, **do not write an address in front** unless you want to restrict it:

```bash
# reachable from the network (what you want in most cases)
-p 8082:80

# this machine only (for databases and internal services)
-p 127.0.0.1:5432:5432
```

The second form has legitimate use. A database only the local application talks to **should** stay on `127.0.0.1`, because nobody else needs to speak to it and loopback reduces the exposed surface. The rule is not to never use it, it is to choose knowing what it does.

### The order of the ports

A confusion that shows up right after. The format is `outside-port:inside-port`:

```bash
-p 8080:80
```

That means: arrive at port 8080 on your machine, deliver to port 80 in the container. The two are not the same thing. The container has its own port system, isolated.

And there is a detail about `.local` worth knowing here: the name resolves to the **machine's** address, never to the container. You publish a port so the container becomes reachable at that address. The container does not get a `.local` of its own, because mDNS announces network interfaces, and a container has no interface on your LAN by default.

## Wrapping up the essentials

For reaching a service from inside your own network, three steps do it:

1. **Name:** on macOS and devices with Bonjour, use `.local` and nothing else is needed. Check the name with `scutil --get LocalHostName`.
2. **Port:** publish without an address in front, `-p 8082:80`, so the network can reach it.
3. **Always test from the other device.** The test that counts is from another machine, never from `localhost` on the machine itself.

## What this post leaves for later

Two things were left out, and it is honest to say why.

When you want a fixed name across several devices, with `.lan` or `casa.lab`, you need internal DNS. And when you want a clean address, with no port number at the end, you need a reverse proxy in front. Both deserve their own post, with a server actually built.

There is also a limitation that already showed up in the test: everything demonstrated here works **only inside your network**. `.local` is link-local by definition, which is the reason it is simple and, at the same time, the reason it does not work from outside. That is a feature, not a defect.

## Sources and links

- [RFC 6762: Multicast DNS](https://www.rfc-editor.org/rfc/rfc6762.txt) (IETF, February 2013), which reserves `.local` for mDNS, defines the multicast at `224.0.0.251:5353` and names `.intranet`, `.internal`, `.private`, `.corp`, `.home` and `.lan` as suffixes used on private networks
- [RFC 8375: Special-Use Domain 'home.arpa.'](https://www.rfc-editor.org/rfc/rfc8375.txt) (IETF, May 2018), which designates a suffix with normative backing for residential use
- [RFC 6761: Special-Use Domain Names](https://www.rfc-editor.org/rfc/rfc6761.txt) (IETF, February 2013), which defines the special handling of names with universal properties
- [Docker documentation: publishing ports](https://docs.docker.com/engine/network/#published-ports), on the difference between publishing on `127.0.0.1` and on all interfaces
