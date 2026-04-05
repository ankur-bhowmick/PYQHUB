<<<<<<< HEAD
# 📚 University Previous Year Question Papers Portal (PYQ Portal)

A full-stack web application where students and teachers can browse, filter, and download university question papers. Admins can manage universities, papers, users, contacts, and ratings.

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, React Router v6, Axios  |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB (via Mongoose)                  |
| Auth       | JWT (JSON Web Tokens), bcrypt           |

---

## 📁 Project Structure

```
university-papers/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, Users
│   │   ├── contactController.js # Contact form CRUD
│   │   ├── paperController.js   # Paper CRUD + stats
│   │   ├── ratingController.js  # Ratings CRUD
│   │   └── universityController.js # University CRUD
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── roleCheck.js         # Role-based access
│   ├── models/
│   │   ├── Contact.js
│   │   ├── Paper.js
│   │   ├── Rating.js
│   │   ├── University.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contacts.js
│   │   ├── papers.js
│   │   ├── ratings.js
│   │   └── universities.js
│   ├── utils/
│   │   └── seedAdmin.js         # Auto-creates default admin
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminPapers.jsx
    │   │   ├── AdminUniversities.jsx
    │   │   ├── ContactPage.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── RatingsPage.jsx
    │   │   ├── Register.jsx
    │   │   └── UniversityPapers.jsx
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 How to Run

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
| `student` | Browse universities & papers, submit ratings, contact support |
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
| GET    | `/university/:universityId`| ❌    | —     | Papers by university     |
| GET    | `/all`                     | ✅    | Admin | All papers               |
| GET    | `/stats`                   | ✅    | Admin | Dashboard stats          |
| POST   | `/`                        | ✅    | Admin | Create paper             |
| PUT    | `/:id`                     | ✅    | Admin | Update paper             |
| DELETE | `/:id`                     | ✅    | Admin | Delete paper             |

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

## 🗂️ Database Models

### User
- `name` (String, letters & spaces only)
- `email` (String, unique)
- `password` (String, min 6 chars, hashed with bcrypt)
- `role` (student | teacher | admin)

### University
- `name` (String, unique)
- `location` (String)
- `description` (String, optional)

### Paper
- `universityId` (Reference to University)
- `subject` (String)
- `year` (Number)
- `semester` (String, optional)
- `examType` (Mid-Term | End-Term | Supplementary | Other)
- `paperUrl` (String — link/URL to the paper)

### Rating
- `userId` (Reference to User, one rating per user)
- `rating` (Number, 1–5)
- `review` (String, optional)

### Contact
- `userId` (Reference to User)
- `subject` (String)
- `message` (String)
- `status` (pending | resolved)

---

## 📄 Frontend Routes

| Path                   | Page                | Access          |
| ---------------------- | ------------------- | --------------- |
| `/`                    | Home                | Public          |
| `/login`               | Login               | Public          |
| `/register`            | Register            | Public          |
| `/university/:id`      | University Papers   | Public          |
| `/ratings`             | Ratings             | Public          |
| `/contact`             | Contact Form        | Logged-in users |
| `/admin/dashboard`     | Admin Dashboard     | Admin only      |
| `/admin/universities`  | Manage Universities | Admin only      |
| `/admin/papers`        | Manage Papers       | Admin only      |

---

## ⚙️ Additional Notes

- The Vite dev server **proxies** all `/api` requests to `http://localhost:5000` (configured in `vite.config.js`), so both servers need to be running.
- Passwords are **hashed** using bcrypt before being stored.
- JWT tokens are sent in the `Authorization: Bearer <token>` header.
- The admin seed only runs if **no admin user** exists in the database.
=======
# PYQHUB
This platform is built with one simple goal — to make previous year question papers easily accessible to every student, completely free of cost, with no ads or distractions.
>>>>>>> ae01fdf5382f2ccf8b487e723c17cc0a006fd076
#   p y q h u b - f r o n t e n d  
 