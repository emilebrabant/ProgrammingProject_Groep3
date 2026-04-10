import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCreateUser from './pages/admin/AdminCreateUser';
import ChangePasswordFirstLogin from './pages/login/ChangePasswordFirstLogin';
import Dashboard from './pages/Dashboard';
import StageNieuw from './pages/student/StageNieuw';
import StageOverzicht from './pages/student/StageOverzicht'
import CommissieOverzicht from './pages/commissie/CommissieOverzicht';
import StageDetail from './pages/commissie/StageDetail';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/change-password-first-login"
            element={
              <ProtectedRoute allowFirstLoginBypass>
                <ChangePasswordFirstLogin />
              </ProtectedRoute>
            }
            
          />

          
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin/users" replace />}
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCreateUser />
              </ProtectedRoute>
            }
            
          />

          <Route path="/dashboard" element={
    <ProtectedRoute allowedRoles={['student', 'commissie', 'docent', 'mentor']}>
        <Dashboard />
    </ProtectedRoute>
} />
<Route
            path="/student/stages"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StageOverzicht />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/stages/nieuw"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StageNieuw />
              </ProtectedRoute>
            }
          />


<Route
            path="/commissie/stages"
            element={
              <ProtectedRoute allowedRoles={['commissie', 'admin']}>
              <CommissieOverzicht />
              </ProtectedRoute>
            }
          />


  <Route
            path="/commissie/stages/:id"
            element={
              <ProtectedRoute allowedRoles={['commissie', 'admin']}>
                <StageDetail />
            </ProtectedRoute>
         }
          />

        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}