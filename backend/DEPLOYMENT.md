# MockDrop Backend Deployment Guide

Congratulations! The PHP 8.x + MySQL backend for MockDrop has been generated. Follow these steps to get it running on your LAMP stack, cPanel, or DigitalOcean Droplet.

## 1. Local / Server Setup

1. **Upload the files**: Copy the entire `/backend` folder to your server's web root (e.g., `/public_html` or `/var/www/html/backend`).
2. **Database Import**: 
   - Open phpMyAdmin or use MySQL CLI.
   - Run the script located at `backend/db/schema.sql`. This will create the `mockdrop` database and the necessary tables (`mock_endpoints` and `request_logs`).
3. **Environment Configuration**:
   - Copy `backend/.env.example` to `backend/.env`.
   - Update the variables according to your environment:
     ```ini
     DB_HOST=127.0.0.1
     DB_NAME=mockdrop
     DB_USER=your_db_username
     DB_PASS=your_db_password
     APP_URL=https://yourdomain.com
     SECRET_KEY=generate_a_random_string_here
     ```
   - *Note on Shared Hosts:* If your host doesn't let you place `.env` safely above the web root, our `.htaccess` restricts access to files starting with a dot `.`, protecting `.env` from direct web exposure.

## 2. Apache and .htaccess

Ensure that your Apache virtual host configuration has `AllowOverride All` enabled for your backend directory, otherwise `.htaccess` rewrite rules will be ignored!. Additionally, ensure `mod_rewrite` is enabled. You can enable it on Ubuntu via:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## 3. Setup Cron Job
To automatically delete mock endpoints that have passed their expiration date, you need to set up a cron job.

On your server, open crontab: `crontab -e`
Add the following line (adjusting paths to match your server environment):
```cron
* * * * * php /path/to/your/backend/cron/cleanup.php >> /dev/null 2>&1
```

## 4. Frontend Integration Steps

You must update the MockDrop frontend React codebase to point toward your new PHP API endpoints.

**In `src/lib/mockdrop/store.ts`:**
Modify the `endpointUrl` export around line `127`:
```typescript
export const endpointUrl = (id: string) => `https://yourdomain.com/backend/api/${id}`;
```

*(Note that the frontend's original state layer handles storing drafts locally via IndexedDB, but when "Generating" a mock API link for the user, it should post to `create.php`, and read logs from `logs.php`. Be sure that subsequent fetches call these new backend endpoints according to the prompt spec!)*

## 5. cURL Testing Guide

Once set up, you can test the backend scripts using these curl commands:

### Create Endpoint (POST)
```bash
curl -X POST https://yourdomain.com/backend/api/create \
     -H "Content-Type: application/json" \
     -d '{
       "payload": "{ \"message\": \"Hello Server\" }",
       "label": "Test Mock",
       "status_code": 200,
       "delay_ms": 200,
       "cors_enabled": true,
       "expiry": "24h"
     }'
```

### Fetch Mock (GET)
Use the `hash` (e.g. `a7b8c9`) returned from the Create operation:
```bash
curl -X GET https://yourdomain.com/backend/api/a7b8c9
```

### View Logs (GET)
```bash
curl -X GET https://yourdomain.com/backend/api/a7b8c9/logs
```

### Delete Endpoint (DELETE)
Requires the `SECRET_KEY` specified in your `.env`.
```bash
curl -X DELETE https://yourdomain.com/backend/api/a7b8c9 \
     -H "X-Secret-Token: supersecretkey"
```
