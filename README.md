# 📚 PYQHUB — University Previous Year Question Papers Portal

A full-stack web application where students and teachers can browse, filter, and download university question papers. Admins can manage universities, papers, users, contacts, and ratings.

This platform is built with one simple goal — to make previous year question papers easily accessible to every student, completely free of cost, with no ads or distractions.

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, React Router v6, Axios  |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB (via Mongoose)                  |
| Auth       | JWT (JSON Web Tokens), bcryptjs         |
| File Upload| Multer (PDF, max 20MB)                  |

---

## 📁 Project Structure

```
university-papers/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── upload.js           # Multer config for PDF uploads
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookmarkController.js
│   │   ├── contactController.js
│   │   ├── paperController.js
│   │   ├── ratingController.js
│   │   └── universityController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── roleCheck.js         # Role-based access
│   ├── models/
│   │   ├── Bookmark.js
│   │   ├── Contact.js
│   │   ├── Paper.js
│   │   ├── Rating.js
│   │   ├── University.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookmarks.js
│   │   ├── contacts.js
│   │   ├── papers.js
│   │   ├── ratings.js
│   │   └── universities.js
│   ├── uploads/                 # Uploaded PDF files
│   ├── utils/
│   │   └── seedAdmin.js         # Auto-creates default admin
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminPapers.jsx
│   │   │   ├── AdminUniversities.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── RatingsPage.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UniversityPapers.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server.js                    # Root entry point (for hosting)
├── package.json
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MongoDB** running locally on `localhost:27017`, or a MongoDB Atlas URI

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a separate terminal)
cd frontend
npm install
```

### 2. Configure Environment Variables

The file `backend/.env` contains:

```env
MONGODB_URI=mongodb://localhost:27017/university-papers
JWT_SECRET=UniversityPapers-Secret-Key
JWT_EXPIRE=24d
BCRYPT_SALT=10
PORT=5000
```

> Update `MONGODB_URI` if you're using MongoDB Atlas or a different host.

### 3. Start the Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Open in Browser

Go to **http://localhost:5173**

---

## 🔐 Default Login Credentials

A default **admin** account is auto-seeded on first startup:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@pyqportal.com`  |
| Password | `admin123`             |
| Role     | `admin`                |

> ⚠️ **Change these credentials in production!** Edit `backend/utils/seedAdmin.js` before deploying.

---

## 👥 User Roles

| Role      | Permissions                                                  |
| --------- | ------------------------------------------------------------ |
| `student` | Browse universities & papers, bookmark, submit ratings, contact support |
| `teacher` | Same as student                                               |
| `admin`   | Full access — manage universities, papers, users, contacts, ratings |

- New users register as **student** or **teacher** (admin cannot be selected during registration).

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth (`/api/auth`)

| Method | Endpoint     | Auth  | Role  | Description          |
| ------ | ------------ | ----- | ----- | -------------------- |
| POST   | `/register`  | ❌    | —     | Register new user    |
| POST   | `/login`     | ❌    | —     | Login & get JWT      |
| GET    | `/me`        | ✅    | Any   | Get current user     |
| PUT    | `/profile`   | ✅    | Any   | Update profile       |
| GET    | `/users`     | ✅    | Admin | List all users       |

### Universities (`/api/universities`)

| Method | Endpoint     | Auth  | Role  | Description              |
| ------ | ------------ | ----- | ----- | ------------------------ |
| GET    | `/`          | ❌    | —     | List all universities    |
| GET    | `/:id`       | ❌    | —     | Get single university    |
| POST   | `/`          | ✅    | Admin | Create university        |
| PUT    | `/:id`       | ✅    | Admin | Update university        |
| DELETE | `/:id`       | ✅    | Admin | Delete university        |

### Papers (`/api/papers`)

| Method | Endpoint                   | Auth  | Role  | Description              |
| ------ | -------------------------- | ----- | ----- | ------------------------ |
| GET    | `/search`                  | ❌    | —     | Global search            |
| GET    | `/recent`                  | ❌    | —     | Recently added papers    |
| GET    | `/university/:universityId`| ❌    | —     | Papers by university     |
| GET    | `/view/:filename`          | ❌    | —     | Serve PDF file           |
| POST   | `/download/:id`            | ❌    | —     | Increment download count |
| GET    | `/all`                     | ✅    | Admin | All papers               |
| GET    | `/stats`                   | ✅    | Admin | Dashboard stats          |
| POST   | `/`                        | ✅    | Admin | Upload paper (PDF)       |
| PUT    | `/:id`                     | ✅    | Admin | Update paper             |
| DELETE | `/:id`                     | ✅    | Admin | Delete paper             |

### Bookmarks (`/api/bookmarks`)

| Method | Endpoint          | Auth  | Role  | Description              |
| ------ | ----------------- | ----- | ----- | ------------------------ |
| GET    | `/`               | ✅    | Any   | Get user's bookmarks     |
| GET    | `/ids`            | ✅    | Any   | Get bookmark IDs         |
| GET    | `/check/:paperId` | ✅    | Any   | Check if bookmarked      |
| POST   | `/toggle`         | ✅    | Any   | Toggle bookmark          |

### Ratings (`/api/ratings`)

| Method | Endpoint     | Auth  | Role  | Description              |
| ------ | ------------ | ----- | ----- | ------------------------ |
| GET    | `/`          | ❌    | —     | List all ratings         |
| POST   | `/`          | ✅    | Any   | Submit rating (1 per user) |
| DELETE | `/:id`       | ✅    | Admin | Delete rating            |

### Contacts (`/api/contacts`)

| Method | Endpoint     | Auth  | Role  | Description              |
| ------ | ------------ | ----- | ----- | ------------------------ |
| POST   | `/`          | ✅    | Any   | Submit contact message   |
| GET    | `/`          | ✅    | Admin | List all contacts        |
| PUT    | `/:id`       | ✅    | Admin | Update contact status    |
| DELETE | `/:id`       | ✅    | Admin | Delete contact           |

---

## ⚙️ Additional Notes

- The Vite dev server **proxies** all `/api` requests to `http://localhost:5000` (configured in `vite.config.js`), so both servers need to be running for local development.
- Passwords are **hashed** using bcryptjs before being stored.
- JWT tokens are sent in the `Authorization: Bearer <token>` header.
- The admin seed only runs if **no admin user** exists in the database.
- Papers are uploaded as PDF files (max 20MB) and stored in `backend/uploads/`.
- Papers support Theory/Practical types, Major/Minor categories, and syllabus types.