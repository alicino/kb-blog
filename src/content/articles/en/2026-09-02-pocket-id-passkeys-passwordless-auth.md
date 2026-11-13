---
title: "Pocket ID: Passwordless Authentication with Passkeys"
description: "Learn how to implement passwordless authentication with passkeys using Pocket ID. Installation, configuration, and integration patterns for secure auth without passwords."
publishDate: 2026-09-02
author: "Alicino"
category: "Segurança"
tags: ["authentication", "passkeys", "pocket-id", "security", "passwordless", "webauthn"]
draft: false
---

Passwords have been the standard for authentication since the internet started. And they're fundamentally broken. Users reuse the same password everywhere. They forget them. Attackers steal them. Phishing campaigns succeed because people still fall for the "click here to reset your password" email.

In 2023, the FIDO Alliance, Google, Apple, and Microsoft announced they were coordinating on passkeys. A passwordless authentication method based on public key cryptography, built into every operating system, and basically immune to phishing.

The catch: implementing passkeys properly requires either integrating with the big tech companies (Google, Apple, Microsoft) or running your own authentication server. That's where Pocket ID comes in.

Pocket ID is an open source authentication server written in Go that supports passkeys out of the box. You run it on your infrastructure. You integrate it with your app. Your users authenticate without passwords.

## Understanding Pocket ID

Pocket ID is an open source authentication server designed for passkey-based authentication. The key features you actually care about: it's self-hosted, supports passkeys natively, can fall back to passwords if needed, lets users register multiple passkeys across different devices, has a clean API, speaks OAuth 2.0 and OIDC, and it's lightweight.

Find it at github.com/nhardy/pocket-id, available under AGPL-3.0.

## How passkeys actually work

Before you integrate Pocket ID, understand what's happening under the hood.

A passkey is a cryptographic key pair stored securely on your device. Think of it like your fingerprint but digital. The private key never leaves the device. The public key gets shared. Here's the flow:

You try to log in. The server sends you a random challenge. Your device signs that challenge with your private key. Your device sends back the signature. The server verifies the signature using your public key. You're logged in.

No password ever traveled over the network. Nothing to steal. Nothing to guess.

This is the WebAuthn standard. Every major browser supports it. Every major operating system supports it.

Why is it secure? Your private key never leaves the device. The signature can't be forged. Each website gets a unique key, so passkeys don't work for cross-site phishing. There's no password to brute force. It works with biometrics like fingerprints and face recognition.

## Getting Pocket ID running

If you're using Docker:

```bash
docker run -d \
  --name pocket-id \
  -p 3333:3333 \
  -e POCKET_ID_DOMAIN=auth.example.com \
  -e POCKET_ID_ISSUER_URL=https://auth.example.com \
  -v pocket-id-data:/app/data \
  nhardy/pocket-id:latest
```

Or download the binary directly from releases and run it:

```bash
wget https://github.com/nhardy/pocket-id/releases/download/v0.4.1/pocket-id-linux-amd64
chmod +x pocket-id-linux-amd64
./pocket-id-linux-amd64
```

You need to set some environment variables:

```bash
POCKET_ID_DOMAIN=auth.example.com
POCKET_ID_ISSUER_URL=https://auth.example.com
POCKET_ID_JWT_SECRET=some-secret-key-here
POCKET_ID_DATABASE_URL=sqlite:///app/data.db
POCKET_ID_LISTEN_ADDR=0.0.0.0:3333
POCKET_ID_PORT=3333
```

For production use PostgreSQL and HTTPS:

```bash
export POCKET_ID_DATABASE_URL=postgresql://user:pass@localhost/pocket_id
export POCKET_ID_ISSUER_URL=https://auth.example.com
export POCKET_ID_TLS_CERT=/path/to/cert.pem
export POCKET_ID_TLS_KEY=/path/to/key.pem
```

## Integrating with your web app

Your login page has a button or link:

```html
<a href="https://auth.example.com/authorize?
  response_type=code&
  client_id=my-app&
  redirect_uri=https://myapp.example.com/callback&
  scope=openid%20profile%20email">
  Sign in with Passkey
</a>
```

When users click it, they're sent to Pocket ID. They authenticate. Pocket ID redirects back to your callback URL with a code:

```javascript
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: 'my-app',
      client_secret: 'your-client-secret',
      redirect_uri: 'https://myapp.example.com/callback',
    }),
  });

  const { access_token, id_token } = await response.json();
  const user = jwt_decode(id_token);

  req.session.userId = user.sub;
  res.redirect('/dashboard');
});
```

Protect your routes:

```javascript
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('dashboard');
});
```

## Mobile apps

For iOS and Android, use native libraries. With React Native:

```javascript
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

async function loginWithPasskey() {
  const redirectUrl = await WebBrowser.openAuthSessionAsync(
    `https://auth.example.com/authorize?response_type=code&client_id=my-mobile-app&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=openid+profile`,
    redirectUrl
  );

  const code = new URL(redirectUrl.url).searchParams.get('code');

  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: 'my-mobile-app',
      client_secret: 'your-client-secret',
      redirect_uri: redirectUrl,
    }),
  });

  const { access_token } = await response.json();
  await SecureStore.setItemAsync('access_token', access_token);
}
```

## Security matters

HTTPS is mandatory. Passkeys simply don't work over HTTP. Browsers won't allow it for security reasons.

Configure CORS properly:

```bash
export POCKET_ID_CORS_ORIGINS=https://myapp.example.com,https://another-app.com
```

Enable rate limiting to prevent brute force attempts:

```bash
export POCKET_ID_RATE_LIMIT_REQUESTS=10
export POCKET_ID_RATE_LIMIT_WINDOW=60s
```

For users who lose access to their passkey, generate backup codes:

```bash
curl -X POST https://auth.example.com/api/users/{userId}/backup-codes \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Troubleshooting

Check system health:

```bash
curl https://auth.example.com/health
```

List users:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://auth.example.com/api/users
```

Enable debug logging:

```bash
export POCKET_ID_LOG_LEVEL=debug
```

## Migrating from passwords

If you already have password-based authentication, migration is gradual:

First, let users register a passkey alongside their password. Then on login, prompt them to set up a passkey. Make passkey required for new signups. Finally after a year or so, deprecate passwords.

The phased approach looks like:

```javascript
app.post('/api/register-passkey', async (req, res) => {
  const userId = req.session.userId;
  const user = await db.getUser(userId);
  
  if (user.passkey_registered) {
    return res.status(400).json({ error: 'Already registered' });
  }

  const challenge = crypto.randomBytes(32);
  await db.saveChallenge(userId, challenge);

  res.json({
    challenge: challenge.toString('base64'),
    userId: userId,
    userName: user.email,
  });
});
```

## Real talk about limitations

Passkeys aren't synced across browsers yet. A passkey you set up in Chrome doesn't work in Firefox. Users need to register passkeys on each device or browser they use.

If users lose their phone, they can't log in unless they have backup codes. This is actually more secure than passwords (where password recovery is a whole mess) but it's something to explain to users upfront.

Older browsers don't support WebAuthn. If you need to support IE 11 or something, fall back to passwords for those browsers.

## Putting it all together

Pocket ID makes passwordless authentication accessible for teams that want to self-host. Passkeys eliminate phishing, eliminate password reuse problems, and improve security without making the login experience worse.

If you're managing passwords and tired of the operational burden, Pocket ID is worth exploring.
