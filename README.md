# 🌀 DistroURL

**DistroURL** is a high-performance, scalable, and distributed URL shortener built with Node.js, Redis, ZooKeeper, and MongoDB. It supports advanced features like:

- One-time links
- Expiry-based short URLs
- Password-protected redirection
- Cached short URLs using Redis
- QR code generation for easy sharing
- Horizontally scalable architecture using distributed ID generation

---

## 🔗 Architecture Overview

DistroURL follows a distributed system architecture using:

- **ZooKeeper** for consistent, distributed token range allocation.
- **Redis** for caching and rapid short URL lookup.
- **MongoDB** to persist short URL metadata.
- **Express.js** as the backend HTTP server.
- **Next.js** for the frontend (UI).
- **Fast-CSV** for optional bulk input/output.

### 🔗 Flow of Short URL Generation

1. ZooKeeper assigns a unique token range to each backend instance.
2. Tokens are converted to base62 hashes.
3. Metadata is saved to MongoDB and cached in Redis.
4. A QR code is generated for the shortened URL.

### 🔗 Flow of Short URL Redirection

1. When a user accesses a short URL:
   - Redis is checked first for cached metadata.
   - If not found, MongoDB is queried and data is cached.
   - Password and expiry are validated.
   - One-time links are deleted after use.

---

## ⚙️ Tech Stack

| Tech       | Purpose                      |
| ---------- | ---------------------------- |
| Node.js    | Backend runtime              |
| Express.js | REST API framework           |
| MongoDB    | URL metadata storage         |
| Redis      | URL caching                  |
| ZooKeeper  | Distributed token management |
| Fast-CSV   | Bulk CSV operations          |
| Next.js    | Frontend framework           |
| TypeScript | Safer JavaScript             |

---

## 🔗 Features

- ✅ Custom short URL generation
- ✅ Password-protected URLs
- ✅ Expiry-based redirection
- ✅ One-time access links
- ✅ Redis-based caching for fast lookup
- ✅ Distributed token generation using ZooKeeper
- ✅ QR code generation for each short URL
- ✅ Scalable microservices-ready backend
- ✅ Frontend UI built with Next.js

---

## 🔗 Planned Features

- ❌ Visit count tracking using Redis-backed queue
- ❌ User authentication with JWT
- ❌ Analytics dashboard per user
- ❌ Bulk CSV upload for short URLs
- ❌ Docker & Docker Compose support

---

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js >= 18
- MongoDB instance
- Redis instance
- ZooKeeper instance

### 2. Clone and Install

```bash
git clone https://github.com/alucard017/DistroURL.git
cd DistroURL
```
