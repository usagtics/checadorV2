import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// CONTEXTOS
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TasksContext';
import { EmployeeProvider } from './context/EmpleadoContext';
import { TipoHorarioProvider } from './context/tipohorarioContext'; 
import { PlantelesProvider } from "./context/plantelesContext";
// ✅ AQUI ESTÁ EL CONTEXTO RENOMBRADO PARA LAS ASISTENCIAS DE DOCENTES
import { ChecadasDocenteProvider } from './context/checadasDocenteContext'; 
import { ReporteChecadasProvider } from './context/ReporteChecadasContext'; 
import { DocenteProvider, useDocentes } from './context/DocenteContext';
import { AcademicoProvider } from './context/AcademicoContext';
import { GrupoProvider } from './context/GrupoContext'; 
import { DirectivoProvider, useDirectivo } from './context/DirectivoContext';

// COMPONENTES
import Navbar from './components/Navbar';
import NavbarAdmin from './components/NavbarAdmin';
import NavbarDocente from './components/NavbarDocente';
import ProtectedRoute from './ProtectedRoute'; 

// PÁGINAS
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskPage from './pages/TaskPage';
import TasksFormPage from './pages/TasksFormPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/Admin/DashboardPage';
import EmployeePage from './pages/Admin/EmpleadoPage';
import EmployeesFormPage from './pages/Admin/EmpleadosFormPage';
import TipoHorarioPage from './pages/Admin/tipohorarioPage';
import PlantelesPage from './pages/Admin/plantelesPage';
import ChecadaPage from './pages/ChecadasPage';
import ReporteChecadasPage from './pages/Admin/ReporteChecadas';
import ChecadorPage from './pages/Docentes/ChecadorPage';
import DocenteFormPage from './pages/AdminDocentes/DocenteFormPage'; 
import AsignacionAcademicaPage from './pages/AdminDocentes/AsignacionAcademicaPage';
import { DirectivoLoginPage } from './pages/AdminDocentes/DirectivoLoginPage'; 
import DocentesListPage from './pages/AdminDocentes/DocentesListPage';
import MateriasListPage from './pages/AdminDocentes/MateriasListPage'; 
import MateriaFormPage from './pages/AdminDocentes/MateriaFormPage';
import DirectivosPage from './pages/AdminDocentes/DirectivosPage'; 
import DirectivoFormPage from './pages/AdminDocentes/DirectivoFormPage'; 
import GruposListPage from './pages/AdminDocentes/GruposListPage'; 
import GrupoFormPage from './pages/AdminDocentes/GrupoFormPage';   
import DashboardDirectivoPage from './pages/AdminDocentes/DashboardDirectivoPage'; 
import DocenteDashboardPage from './pages/AdminDocentes/DocenteDashboardPage'; 
import ReporteAsistenciaDocentesPage from './pages/AdminDocentes/ReporteAsistenciaDocentesPage';
import NominaPage from './pages/AdminDocentes/NominaPage';

function App() {
  return (
    <AuthProvider>
      <DirectivoProvider>
        <TaskProvider>
          <EmployeeProvider>
            <TipoHorarioProvider>
              <PlantelesProvider>
                <ChecadasDocenteProvider>
                  <ReporteChecadasProvider>  
                    <DocenteProvider>
                      <GrupoProvider> 
                        <AcademicoProvider>
                          <BrowserRouter>
                            <AuthContent />
                            <Routes>
                              
                              {/* --- RUTAS PÚBLICAS --- */}
                              <Route path="/" element={<HomePage />} />
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/directivo/login" element={<DirectivoLoginPage />} />
                              <Route path="/checador" element={<ChecadorPage />} />

                              {/* --- RUTAS PROTEGIDAS PARA TODOS (DOCENTES Y ADMINS) --- */}
                              <Route element={<ProtectedRoute />}>
                                
                                {/* Panel exclusivo del Docente */}
                                <Route path="/docente/inicio" element={<DocenteDashboardPage />} />

                                {/* Rutas de Directivos / Admins */}
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/tasks" element={<TaskPage />} />
                                <Route path="/add-task" element={<TasksFormPage />} />
                                <Route path="/tasks/:id" element={<TasksFormPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/checadas" element={<ChecadaPage />} />
                                <Route path="/employees" element={<EmployeePage />} />
                                <Route path="/add-employee" element={<EmployeesFormPage />} />
                                <Route path="/employees/:id" element={<EmployeesFormPage />} />
                                <Route path="/tipo-horarios" element={<TipoHorarioPage />} />
                                <Route path="/planteles" element={<PlantelesPage />} />
                                <Route path="/reporte-checadas" element={<ReporteChecadasPage />} />
                                
                                <Route path="/admin/directivos" element={<DirectivosPage />} />
                                <Route path="/admin/directivos/nuevo" element={<DirectivoFormPage />} />

                                <Route path="/admin" element={<DashboardDirectivoPage />} />
                                
                                {/* ✅ AQUÍ ESTÁ LA SOLUCIÓN: Ambas rutas (Crear y Editar) apuntan al mismo Formulario */}
                                <Route path="/admin/registro-docente" element={<DocenteFormPage />} />
                                <Route path="/admin/registro-docente/:id" element={<DocenteFormPage />} />

                                <Route path="/admin/docentes" element={<DocentesListPage />} />
                                <Route path="/admin/asignacion" element={<AsignacionAcademicaPage />} />
                                <Route path="/admin/materias" element={<MateriasListPage />} />
                                <Route path="/admin/materias/nueva" element={<MateriaFormPage />} />
                                <Route path="/admin/grupos" element={<GruposListPage />} />
                                <Route path="/admin/grupos/nuevo" element={<GrupoFormPage />} />
                                
                                <Route path="/admin/asistencia-docentes" element={<ReporteAsistenciaDocentesPage />} />
                                
                                <Route path="/admin/nomina" element={<NominaPage />} />

                              </Route>

                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </BrowserRouter>
                        </AcademicoProvider>
                      </GrupoProvider>
                    </DocenteProvider>
                  </ReporteChecadasProvider>
                </ChecadasDocenteProvider>
              </PlantelesProvider>
            </TipoHorarioProvider>
          </EmployeeProvider>
        </TaskProvider>
      </DirectivoProvider>
    </AuthProvider>
  );
}

function AuthContent() {
  const { isAuthenticated: isAuth, user: authUser } = useAuth();
  const { isAuthenticated: isDirectivo } = useDirectivo();
  const { isAuthenticated: isDocentes } = useDocentes(); 

  // 1. Si es un maestro, le mostramos su barra exclusiva
  if (isDocentes) {
    return <NavbarDocente />;
  }

  // 2. Si es el Director o un Administrador, le mostramos la barra administrativa
  if (isDirectivo || (isAuth && authUser?.role === 'admin')) {
    return <NavbarAdmin />;
  }

  // 3. Si es un usuario general (colaborador), le mostramos la normal
  if (isAuth) {
    return <Navbar />;
  }

  // 4. Si nadie ha iniciado sesión, no mostramos nada (Login limpio)
  return null;
}

export default App;