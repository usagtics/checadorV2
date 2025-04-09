import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signup, user, isAuthenticated, errors: RegisterErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/employees'); 
      } else {
        navigate('/tasks'); 
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    await signup(values); // Enviamos los valores para el registro
  });

  return (
    <div className="bg-sky-200 max-w-md p-10 rounded-md">
      {RegisterErrors.map((error: string, i: number) => (
        <div key={i} className="bg-red-500 p-2 text-white">
          {error}
        </div>
      ))}

      <form onSubmit={onSubmit}>
        <input
          type="text"
          {...register('username', { required: true })}
          className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
          placeholder="Username"
        />
        {errors.username && <p className="text-red-500">Username is required</p>}

        <input
          type="email"
          {...register('email', { required: true })}
          className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
          placeholder="Email"
        />
        {errors.email && <p className="text-red-500">Email is required</p>}

        <input
          type="password"
          {...register('password', { required: true })}
          className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
          placeholder="Password"
        />
        {errors.password && <p className="text-red-500">Password is required</p>}

        {/* Selección de rol, siempre visible */}
        <div className="my-2">
          <label className="block text-gray-700">Select Role:</label>
          <select
            {...register('role', { required: true })}
            className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md"
          >
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </select>
          {errors.role && <p className="text-red-500">Role is required</p>}
        </div>

        <button type="submit" className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md">
          Register
        </button>
      </form>
      <p className="flex gap-x-2 justify-between">
        Don't have an account?{' '}
        <Link to="/login" className="text-sky-500">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
