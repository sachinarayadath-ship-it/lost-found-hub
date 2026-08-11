# LostFound+ Practical Screen Recording & Viva Guide

This guide is your complete, step-by-step blueprint for screen-recording a full demonstration of **LostFound+** and acing technical viva questions. Every step specifies the exact screen, action, spoken transcript, technical point, code file pointers, and complete full-stack data flow execution.

---

## SECTION 1: Chronological Demo & Code Walkthrough

---

### STEP 1: Project Introduction

### 1. SCREEN
Browser tab showing the **LostFound+ Landing Page** (`http://localhost:5173/`).

### 2. ACTION
Hover cursor over the main hero heading *"Recover What Matters Most"*, point to the quick stats badges, and scroll gently down to the featured recent items grid.

### 3. WHAT TO SAY
"Welcome! Today I am presenting **LostFound+**, a full-stack community lost-and-found management platform built with React 19, Redux Toolkit, Node.js, Express.js, and MongoDB with Mongoose. LostFound+ solves a real-world community problem: helping people report lost belongings, verify ownership through structured claims, and moderate item handovers securely."

### 4. TECHNICAL POINT
"The application uses a decoupled MERN architecture where a Vite-powered single-page application communicates asynchronously via RESTful HTTP APIs with an Express backend connected to MongoDB Atlas."

#### Full-Stack Flow Trace
`Browser URL http://localhost:5173/` → `src/router.tsx` → `src/routes/__root.tsx` → `src/routes/index.tsx` → `Renders Hero & Feature Sections`

---

### STEP 2: Architecture & Codebase Overview

### 1. SCREEN
Switch to **VS Code Editor**. Open file tree showing `./src` and `./server`.

### 2. ACTION
Expand `./src` to show `routes/`, `services/api.ts`, and `store/`. Expand `./server` to show `models/`, `controllers/`, `routes/`, `middleware/`, and `server.js`.

### 3. WHAT TO SAY
"Let me briefly highlight our project structure. The repository is divided cleanly into a client app in `./src` and a Node.js Express server in `./server`. The backend follows a layered MVC design with dedicated controllers, Mongoose data models, custom auth and upload middlewares, and centralized routes."

### 4. TECHNICAL POINT
"This modular organization enforces Separation of Concerns (SoC), ensuring that business logic in controllers remains independent of database schema definitions and route handlers."

#### Full-Stack Flow Trace
`VS Code Directory Structure` → `src/ (Client SPA)` + `server/ (Express REST API)` → `Modular Controller-Route-Model Separation`

---

### STEP 3: Landing Page & Unauthenticated Browsing

### 1. SCREEN
Switch back to **Browser** on `http://localhost:5173/`.

### 2. ACTION
Click on the search bar in the hero section, type `"MacBook"`, and press Enter or click the Search button to jump to the Browse page (`/browse`).

### 3. WHAT TO SAY
"Notice that visitors can immediately search and browse lost and found items without needing an account. The landing page pulls live summary statistics and featured listings."

### 4. TECHNICAL POINT
"Unauthenticated requests invoke public GET endpoints. When the page mounts, React Query triggers `itemsApi.list()` and `itemsApi.stats()` which fetch filtered items and aggregated stats from Express."

#### Full-Stack Flow Trace
`UI Search Bar` → `src/routes/index.tsx` → `itemsApi.stats()` in `src/services/api.ts` → `GET /api/items/stats` → `server/routes/itemRoutes.js` → `getItemStats()` in `server/controllers/itemController.js` → `Item.countDocuments()` in `server/models/Item.js` → `MongoDB Count Query` → `JSON Response` → `React Component State` → `Render Badges & Cards`

---

### STEP 4: User Registration

### 1. SCREEN
**Browser**: Click **"Register"** in the top navigation bar to open `http://localhost:5173/register`.

### 2. ACTION
Fill in the form fields:
- Name: `"David Miller"`
- Email: `"david@example.com"`
- Password: `"password123"`
- Phone: `"+1 555 019 4432"`
Click **"Create Account"**.

### 3. WHAT TO SAY
"Now let's register a new user. As I click 'Create Account', express-validator sanitizes the inputs on the server. The user password is securely hashed using bcryptjs with 10 salt rounds before being stored in MongoDB."

### 4. TECHNICAL POINT
"The backend generates a 7-day signed JSON Web Token (JWT) using `generateToken.js` and returns it alongside the user profile object (excluding the password)."

#### Full-Stack Flow Trace
`Registration Form UI` → `src/routes/register.tsx` → `authApi.register()` in `src/services/api.ts` → `POST /api/auth/register` → `server/routes/authRoutes.js` → `validate(registerValidator)` in `server/utils/validators.js` → `registerUser()` in `server/controllers/authController.js` → `User.create()` in `server/models/User.js` → `pre('save')` bcrypt hash hook → `MongoDB Insert` → `generateToken()` in `server/utils/generateToken.js` → `HTTP 201 Response { token, user }` → `dispatch(setCredentials)` in `src/store/authSlice.ts` → `localStorage.setItem('lostfound.token')` → `UI redirects to /dashboard`

---

### STEP 5: User Login & Session Persistence

### 1. SCREEN
**Browser**: `http://localhost:5173/login`.

### 2. ACTION
Enter credentials:
- Email: `"alex@example.com"`
- Password: `"password123"`
Click **"Sign In"**.

### 3. WHAT TO SAY
"Let's log in as our existing user, Alex. Upon successful login, the JWT token is stored in both the Redux state and `localStorage`. Axios request interceptors automatically append this Bearer token to all subsequent API requests."

### 4. TECHNICAL POINT
"Session persistence is handled via `authApi.me()` on startup. Axios interceptors intercept any `401 Unauthorized` response to automatically clear invalid tokens and reset Redux state."

#### Full-Stack Flow Trace
`Login Form` → `src/routes/login.tsx` → `authApi.login()` in `src/services/api.ts` → `POST /api/auth/login` → `server/routes/authRoutes.js` → `validate(loginValidator)` → `loginUser()` in `server/controllers/authController.js` → `User.findOne({ email }).select('+password')` → `user.matchPassword()` bcrypt compare → `generateToken()` → `HTTP 200 Response` → `Redux authSlice setCredentials` → `Axios Request Interceptor set Bearer Header` → `UI Header displays User Avatar & Name`

---

### STEP 6: User Dashboard Overview

### 1. SCREEN
**Browser**: `http://localhost:5173/dashboard`.

### 2. ACTION
Click between the **"My Reports"** tab and **"My Claims"** tab. Show the item status cards and claim badges.

### 3. WHAT TO SAY
"Here is the user dashboard. Alex can view all items he has reported as lost or found under 'My Reports', and track the status of verification claims he has submitted under 'My Claims'."

### 4. TECHNICAL POINT
"The dashboard requests `/api/items/mine` and `/api/claims/mine`. The backend uses the JWT payload to extract `req.user._id` and query MongoDB for user-owned records."

#### Full-Stack Flow Trace
`Dashboard UI Tabs` → `src/routes/dashboard.tsx` → `itemsApi.myReports()` & `claimsApi.mine()` in `src/services/api.ts` → `GET /api/items/mine` & `GET /api/claims/mine` → `server/middleware/auth.js (protect)` → `getMyReports()` & `getMyClaims()` in `server/controllers/` → `Item.find({ reportedBy: req.user._id })` → `MongoDB Query` → `HTTP 200 JSON Array` → `React Redux / Query State` → `Render Dashboard Cards`

---

### STEP 7: Reporting a Lost Item with Image Upload

### 1. SCREEN
**Browser**: Click **"Report Item"** button in navigation (`http://localhost:5173/report`).

### 2. ACTION
Fill out the report form:
- Type: Select **"Lost"**
- Title: `"Sony WH-1000XM4 Headphones"`
- Category: Select **"Electronics"**
- Location: Select **"Main Library"**
- Date: Select today's date
- Description: `"Black Sony noise-canceling headphones left in soft black case near 2nd floor desk."`
- Upload Image: Drag and drop or attach a photo file.
Click **"Submit Report"**.

### 3. WHAT TO SAY
"Now let's submit a report for a lost item. Notice the drag-and-drop image preview. When submitted, the client sends a `multipart/form-data` request. Multer handles the file upload on the backend, storing the image in `server/uploads/` and attaching the accessible URL to the database record."

### 4. TECHNICAL POINT
"The newly created item status is automatically set to `'pending'` until an administrator reviews and approves it for public listing."

#### Full-Stack Flow Trace
`Report Form UI` → `src/routes/report.tsx` → `itemsApi.create(formData)` in `src/services/api.ts` → `POST /api/items (multipart/form-data)` → `server/routes/itemRoutes.js` → `protect` middleware → `upload.single('image')` in `server/middleware/upload.js` → `validate(itemValidator)` → `createItem()` in `server/controllers/itemController.js` → `Item.create({ status: 'pending', imageUrl: ... })` → `MongoDB Insert` → `HTTP 201 Response` → `Toast Notification "Report submitted for review"` → `Redirect to /dashboard`

---

### STEP 8: Browsing & Multi-Filter Search

### 1. SCREEN
**Browser**: Navigate to `http://localhost:5173/browse`.

### 2. ACTION
- Click **"Lost Items"** tab.
- Select Category filter: `"Electronics"`.
- Select Location filter: `"Main Library"`.
- Type `"MacBook"` in the search input.

### 3. WHAT TO SAY
"Let's explore the browse page. Users can filter items by type, category, location, status, date range, or text search. As filters change, URL search parameters update dynamically, allowing shareable search URLs."

### 4. TECHNICAL POINT
"The backend uses indexed fields (`kind`, `status`, `category`, `location`) and MongoDB regex queries with limit/skip pagination to return fast, paginated results."

#### Full-Stack Flow Trace
`Filter Controls` → `src/routes/browse.tsx` → `itemsApi.list(filters)` → `GET /api/items?kind=lost&category=Electronics&location=Main+Library&q=MacBook` → `server/routes/itemRoutes.js` → `getItems()` in `server/controllers/itemController.js` → `Item.find(query).skip().limit()` with indexes → `MongoDB Query` → `HTTP 200 Response { data, page, totalPages, total }` → `Render ItemGrid & Pagination UI`

---

### STEP 9: Item Details & In-App Discussion Thread

### 1. SCREEN
**Browser**: Click on the item card for `"Apple MacBook Pro 14"` (`http://localhost:5173/items/<id>`).

### 2. ACTION
Scroll through item details: photo, reporter name, location badge, and date. Scroll down to the **Discussion Thread** section. Type a message: `"Is this laptop in a space gray sleeve?"` and click **"Send Message"**.

### 3. WHAT TO SAY
"On the item details page, users can view complete item information without exposing raw contact details. Instead, LostFound+ provides an in-app discussion thread for community questions."

### 4. TECHNICAL POINT
"Posting a message executes `messagesApi.send()`. The backend stores the message in the `Message` collection referenced to the specific `Item` ID."

#### Full-Stack Flow Trace
`Discussion Input UI` → `src/routes/items.$itemId.tsx` → `messagesApi.send(itemId, body)` → `POST /api/items/:itemId/messages` → `server/routes/itemRoutes.js` → `protect` → `sendMessage()` in `server/controllers/messageController.js` → `Message.create({ item, sender, author, body })` → `MongoDB Insert` → `HTTP 201 Response` → `Update Local Message Array` → `Render Message Bubble`

---

### STEP 10: Submitting a Claim Verification

### 1. SCREEN
**Browser**: Still on `http://localhost:5173/items/<id>` (viewing a Found item like *Leather Wallet with IDs*).

### 2. ACTION
Click **"Claim This Item"** button. In the modal, type:
`"This is my wallet! It contains my driver's license with name Alex Johnson and a library card."`
Click **"Submit Claim"**.

### 3. WHAT TO SAY
"To prevent fraud, users must submit verification evidence when claiming a found item. When submitted, the claim record is linked to the item, the item's `claimCount` increments, and a notification is automatically triggered for the item reporter."

### 4. TECHNICAL POINT
"This transaction updates the `Claim` model, increments `Item.claimCount`, and creates a document in `Notification` within a server-side async handler."

#### Full-Stack Flow Trace
`Claim Modal UI` → `src/routes/items.$itemId.tsx` → `claimsApi.create(itemId, message)` → `POST /api/items/:itemId/claims` → `server/routes/itemRoutes.js` → `protect` → `validate(claimValidator)` → `createClaim()` in `server/controllers/claimController.js` → `Claim.create()` + `Item.save(claimCount++)` + `Notification.create()` → `MongoDB` → `HTTP 201 Response` → `Toast Success` → `Update UI Button State to "Claim Pending"`

---

### STEP 11: Real-Time Notifications

### 1. SCREEN
**Browser**: Click on the **Notification Bell** icon in the navbar or go to `http://localhost:5173/notifications`.

### 2. ACTION
View unread notifications. Click on a notification or click **"Mark all as read"**.

### 3. WHAT TO SAY
"The notification system keeps users informed when a claim is submitted, approved, or rejected. Unread notifications display a visual badge count in the header."

### 4. TECHNICAL POINT
"Clicking 'Mark all as read' sends `PUT /api/notifications/read-all`. Redux updates the global unread count state in `notificationsSlice.ts`."

#### Full-Stack Flow Trace
`Notification List UI` → `src/routes/notifications.tsx` → `notificationsApi.markAllRead()` → `PUT /api/notifications/read-all` → `server/routes/notificationRoutes.js` → `protect` → `markAllAsRead()` in `server/controllers/notificationController.js` → `Notification.updateMany({ user, read: false }, { read: true })` → `MongoDB` → `HTTP 200 Response` → `dispatch(markAllRead)` in `src/store/notificationsSlice.ts` → `Badge counter sets to 0`

---

### STEP 12: Profile Management

### 1. SCREEN
**Browser**: `http://localhost:5173/profile`.

### 2. ACTION
Update user profile fields:
- Phone: `"+1 555 014 9912"`
- Location: `"Central Campus"`
- Bio: `"Computer Science Student"`
Click **"Save Profile"**.

### 3. WHAT TO SAY
"Users can update their personal information and contact preferences in the profile section."

### 4. TECHNICAL POINT
"The update executes `authApi.updateProfile()`. The backend updates the `User` Mongoose model and returns the sanitized user object."

#### Full-Stack Flow Trace
`Profile Form` → `src/routes/profile.tsx` → `authApi.updateProfile(payload)` → `PUT /api/users/me` → `server/routes/userRoutes.js` → `protect` → `updateProfile()` in `server/controllers/authController.js` → `user.save()` → `MongoDB` → `HTTP 200 Response` → `Redux authSlice update` → `Toast "Profile updated"`

---

### STEP 13: User Logout

### 1. SCREEN
**Browser**: Click user dropdown in navbar → Click **"Log Out"**.

### 2. ACTION
Click **"Log Out"**. Show that navbar updates back to "Login" / "Register" buttons and protected routes redirect to `/login`.

### 3. WHAT TO SAY
"Logging out clears the session token from `localStorage` and resets the Redux auth state."

### 4. TECHNICAL POINT
"Client-side logout dispatches `logout()` in `authSlice.ts` and removes `lostfound.token` from storage."

#### Full-Stack Flow Trace
`Logout Click` → `src/components/Navbar.tsx` → `dispatch(logout())` in `src/store/authSlice.ts` → `localStorage.removeItem('lostfound.token')` → `Redux user state set to null` → `UI Navbar resets to Guest Mode` → `Navigate to /login`

---

### STEP 14: Admin Authentication & Protected Admin Portal

### 1. SCREEN
**Browser**: Navigate to `http://localhost:5173/login`. Log in as Admin:
- Email: `"admin@lostfound.com"`
- Password: `"admin123"`

### 2. ACTION
Click **"Sign In"**. Notice the new **"Admin Portal"** link appearing in the main navigation. Click **"Admin Portal"** (`http://localhost:5173/admin`).

### 3. WHAT TO SAY
"Now let's demonstrate the Admin Moderator Portal. Admin access is strictly enforced on both frontend and backend using Role-Based Access Control (RBAC)."

### 4. TECHNICAL POINT
"On the frontend, `ProtectedRoute` checks `user.role === 'admin'`. On the backend, `adminOnly` middleware verifies `req.user.role === 'admin'` before allowing access to `/api/admin/*` endpoints."

#### Full-Stack Flow Trace
`Admin Login UI` → `src/routes/login.tsx` → `authApi.login()` → `POST /api/auth/login` → `user.role === 'admin'` in `server/models/User.js` → `HTTP 200 Response` → `ProtectedRoute component checks role` → `Render Admin Portal UI`

---

### STEP 15: Admin Analytics & Aggregation Pipeline

### 1. SCREEN
**Browser**: `http://localhost:5173/admin` (showing Analytics Cards & Charts).

### 2. ACTION
Point cursor to total items count, resolution rate metric, monthly trends bar chart, and category distribution pie chart.

### 3. WHAT TO SAY
"The admin dashboard provides high-level system analytics. We can inspect total reports, resolution rate percentage, monthly trends, and item categories."

### 4. TECHNICAL POINT
"Instead of running multiple in-memory JavaScript loops, these analytics are computed directly in MongoDB using aggressive `$group`, `$match`, and `$sort` Mongoose aggregation pipelines."

#### Full-Stack Flow Trace
`Admin Analytics Dashboard` → `src/routes/admin.tsx` → `adminApi.analytics()` → `GET /api/admin/analytics` → `server/routes/adminRoutes.js` → `protect, adminOnly` middleware → `getAdminAnalytics()` in `server/controllers/adminController.js` → `Item.aggregate([{ $group: ... }])` → `MongoDB Engine` → `HTTP 200 Response { stats, trends, categories }` → `Render Recharts Charts UI`

---

### STEP 16: Admin Item Moderation & Approval / Rejection

### 1. SCREEN
**Browser**: `http://localhost:5173/admin` → Select **"Items Moderation"** tab.

### 2. ACTION
Find a pending item report (e.g., *Car Key Chain with Blue Lanyard*). Click **"Approve"**.
Then find a duplicate report and click **"Reject"**.

### 3. WHAT TO SAY
"Admins can review pending items reported by users. Approving an item makes it publicly visible across search listings, while rejecting it flags the record and notifies the reporter."

### 4. TECHNICAL POINT
"Approving executes `adminApi.moderate(id, 'approve')` calling `PUT /api/admin/items/:id/approve`. The backend updates `Item.status = 'open'`."

#### Full-Stack Flow Trace
`Approve Button` → `src/routes/admin.tsx` → `adminApi.moderate(id, 'approve')` → `PUT /api/admin/items/:id/approve` → `server/routes/adminRoutes.js` → `protect, adminOnly` → `moderateItem()` in `server/controllers/adminController.js` → `item.status = 'open'; item.save()` → `MongoDB` → `HTTP 200 Response` → `React Query invalidates admin items list` → `Status badge updates to "Open"`

---

### STEP 17: Admin User Management & Role Promotion

### 1. SCREEN
**Browser**: `http://localhost:5173/admin` → Select **"User Management"** tab.

### 2. ACTION
View the table of registered users. Find user `"Alex Johnson"`, click the Role dropdown, and change role from `"user"` to `"admin"`.

### 3. WHAT TO SAY
"Admins can also manage registered platform users and elevate trusted users to administrator status."

### 4. TECHNICAL POINT
"This triggers `adminApi.setUserRole(id, role)` calling `PUT /api/admin/users/:id/role`. The user's role field is updated in MongoDB."

#### Full-Stack Flow Trace
`Role Dropdown` → `src/routes/admin.tsx` → `adminApi.setUserRole(id, 'admin')` → `PUT /api/admin/users/:id/role` → `server/routes/adminRoutes.js` → `protect, adminOnly` → `setUserRole()` in `server/controllers/adminController.js` → `User.findByIdAndUpdate()` → `MongoDB` → `HTTP 200 Response` → `UI updates User Role Badge`

---

## SECTION 2: Code Editor Deep-Dive (Technical Implementation)

Switch your screen recording from **Browser** to **VS Code Editor** for this section.

---

### STEP 18: Frontend Architecture & Routing

### 1. SCREEN
**VS Code**: Open `src/start.ts`, `src/router.tsx`, and `src/routes/__root.tsx`.

### 2. ACTION
Highlight route setup in `src/router.tsx` and the `RootShell` component in `src/routes/__root.tsx`.

### 3. WHAT TO SAY
"Let's look at the frontend code. We use TanStack Router for type-safe client routing and TanStack Start for app hydration. The root route initializes Redux Provider, QueryClientProvider, and Sonner Toaster."

### 4. TECHNICAL POINT
"Type-safe routing ensures that URL parameters and query filters are validated at compile time, preventing runtime routing crashes."

```ts
// File: src/routes/__root.tsx
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
```

---

### STEP 19: API Service Layer & Axios Interceptors

### 1. SCREEN
**VS Code**: Open `src/services/api.ts`.

### 2. ACTION
Scroll to lines 32–57 showing `axios.create()` and request/response interceptors.

### 3. WHAT TO SAY
"All API communication is centralized in `src/services/api.ts`. An Axios request interceptor attaches the JWT bearer token from `localStorage` to every request. A response interceptor handles global 401 unauthorization by clearing stored sessions."

### 4. TECHNICAL POINT
"Centralizing API logic avoids duplicating authorization headers across components and guarantees unified error handling."

```ts
// File: src/services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lostfound.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

### STEP 20: Backend Entry Point & Security Middleware

### 1. SCREEN
**VS Code**: Open `server/server.js`.

### 2. ACTION
Highlight `helmet()`, `cors()`, `rateLimit()`, static file serving (`/uploads`), and router definitions.

### 3. WHAT TO SAY
"On the backend, `server.js` serves as the Express entry point. It applies Helmet for HTTP security headers, CORS for cross-origin configuration, and Express Rate Limit on `/api/auth` to mitigate brute-force attacks."

### 4. TECHNICAL POINT
"Static image serving is configured via `express.static(path.join(__dirname, 'uploads'))`, allowing uploaded files to be retrieved over HTTP."

```javascript
// File: server/server.js
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/api/auth', authLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

### STEP 21: Mongoose Models & Schemas

### 1. SCREEN
**VS Code**: Open `server/models/User.js` and `server/models/Item.js`.

### 2. ACTION
Highlight `userSchema.pre('save')` password hashing hook in `User.js` and indexes/virtuals in `Item.js`.

### 3. WHAT TO SAY
"Our database models use Mongoose schemas. `User.js` uses a pre-save hook to hash passwords using bcrypt before persisting to MongoDB. `Item.js` defines compound indexes on `kind`, `status`, `category`, and `location` for high-performance search queries."

### 4. TECHNICAL POINT
"Mongoose virtual getters export aliases (`type` for `kind`) and formatted nested objects (`reporter` for `reportedBy`), ensuring the MongoDB documents match the frontend TypeScript contracts."

```javascript
// File: server/models/Item.js
itemSchema.index({ kind: 1, status: 1, category: 1, location: 1 });
itemSchema.virtual('reporter').get(function () {
  return { _id: this.reportedBy._id, name: this.reportedBy.name || 'Anonymous' };
});
```

---

### STEP 22: Authentication Middleware & Role Guard

### 1. SCREEN
**VS Code**: Open `server/middleware/auth.js`.

### 2. ACTION
Highlight `protect` and `adminOnly` functions.

### 3. WHAT TO SAY
"Authentication is enforced by two custom middleware functions: `protect` verifies the JWT signature and attaches the user document to `req.user`. `adminOnly` checks `req.user.role === 'admin'`."

### 4. TECHNICAL POINT
"If token verification fails or an unauthorized user accesses an admin endpoint, the middleware halts execution and returns HTTP 401 or 403 JSON error responses."

```javascript
// File: server/middleware/auth.js
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

---

### STEP 23: Image Upload Middleware with Multer

### 1. SCREEN
**VS Code**: Open `server/middleware/upload.js`.

### 2. ACTION
Highlight `multer.diskStorage` configuration and file filter rules.

### 3. WHAT TO SAY
"File uploads are handled by Multer. Uploaded images are checked for file type (jpeg, png, webp), limited to 5MB, and saved with unique timestamps to `./server/uploads/`."

### 4. TECHNICAL POINT
"The controller converts the saved file path into a full HTTP URL (`http://localhost:5000/uploads/image-123.jpg`), stored in `Item.imageUrl`."

```javascript
// File: server/middleware/upload.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});
```

---

### STEP 24: Database Seeding & MongoDB Atlas Connection

### 1. SCREEN
**VS Code**: Open `server/config/db.js` and `server/seed.js`.

### 2. ACTION
Highlight `mongoose.connect(process.env.MONGO_URI)` and `seedData()` asynchronous function.

### 3. WHAT TO SAY
"Database connectivity is initialized in `config/db.js`. We also created an automated seed script (`seed.js`) that resets collections and populates test admin users, regular users, sample items, claims, and discussion messages in MongoDB Atlas."

### 4. TECHNICAL POINT
"Running `npm run seed` executes Mongoose insertions against MongoDB Atlas, auto-creating all database collections on first write."

```javascript
// File: server/seed.js
const seedData = async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany(); await Item.deleteMany();
  await User.create({ name: 'System Admin', email: 'admin@lostfound.com', role: 'admin' });
  console.log('[Seed] Database seeded successfully!');
};
```

---

## SECTION 3: Time-Constrained Recording Scripts

---

### 1. 5-MINUTE VERSION SCRIPT

- **0:00 - 0:45 (Intro & Landing Page)**: Show Landing Page (`/`). Explain project purpose (LostFound+ lost & found desk built with React, Express, MongoDB). Point out quick stats and featured items.
- **0:45 - 1:45 (User Workflow)**: Login as user `alex@example.com`. Go to `/report`, show image upload, submit a lost item. Go to `/browse`, filter by category `"Electronics"`, click item details, show discussion thread and claim submission.
- **1:45 - 2:45 (Admin Workflow)**: Logout and log in as `admin@lostfound.com`. Navigate to `/admin`. Show analytics cards and Recharts trends. Go to Item Moderation tab and approve a pending item.
- **2:45 - 4:15 (Code Architecture)**: Switch to VS Code. Show `server/server.js`, `server/models/Item.js` (indexes/virtuals), `server/middleware/auth.js` (JWT & RBAC), and `src/services/api.ts` (Axios interceptors).
- **4:15 - 5:00 (Conclusion)**: Demonstrate `npm run seed` in terminal showing MongoDB Atlas live sync. Conclude demo.

---

### 2. 10-MINUTE VERSION SCRIPT

- **0:00 - 1:00 (Intro & Architecture Overview)**: Show Landing Page + VS Code folder layout (`src/` vs `server/`). Explain full-stack MERN architecture.
- **1:00 - 2:30 (Auth & User Registration)**: Register new user `david@example.com`. Explain form validation, bcrypt password hashing, and JWT creation.
- **2:30 - 4:30 (Item Reporting & Browsing)**: Submit a lost item report with image preview. Navigate to `/browse`, apply multi-field filters (category, location, search text), explain MongoDB indexed queries.
- **4:30 - 6:00 (Item Details, Messaging & Claims)**: View item details page, send a discussion thread message, submit an item claim with proof message. Show header notification count badge.
- **6:00 - 7:30 (Admin Portal & Analytics)**: Log in as Admin (`admin@lostfound.com`). Show `/admin` dashboard. Explain MongoDB `$group` aggregation pipeline for analytics, approve pending items, promote a user role.
- **7:30 - 9:30 (Code Walkthrough)**: Switch to VS Code. Show `src/services/api.ts` (Axios interceptors), `server/models/User.js` & `Item.js` (Mongoose hooks & schema), `server/middleware/auth.js` & `upload.js` (Multer).
- **9:30 - 10:00 (Wrap Up)**: Show database state in MongoDB Atlas/Compass. End recording.

---

### 3. 15-MINUTE DETAILED VERSION SCRIPT

- **0:00 - 1:30 (Project Introduction & Problem Statement)**: Comprehensive intro to LostFound+. Discuss civic/community utility, security requirements, and tech stack choices.
- **1:30 - 3:30 (Unauthenticated Browsing & Search)**: Demonstrate landing page stats and browse page filtering before login. Explain REST GET endpoints.
- **3:30 - 5:30 (Authentication & Session Persistence)**: Walk through registration (`/register`) and login (`/login`). Explain JWT storage in Redux + localStorage, auto-login via `authApi.me()`, and 401 token clearing.
- **5:30 - 7:30 (Report Item & File Handling)**: Demonstrate reporting a lost item with Multer file upload. Explain `multipart/form-data`, disk storage in `server/uploads/`, and static express URL serving.
- **7:30 - 9:30 (Claims, Discussions & Notifications)**: Submit claim verification, send discussion messages, mark notifications as read. Trace full database updates.
- **9:30 - 12:00 (Admin Portal Deep Dive)**: Log in as Admin. Walk through analytics dashboard, Recharts visualizations, MongoDB aggregation pipelines, item status moderation queue, and user role updates.
- **12:00 - 14:30 (Backend & Code Inspection)**: Inspect VS Code files in detail: `server.js`, `db.js`, `auth.js`, `upload.js`, `itemController.js`, `Item.js`, `User.js`, `seed.js`.
- **14:30 - 15:00 (Conclusion & Testing Verification)**: Demonstrate automated seed execution and MongoDB Atlas live connection verification.

---

## SECTION 4: 30 Standard Viva Questions & Answers

#### Q1: What is LostFound+ and what tech stack does it use?
**Answer**: LostFound+ is a full-stack lost-and-found management platform built with React 19, Redux Toolkit, React Router, Node.js, Express.js, and MongoDB with Mongoose.

#### Q2: How is state managed on the frontend?
**Answer**: Global authentication state and unread notifications are managed using Redux Toolkit (`authSlice.ts` and `notificationsSlice.ts`). Component-level server state is cached using TanStack React Query.

#### Q3: How is user authentication handled?
**Answer**: Authentication is stateless using JSON Web Tokens (JWT). Passwords are hashed using bcryptjs (10 salt rounds). On login, a signed JWT token (7-day expiry) is returned to the client and stored in `localStorage`.

#### Q4: How does the client send authentication credentials to the backend?
**Answer**: An Axios request interceptor in `src/services/api.ts` extracts `lostfound.token` from `localStorage` and attaches it as a `Bearer <token>` header in `Authorization` on every outgoing HTTP request.

#### Q5: What happens when a JWT token expires?
**Answer**: The backend `protect` middleware returns HTTP 401. An Axios response interceptor intercepts the 401 error, removes `lostfound.token` from `localStorage`, resets the Redux auth state, and redirects the user to `/login`.

#### Q6: How are user roles enforced?
**Answer**: Through Role-Based Access Control (RBAC). On the frontend, `ProtectedRoute` restricts routes like `/admin` to `user.role === 'admin'`. On the backend, `adminOnly` middleware rejects non-admin requests with HTTP 403 Forbidden.

#### Q7: How are file uploads (item photos) processed?
**Answer**: The client sends a `multipart/form-data` request. The backend uses `multer` middleware configured with disk storage (`server/uploads/`) to validate file types and file sizes (5MB max) and store files with unique timestamps.

#### Q8: How are uploaded images served to the frontend?
**Answer**: The backend exposes uploaded files as static assets using Express middleware: `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`.

#### Q9: What database is used and how does the server connect to it?
**Answer**: MongoDB Atlas (or local MongoDB). The application uses Mongoose ODM and connects asynchronously via `mongoose.connect(process.env.MONGO_URI)` in `server/config/db.js`.

#### Q10: How are database queries optimized for item searches?
**Answer**: Compound indexes are created on `kind`, `status`, `category`, and `location` fields in `server/models/Item.js`. Text search indexes are also applied to `title` and `description`.

#### Q11: How is pagination implemented?
**Answer**: Mongoose `.skip((page - 1) * limit).limit(limit)` is used alongside `Item.countDocuments()` to return `{ data, page, totalPages, total }`.

#### Q12: How are password hashes created?
**Answer**: Using Mongoose `pre('save')` hooks in `server/models/User.js`. When a user record is saved or modified, bcrypt generates a 10-round salt and hashes the plain-text password automatically.

#### Q13: What is the purpose of `seed.js`?
**Answer**: `seed.js` clears existing records and populates MongoDB with initial test data including an admin user, sample regular users, items across categories, claims, notifications, and discussion messages.

#### Q14: How does item moderation work?
**Answer**: Newly reported items start with status `'pending'`. An admin reviews pending items in the admin portal (`/admin`) and calls `PUT /api/admin/items/:id/approve` or `reject` to update the item status to `'open'` or `'rejected'`.

#### Q15: How are analytics computed on the admin dashboard?
**Answer**: Using MongoDB aggregation pipelines (`$group`, `$match`, `$sort`) in `server/controllers/adminController.js` to calculate item counts by status, category breakdown percentages, and 6-month reporting trends.

#### Q16: How does claim submission work?
**Answer**: A user submits a claim message on a found item. `createClaim` creates a `Claim` document, increments `Item.claimCount`, and inserts a `Notification` for the item's reporter.

#### Q17: What security headers are implemented?
**Answer**: `helmet()` middleware is included in `server/server.js` to set HTTP headers like X-Content-Type-Options, X-Frame-Options, and Strict-Transport-Security.

#### Q18: How is CORS configured?
**Answer**: `cors({ origin: allowedOrigins, credentials: true })` restricts cross-origin HTTP requests to trusted frontend URLs (`http://localhost:5173`).

#### Q19: How are brute-force attacks mitigated?
**Answer**: `express-rate-limit` limits IP requests on `/api/auth/*` routes to a maximum of 100 requests per 15-minute window.

#### Q20: How are input payloads validated on write endpoints?
**Answer**: `express-validator` rules in `server/utils/validators.js` validate mandatory fields, email formats, and string lengths before reaching controller handlers.

#### Q21: What is the role of `server/middleware/errorHandler.js`?
**Answer**: It acts as centralized error middleware: `notFound` catches 404 routes, while `errorHandler` formats runtime exceptions into standardized JSON responses (`{ success: false, message: ... }`).

#### Q22: What are Mongoose Virtuals and how are they used in LostFound+?
**Answer**: Virtuals are document properties that can be gotten/set but are not persisted to MongoDB. `Item.js` uses virtuals to provide `type` as an alias for `kind` and format `reporter` as `{ _id, name }`.

#### Q23: How does the in-app discussion thread function?
**Answer**: `Message` documents store `item` (ref Item), `sender` (ref User), `author`, and `body`. `GET /api/items/:itemId/messages` fetches all messages ordered chronologically by `createdAt`.

#### Q24: How does approval of a claim affect the parent item?
**Answer**: Approving a claim (`PUT /api/claims/:id/approve`) updates the claim status to `'approved'`, updates the parent `Item.status` to `'resolved'`, and notifies the claimant.

#### Q25: Why is `select: false` set on the User model password field?
**Answer**: To prevent password hashes from being returned in database query results by default, enhancing security across user endpoints.

#### Q26: What is the purpose of `.env.example`?
**Answer**: It documents necessary environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`) without committing actual production secrets to source control.

#### Q27: How is the frontend structured for routing?
**Answer**: TanStack Router uses route definitions under `src/routes/` (`index.tsx`, `login.tsx`, `browse.tsx`, `report.tsx`, `items.$itemId.tsx`, `admin.tsx`, `dashboard.tsx`).

#### Q28: How are UI notifications displayed to users?
**Answer**: Sonner toast notifications (`<Toaster />` in `__root.tsx`) display interactive popups upon successful API actions or error catches.

#### Q29: What HTTP status codes are used across API responses?
**Answer**:
- `200 OK`: Successful GET/PUT queries
- `201 Created`: Successful POST creations
- `400 Bad Request`: Validation failure
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient role permissions
- `404 Not Found`: Missing resource
- `500 Internal Server Error`: Unhandled server exception

#### Q30: How is the application deployed/built for production?
**Answer**: The React frontend is compiled into static assets using `vite build`. The Express server runs via `node server.js` connected to a production MongoDB Atlas URI.

---

## SECTION 5: 15 Advanced / Difficult Viva Questions & Answers

#### Q1: Why did you choose JWT over traditional session-cookie authentication for LostFound+?
**Answer**: JWT authentication is completely stateless and scalable. The server does not need to store active session records in RAM or a Redis session store. The client presents a cryptographically signed token containing user claims (`id`), allowing any server instance or microservice to verify authentication independently using `process.env.JWT_SECRET`.

#### Q2: How do Mongoose Compound Indexes improve query performance on `/api/items`?
**Answer**: When filtering items by `kind`, `status`, `category`, and `location`, MongoDB uses B-tree compound indexes (`{ kind: 1, status: 1, category: 1, location: 1 }`) to narrow search bounds in logarithmic time $O(\log N)$ rather than performing an expensive full collection scan $O(N)$.

#### Q3: What is race-condition safety in claim count increments, and how is it handled?
**Answer**: If two users submit a claim simultaneously, read-then-write updates can cause lost updates. In Mongoose, atomic updates using `$inc` (`Item.findByIdAndUpdate(id, { $inc: { claimCount: 1 } })`) execute directly in the MongoDB engine, guaranteeing atomic increment operations without race conditions.

#### Q4: How does express-validator protect against NoSQL Injection attacks?
**Answer**: NoSQL injection occurs when attackers supply nested objects (e.g. `{ "$ne": null }`) in request parameters. `express-validator` rules normalize and sanitize input parameters (converting inputs to strings or sanitized emails), preventing raw object injection into Mongoose queries.

#### Q5: Explain the MongoDB Aggregation Pipeline used for Admin Analytics in `adminController.js`.
**Answer**: The pipeline processes documents sequentially through stages:
1. `$match`: Filters items created within the last 6 months (`{ createdAt: { $gte: sixMonthsAgo } }`).
2. `$group`: Groups documents by month and item kind (`{ _id: { year: ..., month: ..., kind: "$kind" }, count: { $sum: 1 } }`).
3. Output: Returns pre-aggregated metrics directly from MongoDB memory, reducing CPU overhead compared to processing raw arrays in Node.js.

#### Q6: How does Axios handle token expiration gracefully without causing page reloads?
**Answer**: Via Axios response interceptors (`api.interceptors.response.use`). When an API call returns `401 Unauthorized`, the interceptor catches the error before component catch blocks execute, removes invalid keys from `localStorage`, dispatches Redux `logout()`, and redirects programmatically via React Router.

#### Q7: Why is bcrypt preferred over SHA-256 for password hashing?
**Answer**: SHA-256 is a fast cryptographic hash, making it vulnerable to GPU-accelerated brute-force and rainbow table attacks. Bcrypt is an adaptive key-derivation function that incorporates a salt and an adjustable work factor (10 rounds in our app), making hash computation intentionally slow and resilient against brute-force attacks.

#### Q8: How does Multer handle storage errors or invalid file extensions during upload?
**Answer**: Multer executes a custom `fileFilter` function. If the file extension or MIME type does not match `/jpeg|jpg|png|gif|webp/`, Multer passes an `Error('Images only!')` to Express middleware, halting file writing and triggering the global error handler (`errorHandler.js`).

#### Q9: What is the difference between `toObject: { virtuals: true }` and default Mongoose JSON serialization?
**Answer**: By default, Mongoose does not include virtual getters in `.toJSON()` or `.toObject()` transformations. Specifying `{ toJSON: { virtuals: true } }` ensures that virtual attributes like `type` and `reporter` are serialized when Express runs `res.json(item)`.

#### Q10: How do you prevent cross-site scripting (XSS) in user-generated content like discussion messages?
**Answer**: React automatically escapes strings rendered inside JSX templates, converting characters like `<script>` to HTML entities. Additionally, backend inputs are sanitized via `express-validator` `.trim()` and string type assertions.

#### Q11: Explain how `req.user` is populated across protected Express routes.
**Answer**: The `protect` middleware extracts the JWT from the `Authorization: Bearer <token>` header, verifies the signature with `jwt.verify()`, extracts the embedded user ID, queries MongoDB (`User.findById(decoded.id).select('-password')`), and assigns the resulting Mongoose document to `req.user` before calling `next()`.

#### Q12: Why are `.skip()` and `.limit()` combined with `.sort({ createdAt: -1 })` in paginated queries?
**Answer**: Without deterministic sorting, MongoDB pagination can return duplicate or omitted documents across page boundaries if documents are inserted between requests. Sorting by `createdAt: -1` guarantees consistent ordering.

#### Q13: What happens if a database connection to MongoDB Atlas fails during server startup?
**Answer**: In `server/config/db.js`, `mongoose.connect()` is wrapped in a `try/catch` block. If connection fails, it logs `[MongoDB Error]`, and invokes `process.exit(1)`, preventing the Express app from running in an unstable state.

#### Q14: How does TanStack Router's `createRootRouteWithContext` benefit global state injection?
**Answer**: It provides strict TypeScript context injection. Router routes inherit shared dependencies like `queryClient` directly from route context, preventing global variable leakage and enabling type-safe route loaders.

#### Q15: How would LostFound+ scale horizontally to handle 100,000 active users?
**Answer**:
1. **Stateless App Servers**: Express instances can be replicated across multiple Docker containers behind an NGINX or AWS ALB load balancer.
2. **Database Sharding & Replica Sets**: MongoDB Atlas handles read scalability via read-replicas and database sharding on `category` or `location`.
3. **Cloud Image Storage**: Replace local disk Multer storage with direct AWS S3 / Cloudinary uploads using pre-signed URLs.
