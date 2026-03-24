import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './auth/pages/Login';
import AuthCallback from './auth/pages/AuthCallback';
import Laptops from './pages/Laptops';
import Mobiles from './pages/Mobiles';
import RAM from './pages/RAM';
import Mouse from './pages/Mouse';
import Keyboard from './pages/Keyboard';
import M2RAM from './pages/M2RAM';
import InternLaptop from './pages/InternLaptop';
import Converter from './pages/Converter';
import ExtraEquipment from './pages/ExtraEquipment';
import HDDStorage from './pages/HDDStorage';
import Pendrive from './pages/Pendrive';
import Monitors from './pages/Monitors';
import ClientDevices from './pages/ClientDevices';
import RentList from './pages/RentList';
import DashboardManagement from './pages/DashboardManagement';
import Settings from './pages/Settings';
import Equipment from './pages/Equipment';
import Vendors from './pages/Vendors';
import Tickets from './pages/Tickets';
import People from './pages/People';
const SwaggerDocs = lazy(() => import('./pages/SwaggerDocs'));

function PrivateRoute() {
  const { user } = useAuth();
  const stored = localStorage.getItem('user');
  return (user || stored) ? <Outlet /> : <Navigate to="/login" replace />;
}

// Single shared layout — sidebarCollapsed state lives here, never resets on navigation
function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar collapsed={sidebarCollapsed} />
        <button
          className="sidebar-toggle-btn"
          style={{ left: sidebarCollapsed ? 43 : 207 }}
          onClick={() => setSidebarCollapsed((c) => !c)}
          title="Toggle sidebar"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {sidebarCollapsed
              ? <polyline points="9 18 15 12 9 6"/>
              : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
        <main className={`app-main${sidebarCollapsed ? ' app-main--expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* All protected pages share ONE AppLayout instance */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/"        element={<Dashboard />} />
              <Route path="/assets"  element={<Dashboard />} />
              <Route path="/laptops" element={<Laptops />} />
              <Route path="/mobiles" element={<Mobiles />} />
              <Route path="/mouse"           element={<Mouse />} />
              <Route path="/ram"             element={<RAM />} />
              <Route path="/keyboard"        element={<Keyboard />} />
              <Route path="/m2-ram"          element={<M2RAM />} />
              <Route path="/intern-laptops"  element={<InternLaptop />} />
              <Route path="/converters"      element={<Converter />} />
              <Route path="/extra-equipment" element={<ExtraEquipment />} />
              <Route path="/hdd-storage"     element={<HDDStorage />} />
              <Route path="/pendrive"        element={<Pendrive />} />
              <Route path="/monitors"        element={<Monitors />} />
              <Route path="/client-devices"  element={<ClientDevices />} />
              <Route path="/rent-list"       element={<RentList />} />
              <Route path="/vendors"             element={<Vendors />} />
              <Route path="/tickets"             element={<Tickets />} />
              <Route path="/api-docs"            element={<Suspense fallback={<div style={{padding:40,color:'var(--clr-text-muted)'}}>Loading API docs…</div>}><SwaggerDocs /></Suspense>} />
              <Route path="/dashboard-management" element={<DashboardManagement />} />
              <Route path="/settings"        element={<Settings />} />
              <Route path="/equipment"       element={<Equipment />} />
              <Route path="/people"          element={<People />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
