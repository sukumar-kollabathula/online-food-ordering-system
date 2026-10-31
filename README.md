# Online Food Ordering and Delivery System

## Project Overview

This project is a simple Online Food Ordering and Delivery System built with React (Vite), Python Flask backend, MongoDB, and Apache Cassandra. It demonstrates a full-stack integration of NoSQL databases, REST APIs, and a modern front-end for educational purposes.

---

## Features

- Manage restaurants and food menu with MongoDB (CRUD).
- Shopping cart with real-time availability checking.
- Place orders with Cassandra for order storage.
- Order history retrieval per customer.
- Basic Admin dashboard for managing data.
- Validation, error handling, responsive UI, and real database integration.

---

## Technology Stack

- Frontend: React + Vite + JavaScript
- Styling: CSS
- Backend: Python Flask
- Databases:
  - MongoDB (Restaurants, Menu)
  - Apache Cassandra (Orders)
- API: REST returning JSON
- OS: Windows 10/11 (No Docker required)

---

## Architecture and Data Flow

- React frontend calls Flask APIs.
- Flask interacts with MongoDB for restaurant and menu CRUD.
- Flask interacts with Cassandra for orders.
- Orders stored immutably in Cassandra.
- Real-time validation of menu availability and prices during checkout.

A full Mermaid diagram is planned for `docs/architecture.md`.

---

## Prerequisites and Supported Versions

- Node.js >=18.x
- Python 3.9+
- MongoDB Atlas or local MongoDB 4.4+
- Apache Cassandra 4.x or compatible hosted Cassandra

---

## Setup and Running Instructions

Detailed setup instructions will be completed after all backend and frontend files are assembled.

1. Install Python 3.9+ and Node.js 18+.
2. Configure database credentials using `backend/.env.example` once the backend files are added.
3. Run `setup.bat` from the project root.
4. Configure and initialize MongoDB and Cassandra according to the completed database documentation.
5. Start the backend with `start_backend.bat`.
6. Start the frontend with `start_frontend.bat`.

> **Current status:** This is an in-progress assembly ZIP. Only the root-level files received so far are included. Backend, frontend, database schema, and documentation files still need to be added and checked.
