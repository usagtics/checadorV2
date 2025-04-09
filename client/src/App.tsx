import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TaskPage from './pages/TaskPage';
import HomePage from './pages/HomePage';
import TasksFormPage from './pages/TasksFormPage';
import ProfilePage from './pages/ProfilePage';

import EmployeePage from './pages/Admin/EmpleadoPage';
import EmployeesFormPage from './pages/Admin/EmpleadosFormPage';

import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TasksContext';
import { EmployeeProvider } from './context/EmpleadoContext';
import Navbar from './components/Navbar';
import NavbarAdmin from './components/NavbarAdmin';
import { useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <EmployeeProvider>
          <BrowserRouter>
            <AuthContent />
            <Routes>
              {/* públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/tasks" element={<TaskPage />} />
                <Route path="/add-task" element={<TasksFormPage />} />
                <Route path="/tasks/:id" element={<TasksFormPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* admin */}
                <Route path="/employees" element={<EmployeePage />} />
                <Route path="/add-employee" element={<EmployeesFormPage />} />
                <Route path="/employees/:id" element={<EmployeesFormPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </EmployeeProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

// Componente que usa el hook useAuth
function AuthContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && user?.role === 'admin' ? (
        <NavbarAdmin />
      ) : (
        <Navbar />
      )}
    </>
  );
}

export default App;
