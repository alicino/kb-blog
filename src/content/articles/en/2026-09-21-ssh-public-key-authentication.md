---
title: "SSH public key authentication: essential security for your servers"
description: "Learn how to create, install, and manage SSH keys. A complete guide covering ssh-keygen, ed25519 vs RSA, ssh-copy-id, server hardening, and best practices."
publishDate: 2026-09-21
author: "Alicino"
category: "Segurança"
tags: ["SSH", "public key", "ed25519", "RSA", "server", "security", "Linux", "OpenSSH"]
draft: false
---

<img src="/assets/img/2026-09-21-ssh-chaves-servidor-seguro-1.png" alt="SSH e chaves: a segurança essencial para servidores" style="width:80%;height:auto;display:block;margin:2rem auto" />

Keeping a server accessible over the internet without compromising security is one of the first challenges anyone managing infrastructure faces. The root user password, no matter how strong, is a known attack vector. Botnets scan the internet constantly, trying common username and password combinations.

The standard solution is SSH public key authentication. Instead of a password, you use a cryptographic key pair. One key stays with you, never leaves your computer. The other goes to the server. Without the private key, nobody can log in.

This article covers everything from key generation to full server hardening, including algorithm selection, multiple key management, and daily use with ssh-agent.

## Choosing the algorithm: Ed25519 or RSA

When generating an SSH key, the first decision is the algorithm. The two modern options are Ed25519 and RSA.

**Ed25519** is the recommended choice for virtually every case in 2026. Keys are fixed at 256 bits, producing a public key of only 68 characters. Generation is instant. Signing operations are 20 to 30 times faster than RSA. The algorithm was designed to be resistant to timing attacks and to random number generation failures that affect ECDSA.

**RSA** is still necessary in one situation: when the target server runs an OpenSSH version older than 6.5 (2014). This includes very old systems like CentOS 6, some embedded network equipment, and legacy appliances. If you must use RSA, never generate with less than 4096 bits.

| Characteristic | Ed25519 | RSA 4096 |
|---|---|---|
| Security level | ~128 bits | ~128 bits |
| Public key size | 68 characters | ~740 characters |
| Generation time | 5 to 10 ms | 2 to 5 seconds |
| Signing speed | Very fast | Slow |
| Compatibility | OpenSSH 6.5+ (2014) | Universal |
| Side-channel resistance | Excellent | Good (requires care) |

**ECDSA** exists as an alternative, but there is no reason to prefer it over Ed25519. The NIST curves used by ECDSA have a history of controversy, and the algorithm is vulnerable to private key leakage if the random number generator fails during signing.

**DSA** is a broken algorithm and was disabled in OpenSSH 7.0. Never use it.

## Creating the key with ssh-keygen

### Generating an Ed25519 key (recommended)

```bash
ssh-keygen -t ed25519 -C "your@email.com"
```

- `-t ed25519` selects the Ed25519 algorithm
- `-C "comment"` adds a comment to the public key. Use your email or a descriptive identifier. This helps identify the key in the server's `authorized_keys` file

The command asks where to save the key (default `~/.ssh/id_ed25519`) and for a passphrase. **Always use a passphrase.** Without it, the private key is stored unencrypted on disk. If someone steals the file, they have immediate access to every server using that key.

### Generating an RSA key (legacy systems only)

```bash
ssh-keygen -t rsa -b 4096 -C "legacy-server"
```

- `-b 4096` sets the key size. The default for RSA in `ssh-keygen` is still 3072, but 4096 is recommended for use through 2030

### Additional ssh-keygen parameters

- `-f ~/.ssh/key_name` saves the key with a custom filename instead of the default
- `-N ""` sets the passphrase on the command line (avoid in scripts unless strictly necessary)
- `-p` changes the passphrase of an existing key
- `-y` extracts the public key from a private key
- `-l` shows the key fingerprint

### Verifying the generated key

```bash
# Show the fingerprint
ssh-keygen -l -f ~/.ssh/id_ed25519

# Show the public key
cat ~/.ssh/id_ed25519.pub
```

## Installing the key on the server

### With ssh-copy-id (recommended)

The `ssh-copy-id` command copies your public key to the server's `~/.ssh/authorized_keys` file:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
```

It asks for the user password one last time (if still enabled), installs the key, and tests that the login works.

### Manually

If the server does not have `ssh-copy-id` installed, you can do it manually:

```bash
# On your computer, read the public key
cat ~/.ssh/id_ed25519.pub

# Copy the displayed text.

# On the server, add it to authorized_keys
echo "copied_public_key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Permissions matter. OpenSSH refuses keys if the `authorized_keys` file or the `.ssh` directory has overly open permissions.

## Testing key-based login

```bash
ssh user@server
```

If key authentication is working, you log in without a password. If you set a passphrase, SSH asks for the private key passphrase, not the user password on the server.

## Using ssh-agent to avoid typing the passphrase every time

Typing the passphrase on every connection is secure but inconvenient. `ssh-agent` solves this by keeping the decrypted key in memory during your session:

```bash
# Start the agent
eval "$(ssh-agent -s)"

# Add the key (asks for the passphrase once)
ssh-add ~/.ssh/id_ed25519
```

From then on, all SSH connections in the current session use the key without asking for the passphrase again.

On macOS, ssh-agent already runs as a system service. You can add the key permanently with:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

## Managing multiple keys

If you have different keys for different servers (one for work, one for personal servers, one for GitHub), the `~/.ssh/config` file organizes everything:

```
Host personal-server
    HostName 192.168.1.100
    User alicino
    IdentityFile ~/.ssh/id_ed25519_personal

Host work-server
    HostName server.example.com
    User alicino
    IdentityFile ~/.ssh/id_ed25519_work

Host github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

With this file, you connect with:

```bash
ssh personal-server
```

SSH automatically knows which key and which user to use.

## Server hardening: disabling password and root login

After installing the key and confirming the login works, the next step is hardening the SSH configuration on the server.

Edit `/etc/ssh/sshd_config` on the server:

```bash
sudo nano /etc/ssh/sshd_config
```

Change or add these lines:

```
# Disable password login
PasswordAuthentication no

# Disable root login
PermitRootLogin no

# Allow only specific users
AllowUsers alicino

# Use only SSH version 2
Protocol 2

# Disable challenge-response authentication
ChallengeResponseAuthentication no

# Limit authentication attempts
MaxAuthTries 3

# Use only keys from authorized_keys
PubkeyAuthentication yes

# Disable host-based authentication
HostbasedAuthentication no

# Ignore .rhosts
IgnoreRhosts yes
```

After making changes, restart the SSH service:

```bash
sudo systemctl restart sshd
```

**Important:** never close the current session before testing the new connection in another terminal. If something goes wrong, you still have the open session to fix it.

### Testing the hardening

```bash
# In another terminal, try password login (should fail)
ssh -o PreferredAuthentications=password user@server

# Try logging in as root (should fail)
ssh root@server
```

Both should return "Permission denied." The only access method should be your key.

## Additional best practices

**Rotate keys regularly.** Once a year is good for general use, quarterly for production environments. Rotation limits the damage if a key leaks without your knowledge.

**Never copy the private key to servers.** The private key should never leave your local machine. If you need access from another computer, generate a new key for it and add the public key to the server.

**Use a different key for each service.** One key for GitHub, another for personal servers, another for work servers. If one leaks, the others remain safe.

**Revoke keys from people who left the team.** Remove the public key from `authorized_keys` on every server.

**Do not use `ssh -A` (AgentForwarding) unnecessarily.** SSH agent forwarding gives the remote server access to your keys. Use it only when needed and never on servers you do not control.

## Useful links

- OpenSSH official documentation: [openssh.com](https://www.openssh.com)
- `ssh-keygen` man page: [man.openbsd.org/ssh-keygen](https://man.openbsd.org/ssh-keygen)
- `sshd_config` man page: [man.openbsd.org/sshd_config](https://man.openbsd.org/sshd_config)
- CIS SSH hardening guide: [cisecurity.org](https://www.cisecurity.org)
- Mozilla SSH guidelines: [infosec.mozilla.org/guidelines/openssh](https://infosec.mozilla.org/guidelines/openssh)

## Conclusion

SSH public key authentication is the foundation of secure server administration. With a single command (`ssh-keygen -t ed25519`) you generate a key that, combined with the correct server configuration, eliminates the risk of brute force password attacks and unauthorized access.

The practical sequence is: generate an Ed25519 key, install it with `ssh-copy-id`, test the login, disable password and root on the server. For daily use, configure `ssh-agent` and the `~/.ssh/config` file so you do not have to type parameters every time.

And remember: the private key is the digital equivalent of your house key. Do not share it, do not copy it to servers, and change the lock from time to time.