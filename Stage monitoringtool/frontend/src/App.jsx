import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCreateUser from './pages/admin/AdminCreateUser';
import AdminStageHistoriek from './pages/admin/AdminStageHistoriek';
import AdminStageDetail from './pages/admin/AdminStageDetail';
import ChangePasswordFirstLogin from './pages/login/ChangePasswordFirstLogin';
import StageNieuw from './pages/student/StageNieuw';
import StudentStagevoorstellen from './pages/student/StudentStagevoorstellen';
import StudentLogboeken from './pages/student/StudentLogboeken';
import StudentEvaluaties from './pages/student/StudentEvaluaties';
import CommissieOverzicht from './pages/commissie/CommissieOverzicht';
import StageDetail from './pages/commissie/StageDetail';
import MentorKoppelingStudenten from './pages/mentor/MentorKoppelingStudenten';
import MentorLogboeken from './pages/mentor/MentorLogboeken';
import DocentStudenten from './pages/docent/DocentStudenten';
import DocentLogboeken from './pages/docent/DocentLogboeken';


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
          <Route
            path="/admin/stages"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStageHistoriek />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stages/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStageDetail />
              </ProtectedRoute>
            }
          />

          <Route path="/dashboard" element={<Navigate to="/docent/studenten" replace />} />
          <Route
            path="/docent/studenten"
            element={
              <ProtectedRoute allowedRoles={['docent']}>
                <DocentStudenten />
              </ProtectedRoute>
            }
          />
          <Route
            path="/docent/logboeken"
            element={
              <ProtectedRoute allowedRoles={['docent']}>
                <DocentLogboeken />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/koppeling-studenten"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorKoppelingStudenten />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/logboeken"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorLogboeken />
              </ProtectedRoute>
            }
          />
<Route
            path="/student/stagevoorstellen"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentStagevoorstellen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/logboeken"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLogboeken />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/evaluaties"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentEvaluaties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/stages"
            element={<Navigate to="/student/stagevoorstellen" replace />}
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
            path="/student/stages/:id/aanpassen"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StageNieuw />
              </ProtectedRoute>
            }
          />


<Route
            path="/commissie/stages"
            element={
              <ProtectedRoute allowedRoles={['commissie']}>
              <CommissieOverzicht />
              </ProtectedRoute>
            }
          />


  <Route
            path="/commissie/stages/:id"
            element={
              <ProtectedRoute allowedRoles={['commissie']}>
                <StageDetail />
            </ProtectedRoute>
         }
          />

        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}