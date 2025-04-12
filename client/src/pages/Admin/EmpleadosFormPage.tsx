import React, { useEffect, useState  } from "react";
import { useForm } from "react-hook-form";
import { useEmployees } from "../../context/EmpleadoContext";
import { useTipoHorarios } from "../../context/tipoHorarioContext";
import { useNavigate, useParams } from "react-router-dom";
import MenuAdmin from "../../menu/menuAdmin";


interface TipoHorario {
  _id: string;
  nombre: string;
}

function EmployeesFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createEmployee, getEmployee, updateEmployee } = useEmployees();
  const { tipoHorarios } = useTipoHorarios();
  const navigate = useNavigate();
  const params = useParams();
  const [tiposHorario, setTiposHorario] = useState<TipoHorario[]>([]);



useEffect(() => {
  async function fetchTiposHorario() {
    try {
      const res = await fetch("http://localhost:4000/api/tipo-horario");
      const data = await res.json();
      setTiposHorario(data); 
    } catch (error) {
      console.error("Error al cargar tipos de horario", error);
    }
  }

  fetchTiposHorario();
}, []);



  useEffect(() => {
    async function loadEmployee() {
      if (params.id) {
        const employee = await getEmployee(params.id);
        if (employee) {
          setValue("name", employee.name);
          setValue("email", employee.email);
          setValue("role", employee.role);
          setValue("tipoHorarioId", employee.tipoHorarioId); 
        }
      }
    }
    loadEmployee();
  }, [params.id, getEmployee, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (params.id) {
        await updateEmployee(params.id, data);
      } else {
        await createEmployee(data);
      }
      navigate("/employees");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  return (
    <div className="flex min-h-screen">
      <MenuAdmin />

      <div className="flex-1 bg-gray-100 p-10">
        <div className="bg-white shadow-lg max-w-md w-full p-8 rounded-2xl mx-auto transition-all duration-300">
          <form onSubmit={onSubmit}>
            <label htmlFor="name" className="text-gray-700 block font-medium">
              Name
            </label>
            <input
              type="text"
              placeholder="Name"
              {...register("name")}
              className="w-full border border-gray-300 text-gray-800 px-4 py-2 rounded-lg my-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />

            <label htmlFor="email" className="text-gray-700 block font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full border border-gray-300 text-gray-800 px-4 py-2 rounded-lg my-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label htmlFor="role" className="text-gray-700 block font-medium">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full border border-gray-300 text-gray-800 px-4 py-2 rounded-lg my-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            <label htmlFor="tipoHorarioId" className="text-gray-700 block font-medium">
              Tipo de Horario
            </label>
            <select
  {...register("tipoHorarioId", { required: "Este campo es obligatorio" })}
  className="w-full border border-gray-300 text-gray-800 px-4 py-2 rounded-lg my-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
>
  <option value="">Selecciona un tipo de horario</option>
  {tiposHorario.map((horario: TipoHorario) => (
    <option key={horario._id} value={horario._id}>
      {horario.nombre}
    </option>
  ))}
</select>


            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="bg-blue-400 px-4 py-2 rounded-md text-white mt-4"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mt-4"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployeesFormPage;
