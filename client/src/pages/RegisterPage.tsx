import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MenuAdmin from "../menu/menuAdmin";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signup, errors: RegisterErrors } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    await signup(values);
  
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuAdmin />

      <div className="flex flex-col items-center justify-center flex-1 p-6 overflow-auto">
        <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8 border-t-4 border-sky-500">
          <h1 className="text-3xl font-bold text-center text-sky-600 mb-6">Registro de Usuarios</h1>

          {RegisterErrors.map((error: string, i: number) => (
            <div key={i} className="bg-red-500 text-white px-4 py-2 rounded mb-2 text-sm shadow">
              {error}
            </div>
          ))}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
              <input
                type="text"
                {...register('username', { required: true })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">Username is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">Email is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                {...register('password', { required: true })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">Password is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                {...register('role', { required: true })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">-- Elige un rol --</option>
                <option value="admin">Admin</option>
<option value="employee">Empleado</option> // ✅ este debe coincidir con el enum
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">Role is required</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
            >
              Registrar
            </button>
          </form>

      <p className="text-center text-sm text-gray-600 mt-6">
  ¿Ya tienes una cuenta?{' '}
  <button
    type="button"
    onClick={() => navigate('/login')}
    className="text-sky-600 hover:underline font-medium"
  >
    Iniciar sesión
  </button>
</p>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
