Smart Task Tracker (CA Firm)



# Overview

Smart Task Tracker is a full-stack web app for CA firms, designed to simplify task and workflow management. It supports:

Role-based dashboards (Admin/User)

Dual-approval workflow: tasks require both user and admin completion

Recurring tasks, subtasks, and in-app reminders

Soft delete / restore (Trash management)

Bulk task upload via Excel/CSV

Analytics & exportable reports

It helps CA firms track tasks efficiently, reduce manual effort, and maintain accountability.




# Features
Admin

Create and assign tasks to self or users

Edit tasks, mark admin-complete, reassign, or update due dates/priority

View all tasks under users (Self / All Users / Waiting for Approval)

Apply filters, sorting, and focus mode (Today/Week/Month)

Soft delete and restore tasks

Bulk upload tasks via Excel/CSV

View analytics: completion trends, overdue tasks, breakdown by category & priority

Export reports as PDF

User

View assigned tasks only

Mark subtasks and self-complete tasks

Filter, search, sort, and focus mode

Soft delete own tasks

View personal analytics and export reports



# Tech Stack

Frontend: React, React Router, Bootstrap, Axios, react-toastify, chrono-node, xlsx
Backend: Node.js, Express.js, MongoDB, Mongoose
Auth & Security: JWT, bcryptjs, express-validator, CORS
Testing: Jest + Supertest
Deployment: Frontend: Vercel | Backend: Render



# Installation & Setup
Prerequisites

Node.js (v16+)

MongoDB (local or Atlas)

Clone Repo
git clone https://github.com/YOUR_USERNAME/smart-tracker-app-ca-firm.git
cd smart-tracker-app-ca-firm

Backend Setup
cd server
npm install
cp .env.example .env
 Set MONGO_URI, JWT_SECRET, PORT
npm start

Frontend Setup
cd client
npm install
cp .env.example .env
SET REACT_APP_API_URL=http://localhost:5000
npm start


Visit http://localhost:3000 to access the app.



# Usage

Sign Up / Login as Admin or User

Admin: select admin type, manage tasks & users

User: select admin, view assigned tasks

Dashboard: add tasks, mark completion, filter, edit, delete

Analytics: track trends, view charts, export reports

Trash: restore or permanently delete tasks

Bulk Upload: Admin imports multiple tasks from Excel/CSV



# Project Architecture

Backend:

index.js → Entry point

routes/ → authRoutes, taskRoutes, aiRoutes

models/ → User, Task

middleware/ → authMiddleware (JWT + RBAC)

config/db.js → MongoDB connection

tests/ → Jest + Supertest

Frontend:

src/pages/ → Dashboard, Analytics, Trash, Auth pages

src/components/ → TaskForm, TaskList, TaskStats, Filters

src/context/AuthContext.js → JWT + user state

src/utils/ → helper functions (dates, filtering, xlsx parsing)




# Screenshots / Demo

Dashboard:


Analytics:


Task Form & Bulk Upload:


Trash & Restore:



# Testing
cd server
npm test
Covers Auth, Task CRUD, Stats, Permissions, Trash/Restore, Dual Completion workflow


# Security & Permissions

JWT-based authentication

Role-based access control (Admin/User)

Input validation via express-validator

Password hashing with bcryptjs

Soft-delete & ownership checks for task deletion




# Future Improvements

AI-powered task suggestions

Email/SMS reminders for tasks

Pagination & caching for better performance

Enhanced mobile responsiveness

Advanced analytics with drill-downs & filters






