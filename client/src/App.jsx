import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import SubjectDetail from './pages/SubjectDetail';
import MCQPractice from './pages/MCQPractice';
import SPQPractice from './pages/SPQPractice';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';

// Layout for Authenticated Pages
const AppLayout = () => {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      <Navbar />
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '24px', alignItems: 'start' }}>
        <Sidebar />
        
        <main style={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/subjects" element={<StudentDashboard />} /> {/* Fallback or redirect to subjects grid */}
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/mcq-practice" element={<MCQPractice />} />
            <Route path="/spq-practice" element={<SPQPractice />} />
            <Route path="/test/result/:id" element={<ResultPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            {/* Admin only route */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
