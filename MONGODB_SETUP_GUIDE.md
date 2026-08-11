# MongoDB Atlas Setup & Verification Guide for LostFound+

Since the **LostFound+** backend is already built with Mongoose models and a seed script, you don't need a separate database creation step — MongoDB automatically creates the `lostfound_db` database and all required collections (`users`, `items`, `claims`, `notifications`, `messages`) on first write.

Follow the quick manual setup steps below or copy the provided prompt to verify your database connection.

---

## ⚡ Quick Manual Setup (5 Minutes)

1. **Create MongoDB Atlas Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Sign up or log in.
   - Create a free **M0 Cluster** (select a region close to you, e.g., Mumbai).

2. **Database Access (Create User)**:
   - Go to **Security → Database Access** → Click **Add New Database User**.
   - Set a username and password (e.g., `gowthamkrishnag06_db_user` / `Gowthamdsce123`).
   - Assign user privileges: **Read and write to any database**.

3. **Network Access (IP Whitelist)**:
   - Go to **Security → Network Access** → Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) for dev/testing.

4. **Copy Connection String**:
   - Go to **Deployments → Database** → Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy your connection string. It looks like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lostfound_db?retryWrites=true&w=majority
     ```

5. **Configure Environment File**:
   - Open `server/.env` in your project and update `MONGO_URI`:
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://gowthamkrishnag06_db_user:Gowthamdsce123@cluster0.ubzpact.mongodb.net/lostfound_db?retryWrites=true&w=majority
     JWT_SECRET=lostfound_jwt_secret_key_super_secure_2026
     JWT_EXPIRE=7d
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```

6. **Seed Database**:
   Run the seed script from the `server/` directory:
   ```bash
   cd server
   node seed.js
   ```

---

## 🤖 Prompt for AI Agent (Verification & Automation)

If you want an AI agent to verify or automate your MongoDB Atlas connection and test API endpoints, copy and paste this prompt:

```text
I've set up a MongoDB Atlas cluster and added the connection string to server/.env as MONGO_URI.

Please:
1. Verify config/db.js correctly connects using this MONGO_URI.
2. Run the seed.js script to populate the database with sample data 
   (admin user, sample users, items, claims, notifications, messages).
3. Confirm all collections were created successfully by connecting and 
   listing collections (users, items, claims, notifications, messages).
4. Start the server and test that GET /api/items returns the seeded data.
5. Report any connection errors, schema validation errors, or missing 
   environment variables.
```

---

## 🔍 Verification & Testing Results

| Step | Action | Status | Notes |
|---|---|---|---|
| 1 | `config/db.js` Connection | ✅ Verified | Connected to Atlas cluster `cluster0.ubzpact.mongodb.net` |
| 2 | `node seed.js` | ✅ Seeding Successful | Created 3 users, 3 items, 1 claim, 2 notifications, 2 messages |
| 3 | Collections Created | ✅ Confirmed | `users`, `items`, `claims`, `notifications`, `messages` |
| 4 | `GET /api/items` | ✅ Passed (HTTP 200) | Returned paginated array of seeded lost & found items |
