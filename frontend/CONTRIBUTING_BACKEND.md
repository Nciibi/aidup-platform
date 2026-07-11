# AidUp Backend Contributor Guide 🛠️

Welcome to the AidUp Backend codebase! This guide is designed for entry-level contributors to help you understand how the backend works, how to connect to it properly, and how to create new features correctly.

## 1. Table of Contents
1. [Backend Architecture](#2-backend-architecture)
2. [Connection Method & Setup](#3-connection-method--setup)
3. [Understanding the Request & Response Format](#4-understanding-the-request--response-format)
4. [How to Create a New Feature](#5-how-to-create-a-new-feature)
5. [Authentication Workflow](#6-authentication-workflow)
6. [Security & Middleware](#7-security--middleware)

---

## 2. Backend Architecture

This backend follows the **MVC (Model-View-Controller)** pattern but replaces the View with JSON API responses since we are serving a separate frontend.

### Folder Structure
Here is an overview of the most important folders in `aidup-backend/`:
- **`app.js` & `server.js`**: The entry points of the application. `server.js` connects to the DB and starts the server, while `app.js` handles all the middleware and route mounting.
- **`models/`**: Contains Mongoose models (Database schemas). Examples: `User.js`, `Campain.js`, `Donation.js`.
- **`controllers/`**: Contains the core business logic. Controllers receive requests from routes, interact with the DB, and send responses.
- **`routes/`**: Defines the endpoints (URLs) and links them to specific controller functions. Also applies middleware (like auth/upload).
- **`middleware/`**: Functions that run *before* your controller logic. Example: `verifyJWT` to check if a user is logged in, `authorize` to check roles.
- **`config/`**: Contains configuration files like database connection (`dboptions.js`) and CORS.
- **`utils/`**: Helper functions and classes like the `logger`.
- **`sockets/`**: WebSockets implementation (e.g., for QR login).

---

## 3. Connection Method & Setup

To run the backend, you need environment variables to connect to our services correctly.
Look at the `.env` file at the root of `aidup-backend/`. It contains variables like:

```ini
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
```

### How the Database Connects
Inside `server.js`, you will see:
```javascript
const connectDB = require('./config/dboptions');
connectDB();
```
This function reads your `MONGO_URI` from the `.env` file and connects to MongoDB using Mongoose. **Never hardcode your database credentials into the code.**

---

## 4. Understanding the Request & Response Format

To ensure our frontend can smoothly parse backend responses, **we follow a strict JSON response format.** 

### Standard Success Response structure
Every successful response should return JSON with `success: true` and a `message`. Optionally append `data` or other relevant properties.

```json
{
    "success": true,
    "message": "Campaign successfully created",
    "data": {
        "title": "Save the Forest",
        "goal": 5000
    }
}
```

### Standard Error Response structure
When something fails (validation, missing auth), the backend should return `success: false`. The global error handler in `app.js` will catch errors thrown via `next(err)`:

```json
{
    "success": false,
    "message": "Invalid password or email",
    "stack": "..." // Only visible in development mode
}
```

Whenever you write a controller method, always use `try...catch` and pass errors to `next()`:
```javascript
exports.myFeature = async (req, res, next) => {
    try {
        // Your logic...
        res.status(200).json({ success: true, message: "Success" });
    } catch (error) {
        next(error); // Passes to global error handler
    }
}
```

---

## 5. How to Create a New Feature

Let's imagine you are asked to add a feature to fetch "Analytics for an Organizer". 
Follow this strict **Route ➡️ Controller ➡️ Model** flow:

### Step 1: Define the Model (if new data is required)
If you need a new table/collection, create a file in `/models/`. If you are using an existing one (like `Campain`), skip to step 2.

### Step 2: Write the Controller Logic
Go to the `controllers/` directory, open or create a relevant file (e.g., `organizerController.js`).
Create your function, fetch the data, and return standard JSON.

```javascript
// controllers/organizerController.js
exports.getOrganizerAnalytics = async (req, res, next) => {
    try {
        const organizerId = req.user.id; // comes from auth middleware
        // ... DB operations here ...
        res.status(200).json({
            success: true,
            message: "Analytics fetched",
            data: { totalDonations: 100 }
        });
    } catch (error) {
        next(error);
    }
}
```

### Step 3: Register the Route
Go to the `routes/` directory and open the matching file (e.g., `organizorRoutes.js`).
Import your new controller function and define the path & middleware.

```javascript
// routes/organizorRoutes.js
const { getOrganizerAnalytics } = require('../controllers/organizerController');
const verifyJWT = require('../middleware/verifyJWT');
const loadUser = require('../middleware/loadUser');
const authorize = require('../middleware/authorize');

// Note: the base path '/organizor' is already defined in app.js
router.get('/analytics', verifyJWT, loadUser, authorize('ORGANIZER'), getOrganizerAnalytics);
```

### Step 4: Ensure Route is Mounted
In `app.js`, verify that the Route file is mounted:
```javascript
app.use('/organizor', organizorRoutes);
```

---

## 6. Authentication Workflow

Our app distinguishes users mostly as `"DONATOR"`, `"ORGANIZER"`, or `"ADMIN"`.
When a user logs in, they receive:
1. An **Access Token** (Short-lived, ~15 mins), embedded directly in the JSON response payload.
2. A **Refresh Token** (Long-lived, ~7 days), embedded as an `httpOnly` secure cookie (`jwt`).

### Protecting your new endpoints
If you require a user to be logged in to access an endpoint, you must use the following middlewares in your route:
1. `verifyJWT`: Verifies the access token sent in the `Authorization: Bearer <token>` header.
2. `loadUser`: Adds the `req.user` object to the request which contains user data (like Role).
3. `authorize('ROLES')`: Rejects the request if `req.user.role` does not match criteria.

---

## 7. Security & Middleware

- **File Uploads**: Use the custom advanced upload middleware available at `middleware/advancedUpload.js` if you are dealing with image saving.
- **Audit Logs**: For high-risk or important actions, append the `auditLog('Action Name')` middleware to trace who performed what action.
- **Data Validation**: Avoid blindly trusting `req.body` data. Ensure input values are correct or use existing Zod validators if implemented.

---

Thank you for contributing to AidUp! Let's help make an impact! 🌍
