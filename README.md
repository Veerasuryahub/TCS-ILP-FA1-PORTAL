# TCS ILP FA1 MASTER - Practice Today, Crack FA1 Tomorrow 🚀

![Vercel](https://vercelbadge.vercel.app/api/veerasuryahub/tcs-ilp-fa1-portal)
![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)

Welcome to **FA1 MASTER**, an official-grade practice assessment portal designed specifically for TCS ILP trainees to ace their FA1 (First Assessment) evaluations. This full-stack MERN application delivers a premium, glassmorphism UI paired with robust backend evaluation tools, simulating the real TCS iON platform experience.

## ✨ Key Features

### 🖥️ Interactive SPQ Code Arena (Hands-on Practice)
*   **Live Compiler Integration**: Simulates standard Unix and Java development environments.
*   **HackerRank-style Interface**: Split-pane view with a beautiful Monaco code editor.
*   **Automated Evaluation**: Code is run securely and tested against both public and hidden evaluation test cases.
*   **Real-time Output**: View precise diffs between your execution output and expected outputs.

### 📝 Comprehensive MCQ Modules
*   **Extensive Question Bank**: Seeded with 60+ highly difficult, randomized questions across multiple subjects (HTML, CSS, JS, Java, Unix, SQL, PL/SQL).
*   **TCS iON Navigation Palette**: Familiar, real-world exam UI featuring flagged questions, answered/unanswered counts, and direct navigation.
*   **Smart Auto-Submit**: Timer countdown automatically submits assessments to prevent data loss.

### 📊 Real-Time Student Dashboard
*   **Gamified Streaks & Badges**: Earn achievements like *Speedster* or *Perfect Score*.
*   **Performance Analytics**: Visual scorecards tracking strengths and weaknesses across all FA1 subjects.
*   **History Logs**: Review previous test submissions, including explanations for wrong answers and code compilation results.

## 🛠️ Technology Stack

**Frontend (Client)**
*   React 19 (Vite)
*   React Router DOM
*   Vanilla CSS (Modern Glassmorphism UI & Animations)
*   Monaco Editor (Code execution interface)
*   Lucide React (Icons)

**Backend (Server)**
*   Node.js & Express.js
*   MongoDB (Mongoose ODM)
*   Vercel Serverless Functions
*   JWT Authentication (bcryptjs)
*   Child Process (Native compiler execution for Java/Unix)

## 🚀 Live Demo

The platform is fully deployed and accessible live!
**Live Link:** [https://tcs-ilp-fa-1-portal.vercel.app/](https://tcs-ilp-fa-1-portal.vercel.app/)

## ⚙️ Local Setup & Installation

To run this application locally, ensure you have Node.js and MongoDB installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Veerasuryahub/TCS-ILP-FA1-PORTAL.git
   cd TCS-ILP-FA1-PORTAL
   ```

2. **Install all dependencies (Frontend & Backend):**
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.mongodb.net/fa1_master
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the Database (Optional):**
   Populate your database with difficult test cases.
   ```bash
   npm run seed
   ```

5. **Start Development Servers:**
   Open two terminals:
   *   **Backend:** `cd server && npm start`
   *   **Frontend:** `cd client && npm run dev`

## ☁️ Vercel Deployment

This repository is pre-configured for zero-config deployment on Vercel:
*   **Build Command**: `npm run build`
*   **Output Directory**: `client/dist`
*   **Install Command**: `npm run install-all`
*   The `api/index.js` serves as the Vercel Serverless Function entrypoint.

## 📄 License
This project is for educational purposes to assist TCS ILP trainees in preparing for assessments. 

---
*Built with passion by Veera Surya* 🚀
