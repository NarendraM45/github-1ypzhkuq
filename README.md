<div align="center">
  <img src="./public/logo.png" alt="MockDrop Logo" width="120" height="120">
  <h1>MockDrop</h1>
  <p><b>Instant mock APIs. Zero backend friction.</b></p>

  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
  <a href="https://mockdrop.duckdns.org/"><img src="https://img.shields.io/badge/Live-mockdrop.duckdns.org-22c55e" alt="Live Website"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue" alt="React + Vite"></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/Backend-PHP%208.x-purple" alt="PHP 8.x"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/Database-MySQL-orange" alt="MySQL"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/FOSS-Yes-10b981" alt="FOSS"></a>
</div>

<br />

**MockDrop** is a fast, local-first platform for frontend developers and testers to generate temporary APIs in seconds.  
Design payloads in a modern animated UI, keep workspace data in IndexedDB, and deploy real HTTP mock endpoints through a PHP + MySQL backend.

🔗 **Live website:** [https://mockdrop.duckdns.org/](https://mockdrop.duckdns.org/)

🌍 **Open Source (FOSS):** MockDrop is a free and open-source software project under the MIT License.

---

## ✨ Features

### 🎨 Frontend (React / Vite)
- **Local-First Workflow:** Workspaces and logs are stored locally for instant speed.
- **Monaco JSON Editor:** Rich JSON authoring, formatting, and validation.
- **Dynamic Endpoint Controls:** HTTP status, response delay, CORS, and expiry options.
- **Developer Productivity:** Command palette, shortcuts, and code snippets (`fetch`, `axios`, `curl`).
- **Polished UI:** Smooth transitions, interactive cards, and a dedicated animated developers page.

### ⚙️ Backend (PHP / MySQL)
- **Optimized PHP 8 Endpoints:** Fast create/serve/log/delete operations.
- **Persistent Storage:** MySQL persistence via PDO prepared statements.
- **Request Monitoring:** Endpoint-wise logs with timestamp and response time.
- **Automated Cleanup:** Cron-based expiry cleanup for stale mocks.
- **Built-in Security:** Rate limiting, payload size caps, and Cloudflare Turnstile CAPTCHA integration out of the box.

---

## 🏗️ Architecture & Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, IndexedDB (`idb`), Monaco Editor |
| Backend API | PHP 8.x, Apache (`.htaccess`), JSON endpoints |
| Database | MySQL / MariaDB |
| Hosting | AWS EC2 (`t3.micro`) + Apache + PHP + MySQL (LAMP) |

---

## ☁️ Deployment (Production)

MockDrop is currently deployed on **AWS EC2 `t3.micro`**:

- **Instance type:** `t3.micro`
- **OS/Stack:** Ubuntu + Apache + PHP 8.x + MySQL
- **Public URL:** [https://mockdrop.duckdns.org/](https://mockdrop.duckdns.org/)
- **Routing:** Apache + `.htaccess` inside `backend/`
- **Scheduled cleanup:** `cron` runs cleanup for expired endpoints

---

## 🚀 Quick Setup

### 1) Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### 2) Backend / Database
1. Place the `backend/` folder in your server web root.
2. Import `backend/db/schema.sql` into MySQL.
3. Copy `backend/.env.example` to `backend/.env` and fill in your database credentials and `TURNSTILE_SECRET`.
4. (Optional) Update `TURNSTILE_SITE_KEY` inside `src/components/mockdrop/Editor.tsx` with your public Cloudflare key.
5. Set cleanup cron:
   ```cron
   * * * * * php /path/to/backend/cron/cleanup.php >> /dev/null 2>&1
   ```

### 3) Connect frontend to backend
Update API base URL in `src/lib/api.ts`:

```ts
export const API_URL = "https://your-domain-or-ip";
```

---

## 🔌 Core Backend API

Current frontend integration uses these backend endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/create.php` | Create a new mock endpoint and return hash/url metadata. |
| `GET` | `/api/serve.php?hash={hash}` | Return configured JSON payload with selected delay/status/CORS behavior. |
| `GET` | `/api/logs.php?hash={hash}` | Fetch request logs for a specific endpoint hash. |
| `POST` / `DELETE` | `/api/delete.php` | Delete an active endpoint (implementation-dependent auth/validation). |

---

## 🛡️ Security Notes
- **CAPTCHA Protection:** Cloudflare Turnstile invisible CAPTCHA is integrated to prevent bot spam on endpoint creation.
- **Rate Limiting:** Built-in IP-based rate limiting (15 creates/min, 60 requests/min).
- **Payload Caps:** Endpoints are strictly capped at 50KB JSON payloads to prevent disk exhaustion.
- **Hardened Setup:** We recommend running behind strict Apache headers (CSP, HSTS) and isolated DB privileges (No DROP/ALTER).
- **Database Safety:** SQL queries use prepared statements to eliminate SQL injection risks.
- **Isolation:** Sensitive backend files (`.env`, config) are isolated under `backend/` using Apache `.htaccess` rules.

---

## 🧪 Project Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests once
npm run lint       # ESLint
```

---

## 🤝 Open Source

MockDrop is **FOSS** (Free and Open Source Software).  
You are welcome to use, modify, self-host, and contribute.

---
## 👨‍💻 Developers

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/NarendraM45">
        <img src="https://github.com/NarendraM45.png" width="100px;" alt="Narendra"/><br />
        <sub><b>Narendra</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/KrishnakantYadav00">
        <img src="https://github.com/KrishnakantYadav00.png" width="100px;" alt="Pablo Yadav"/><br />
        <sub><b>Pablo (Krishnakant) Yadav</b></sub>
      </a>
    </td>
  </tr>
</table>

> Built with ❤️ by developers, for developers.


