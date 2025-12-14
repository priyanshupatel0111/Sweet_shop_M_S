# Sweet Shop Management System

A full-stack MERN application for managing a sweet shop with role-based access control (Admin vs Customer).

## Features
- **Authentication**: Register and Login with JWT.
- **Roles**: Admin (manage sweets) and Customer (purchase sweets).
- **Dashboard**: View sweets, search/filter, and purchase.
- **Admin Panel**: Add, Edit, Delete, and Restock sweets.
- **TDD**: Backend built with Test-Driven Development.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, Jest, Supertest.
- **Frontend**: React, Vite, Tailwind CSS.

## Setup Instructions

### Prerequisites
- Node.js installed.
- MongoDB installed and running locally on port 27017.

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   (Or `npm run dev` for nodemon)

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing
To run the backend tests:
```bash
cd server
npm test
```

## AI Usage
This project was generated with the assistance of an AI agent, following a TDD approach. The AI scaffolded the project, wrote tests first, and then implemented the logic to satisfy the tests.
