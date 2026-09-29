# Secure Record Storage - Notes API

A secure REST API for managing personal notes with user authentication and authorization. Each user can only access, create, update, and delete their own notes.

## Features

- **User Authentication** - JWT-based registration and login
- **Note Ownership** - Notes are associated with their creator
- **Authorization** - Users can only access their own notes (403 Forbidden for cross-user access)
- **Full CRUD** - Create, Read, Update, Delete notes

---

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose** (ODM)
- **JWT** (jsonwebtoken) for authentication
- **bcrypt** for password hashing

---

## Project Structure

```
.
├── config/
│   └── connection.js      # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   └── Note.js            # Note schema (with user reference)
├── routes/
│   ├── api/
│   │   ├── userRoutes.js  # /api/users (register, login)
│   │   └── noteRoutes.js  # /api/notes (CRUD + auth)
│   └── index.js           # Route aggregator
├── utils/
│   └── auth.js            # JWT middleware & token utilities
├── server.js              # Entry point
└── .env                   # Environment variables
```

---

## API Endpoints

### Authentication (`/api/users`)

| Method | Endpoint    | Description        | Auth |
| ------ | ----------- | ------------------ | ---- |
| POST   | `/register` | Register new user  | No   |
| POST   | `/login`    | Login, returns JWT | No   |

### Notes (`/api/notes`) - **Requires Bearer Token**

| Method | Endpoint | Description                             |
| ------ | -------- | --------------------------------------- |
| GET    | `/`      | Get all notes for authenticated user    |
| POST   | `/`      | Create new note (auto-assigned to user) |
| GET    | `/:id`   | Get single note (owner only)            |
| PUT    | `/:id`   | Update note (owner only)                |
| DELETE | `/:id`   | Delete note (owner only)                |

---

## Data Models

### User

```javascript
{
  username: String (required, unique, trimmed),
  email: String (required, unique, valid format),
  password: String (required, min 5 chars, hashed),
  createdAt: Date
}
```

### Note

```javascript
{
  title: String (required, trimmed),
  content: String (required),
  user: ObjectId (ref: 'User', required),  // Owner reference
  createdAt: Date
}
```

---

## Authentication & Tokens

### How It Works

1. **Register/Login** → Server returns a **JWT token**
2. **Every subsequent request** → Include token in `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. **Middleware** (`authMiddleware`) validates token and attaches `req.user = { _id, username, email }`

### Token Details

- **Algorithm**: HS256
- **Expiration**: 2 hours
- **Payload**: `{ username, email, _id }`
- **Secret**: Stored in `.env` as `JWT_SECRET`

### Token Handling Best Practices

| Do                                           | Don't                                  |
| -------------------------------------------- | -------------------------------------- |
| Store token in memory (React state, Vue ref) | Store in localStorage (XSS vulnerable) |
| Send via `Authorization: Bearer` header      | Send in URL query params               |
| Use HTTPS in production                      | Use HTTP in production                 |
| Implement token refresh logic                | Use tokens with no expiration          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- `.env` file with:
  ```
  MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dbname
  PORT=3000
  JWT_SECRET=your-super-secret-jwt-token
  ```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev      # with nodemon (if configured)
# OR
node server.js   # production
```

Server runs at `http://localhost:3000`

---

## Testing Guide (Postman)

### Option 1: Import Postman Collection (Fastest)

1. Open Postman → **Import** → Paste the JSON from the "Postman Collection JSON" section below
2. Collection auto-creates variables: `baseUrl`, `tokenA`, `tokenB`, `noteIdA`
3. Select the **Secure Notes Local** environment
4. Run requests in order (1→16)

### Option 2: Manual Postman Setup

#### **Environment Variables**

Create an environment called `Secure Notes Local`:
| Variable | Initial Value |
|----------|---------------|
| `baseUrl` | `http://localhost:3000` |
| `tokenA` | _(leave empty)_ |
| `tokenB` | _(leave empty)_ |
| `noteIdA` | _(leave empty)_ |

---

### **Test Sequence in Postman**

#### **1. Register User A**

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/users/register`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "username": "usera",
  "email": "usera@test.com",
  "password": "password123"
}
```

#### **2. Register User B**

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/users/register`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "username": "userb",
  "email": "userb@test.com",
  "password": "password123"
}
```

#### **3. Login User A** (if needed)

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/users/login`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "usera@test.com",
  "password": "password123"
}
```

#### **4. Login User B** (if needed)

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/users/login`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "userb@test.com",
  "password": "password123"
}
```

#### **5. Create Note as User A** (run 2x)

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/notes`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{tokenA}}`
- **Body**:

```json
{
  "title": "My First Note",
  "content": "Secret content from A"
}
```

#### **6. Create Note as User B**

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/notes`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{tokenB}}`
- **Body**:

```json
{
  "title": "User B Note",
  "content": "Content from B"
}
```

---

### **Verify Isolation Tests**

#### **7. GET All Notes as User A**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notes`
- **Headers**: `Authorization: Bearer {{tokenA}}`
- **Expected**: 200 with array of only User A's notes

#### **8. GET All Notes as User B**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notes`
- **Headers**: `Authorization: Bearer {{tokenB}}`
- **Expected**: 200 with array of only User B's notes

---

### **Cross-User Access Tests (Expect 403)**

#### **9. GET Single Note - Cross User**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**: `Authorization: Bearer {{tokenB}}`
- **Expected**: **403** `{"message":"User is not authorized to view this note."}`

#### **10. PUT Other's Note - Cross User**

- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{tokenB}}`
- **Body**:

```json
{
  "title": "Hack Attempt",
  "content": "Should fail"
}
```

- **Expected**: **403** `{"message":"User is not authorized to update this note."}`

#### **11. DELETE Other's Note - Cross User**

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**: `Authorization: Bearer {{tokenB}}`
- **Expected**: **403** `{"message":"User is not authorized to delete this note."}`

---

### **Owner Access Tests (Expect 200)**

#### **12. GET Single Note - Owner**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**: `Authorization: Bearer {{tokenA}}`
- **Expected**: 200 with note data

#### **13. PUT Own Note**

- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{tokenA}}`
- **Body**:

```json
{
  "title": "Updated by Owner",
  "content": "Updated content"
}
```

- **Expected**: 200 with updated note

#### **14. DELETE Own Note**

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**: `Authorization: Bearer {{tokenA}}`
- **Expected**: 200 `{"message":"Note deleted!"}`

#### **15. Verify Deleted**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notes/{{noteIdA}}`
- **Headers**: `Authorization: Bearer {{tokenA}}`
- **Expected**: **404** `{"message":"No note found with this id!"}`

---

### **Postman Collection JSON** (Import this)

```json
{
  "info": {"name": "Secure Notes API Tests", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3000"},
    {"key": "tokenA", "value": ""},
    {"key": "tokenB", "value": ""},
    {"key": "noteIdA", "value": ""}
  ],
  "item": [
    {"name": "1. Register User A", "event": [{"listen": "test", "script": {"exec": ["if (pm.response.code === 201) {", "  pm.environment.set('tokenA', pm.response.json().token);", "}"]}}], "request": {"method": "POST", "url": "{{baseUrl}}/api/users/register", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"username\":\"usera\",\"email\":\"usera@test.com\",\"password\":\"password123\"}"}}},
    {"name": "2. Register User B", "event": [{"listen": "test", "script": {"exec": ["if (pm.response.code === 201) {", "  pm.environment.set('tokenB', pm.response.json().token);", "}"]}}], "request": {"method": "POST", "url": "{{baseUrl}}/api/users/register", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"username\":\"userb\",\"email\":\"userb@test.com\",\"password\":\"password123\"}"}}},
    {"name": "3. Login User A", "event": [{"listen": "test", "script": {"exec": ["if (pm.response.code === 200) {", "  pm.environment.set('tokenA', pm.response.json().token);", "}"]}}], "request": {"method": "POST", "url": "{{baseUrl}}/api/users/login", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"email\":\"usera@test.com\",\"password\":\"password123\"}"}}},
    {"name": "4. Login User B", "event": [{"listen": "test", "script": {"exec": ["if (pm.response.code === 200) {", "  pm.environment.set('tokenB', pm.response.json().token);", "}"]}}], "request": {"method": "POST", "url": "{{baseUrl}}/api/users/login", "header": [{"key": "Content-Type", "value": "application/json"}], "body": {"mode": "raw", "raw": "{\"email\":\"userb@test.com\",\"password\":\"password123\"}"}}},
    {"name": "5. Create Note as A (1)", "event": [{"listen": "test", "script": {"exec": ["if (pm.response.code === 201) {", "  const noteId = pm.response.json()._id;", "  if (!pm.environment.get('noteIdA')) {", "    pm.environment.set('noteIdA', noteId);", "  }", "}"]}}], "request": {"method": "POST", "url": "{{baseUrl}}/api/notes", "header": [{"key": "Content-Type", "value": "application/json"}, {"key": "Authorization", "value": "Bearer {{tokenA}}"]}, "body": {"mode": "raw", "raw": "{\"title\":\"Note 1 from A\",\"content\":\"Content A1\"}"}}},
    {"name": "6. Create Note as A (2)", "request": {"method": "POST", "url": "{{baseUrl}}/api/notes", "header": [{"key": "Content-Type", "value": "application/json"}, {"key": "Authorization", "value": "Bearer {{tokenA}}"]}, "body": {"mode": "raw", "raw": "{\"title\":\"Note 2 from A\",\"content\":\"Content A2\"}"}}},
    {"name": "7. Create Note as B", "request": {"method": "POST", "url": "{{baseUrl}}/api/notes", "header": [{"key": "Content-Type", "value": "application/json"}, {"key": "Authorization", "value": "Bearer {{tokenB}}"]}, "body": {"mode": "raw", "raw": "{\"title\":\"Note 1 from B\",\"content\":\"Content B1\"}"}}},
    {"name": "8. GET All Notes (A)", "request": {"method": "GET", "url": "{{baseUrl}}/api/notes", "header": [{"key": "Authorization", "value": "Bearer {{tokenA}}"}]}},
    {"name": "9. GET All Notes (B)", "request": {"method": "GET", "url": "{{baseUrl}}/api/notes", "header": [{"key": "Authorization", "value": "Bearer {{tokenB}}"}]}},
    {"name": "10. GET Single Note (Owner)", "request": {"method": "GET", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Authorization", "value": "Bearer {{tokenA}}"}]}},
    {"name": "11. GET Single Note (Cross-User → 403)", "request": {"method": "GET", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Authorization", "value": "Bearer {{tokenB}}"}]}},
    {"name": "12. PUT Own Note", "request": {"method": "PUT", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Content-Type", "value": "application/json"}, {"key": "Authorization", "value": "Bearer {{tokenA}}"}]}, "body": {"mode": "raw", "raw": "{\"title\":\"Updated by Owner\",\"content\":\"Updated\"}"}}},
    {"name": "13. PUT Other's Note (→ 403)", "request": {"method": "PUT", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Content-Type", "value": "application/json"}, {"key": "Authorization", "value": "Bearer {{tokenB}}"}]}, "body": {"mode": "raw", "raw": "{\"title\":\"Hack Attempt\",\"content\":\"Should fail\"}"}}},
    {"name": "14. DELETE Other's Note (→ 403)", "request": {"method": "DELETE", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Authorization", "value": "Bearer {{tokenB}}"}]}},
    {"name": "15. DELETE Own Note", "request": {"method": "DELETE", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Authorization", "value": "Bearer {{tokenA}}"}]}},
    {"name": "16. Verify Deleted (→ 404)", "request": {"method": "GET", "url": "{{baseUrl}}/api/notes/{{noteIdA}}", "header": [{"key": "Authorization", "value": "Bearer {{tokenA}}"}]}}]
}
```

---

### **Quick Import Steps**

1. Postman → **Import** → **Raw text** → Paste JSON above
2. Select **Secure Notes Local** environment
3. Run requests **in order** (1→16)
4. Check **Test Results** tab for pass/fail
