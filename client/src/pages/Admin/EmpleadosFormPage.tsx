import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useEmployees } from "../../context/EmpleadoContext";  // Asegúrate de que la ruta es correcta
import { useNavigate, useParams } from "react-router-dom";

function EmployeesFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createEmployee, getEmployee, updateEmployee } = useEmployees();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadEmployee() {
      if (params.id) {
        const employee = await getEmployee(params.id);
        if (employee) {
          setValue("name", employee.name);
          setValue("email", employee.email);
          setValue("role", employee.role);
        }
      }
    }
    loadEmployee();
  }, [params.id]);  // Agregar params.id aquí
  
 
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (params.id) {
        await updateEmployee(params.id, data);  // Asegúrate de que updateEmployee sea una función asíncrona
      } else {
        await createEmployee(data);
      }
      navigate("/employees");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  

    navigate("/employees");
  });

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          placeholder="Name"
          {...register("name")}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          autoFocus
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
        />

        <label htmlFor="role">Role</label>
        <select
          {...register("role")}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <button className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md text-white mt-4">
          Save
        </button>
      </form>
    </div>
  );
}

export default EmployeesFormPage;
