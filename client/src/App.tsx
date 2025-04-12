import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TaskPage from './pages/TaskPage';
import HomePage from './pages/HomePage';
import TasksFormPage from './pages/TasksFormPage';
import ProfilePage from './pages/ProfilePage';

import EmployeePage from './pages/Admin/EmpleadoPage';
import EmployeesFormPage from './pages/Admin/EmpleadosFormPage';
import TipoHorarioPage from './pages/Admin/TipoHorarios'; 

import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TasksContext';
import { EmployeeProvider } from './context/EmpleadoContext';
import { TipoHorarioProvider } from "./context/tipoHorarioContext"; 
import Navbar from './components/Navbar';
import NavbarAdmin from './components/NavbarAdmin';
import { useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <EmployeeProvider>
          <TipoHorarioProvider> 
            <BrowserRouter>
              <AuthContent />
              <Routes>
     
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/tasks" element={<TaskPage />} />
                  <Route path="/add-task" element={<TasksFormPage />} />
                  <Route path="/tasks/:id" element={<TasksFormPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

            
                  <Route path="/employees" element={<EmployeePage />} />
                  <Route path="/add-employee" element={<EmployeesFormPage />} />
                  <Route path="/employees/:id" element={<EmployeesFormPage />} />

              
                  <Route path="/tipo-horario" element={<TipoHorarioPage />} /> {/* ✅ Nueva ruta */}
                </Route>
              </Routes>
            </BrowserRouter>
          </TipoHorarioProvider>
        </EmployeeProvider>
      </TaskProvider>
    </AuthProvider>
  );
}


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
