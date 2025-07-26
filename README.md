# Polling System – Backend

This is the **backend server** for a full-stack polling system built with **Node.js**, **Express**, and **MongoDB**. It supports **secure authentication**, **role-based access control**, **poll creation**, **voting**, and **result management**.

---
## Deployed Links

- 👉 [Frontend Live URL](https://polling-system-ui.netlify.app/)
- 🌐 [Backend API](https://polling-system-backend-8q7m.onrender.com)
  
----

## GitHub Repositories

[Frontend GitHub Repo](https://github.com/nandhinigurumoorthyy/Polling-System-Frontend.git)

-----

## 🚀 Features

### 🔐 Authentication

* Secure **user registration**, **login**, and **logout** endpoints.
* Passwords are securely hashed using **bcrypt**.
* **JWT (JSON Web Tokens)** are used for token-based authentication.

### 👥 Role-Based Access

* Users have two roles:

  * **Admin**: Full control over poll creation and management.
  * **User**: Can vote on eligible polls.
* Access to all routes is controlled based on user role.

---

## 🗳️ Polling System Functionality

### ✅ Poll Creation (Admin Only)

* Admins can create polls with:

  * Title
  * Options (minimum 2 required)
  * Visibility: **Public** or **Private**
  * Allowed Users (for private polls)
  * Duration (max 120 minutes)

### 🔄 Poll Management (Admin Only)

* **View all polls** created by the admin
* **Edit** active polls only
* **Delete** any of their own polls
* Prevents editing of expired polls

### 🔓 Poll Visibility

* **Public Polls**: Visible to all users
* **Private Polls**: Only visible to selected users added by the admin

### ⏰ Poll Expiry

* Polls automatically expire after the set time (max: 2 hours)
* Users cannot vote on expired polls, but can still view results

---

## 🗳️ User Voting

* Users can:

  * View all **public polls**
  * View **private polls** they are invited to
  * Vote on **active** polls only
  * View vote counts and results of **polls they participated in**

---

## ⚠️ Edge Case Handling

* ✅ Only eligible users can vote in private polls
* 🔐 Duplicate voting is prevented
* ❌ Cannot vote on expired polls
* 🛡️ Validates all poll data (title, options, duration)
* ⚠️ Handles token expiration securely

---

## 📦 Tech Stack

* **Node.js** + **Express.js**
* **MongoDB** + **Mongoose**
* **JWT** for authentication
* **bcryptjs** for password hashing
* **dotenv** for environment configuration
* **CORS** and **helmet** for security

---

## ⚙️ Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/polling-backend.git
   cd polling-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root:

   ```env
   PORT=10000
   DB_USER_NAME=mongo_user
   DB_USER_PASSWORD=mongo_pass
   DB_NAME=poll
   JWT_SECRET=secret_key
   ```

4. **Start the server**:

   ```bash
   npm start
   ```

---

## 📁 Folder Structure

```
├── models/         # Mongoose schemas (User, Poll)
├── controller/         
├── guards/     
├── auth/
├── index.js       # Entry point
├── .env            # Environment variables
```

---

## 📬 API Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `GET /users/me` – Get current user info

### Polls

* `POST /polls` – Create poll (Admin)
* `GET /polls` – Get all polls (Admin)
* `GET /polls/available` – Get available polls (User)
* `PUT /polls/:id` – Edit poll (Admin)
* `DELETE /polls/:id` – Delete poll (Admin)
* `POST /polls/:id/vote` – Vote on a poll (User/Admin)

---

## 📌 Notes

* Admins can **vote** in polls too.
* Token must be sent in the `Authorization` header for all protected routes:

  ```
  Authorization: Bearer <token>
  ```

---

## 📄 License

This project is licensed under the MIT License.

