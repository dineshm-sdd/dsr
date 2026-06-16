// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DSRForm from './pages/DSRForm';
import DSRRecords from './pages/DSRRecords';
import ProjectAnalysis from './pages/ProjectAnalysis';
import TeamMembers from './pages/TeamMembers';
import Projects from './pages/Projects';
import Login from './pages/Login';
import { DSRProvider } from './context/DSRContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
    <Header />
    <Sidebar />
    <main className="flex-1 p-6 lg:p-8 lg:pt-28 pt-28 overflow-auto min-w-0">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <DSRProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><DSRForm /></Layout></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><Layout><DSRRecords /></Layout></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Layout><ProjectAnalysis /></Layout></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><Layout><TeamMembers /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </DSRProvider>
    </ThemeProvider>
  );
}
