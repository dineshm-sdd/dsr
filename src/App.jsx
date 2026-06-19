// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import DSRForm from "./pages/DSRForm";
import DSRRecords from "./pages/DSRRecords";
import ProjectAnalysis from "./pages/ProjectAnalysis";
import TeamMembers from "./pages/TeamMembers";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import { DSRProvider } from "./context/DSRContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PrivateRoute } from "./utils/PrivateRoute";

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

const Layout = ({ children }) => (
  <div className=" min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
    <Header />
    <main className="w-full flex   h-[calc(100vh-105px)] overflow-hidden">
      <Sidebar />
      <div className="w-full mx-auto py-6 flex-1 px-5 max-w-full overflow-auto">
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
            <Route element={<PrivateRoute />}>
              <Route
                path="/"
                element={
                  <Layout>
                    <DSRForm />
                  </Layout>
                }
              />
              <Route
                path="/records"
                element={
                  <Layout>
                    <DSRRecords />
                  </Layout>
                }
              />
              <Route
                path="/analysis"
                element={
                  <Layout>
                    <ProjectAnalysis />
                  </Layout>
                }
              />
              <Route
                path="/projects"
                element={
                  <Layout>
                    <Projects />
                  </Layout>
                }
              />
              <Route
                path="/members"
                element={
                  <Layout>
                    <TeamMembers />
                  </Layout>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </DSRProvider>
    </ThemeProvider>
  );
}
