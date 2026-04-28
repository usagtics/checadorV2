import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useEmployees } from "../../context/EmpleadoContext";
import { useNavigate, useParams } from "react-router-dom";
import MenuAdmin from "../../menu/menuAdmin";
import axios from "axios";

// Interfaces (Opcionales si no usas TypeScript estricto)
interface TipoHorario {
  _id: string;
  nombre: string;
  hora_entrada: string;
  hora_salida: string;
}

interface Plantel {
  _id: string;
  nombre: string;
  ubicacion?: string;
}

function EmployeesFormPage() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
      tipoHorario: "",
      plantel: "",
    },
  });

  const { createEmployee, getEmployee, updateEmployee } = useEmployees();
  const navigate = useNavigate();
  const params = useParams();

  const [tiposHorario, setTiposHorario] = useState<TipoHorario[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHorarios, resPlanteles] = await Promise.all([
          axios.get("http://localhost:4000/api/tipohorarios"),
          axios.get("http://localhost:4000/api/planteles"),
        ]);

        setTiposHorario(resHorarios.data);
        setPlanteles(resPlanteles.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    const fetchEmployee = async () => {
      if (params.id) {
        try {
          const employee = await getEmployee(params.id);
          setEmployeeData(employee);
        } catch (error) {
          console.error("Error al cargar el empleado:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setEmployeeData(null);
        setLoading(false);
      }
    };

    fetchData();
    fetchEmployee();
    
    // CORRECCIÓN AQUÍ: Quitamos 'getEmployee' para detener el bucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]); 

  useEffect(() => {
    if (employeeData && isFirstLoad.current) {
      reset({
        name: employeeData.name || "",
        email: employeeData.email || "",
        role: employeeData.role || "employee",
        tipoHorario: employeeData.tipoHorario?._id || "",
        plantel: employeeData.plantel?._id || "",
      });
      isFirstLoad.current = false;
    }
  }, [employeeData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!data.tipoHorario) {
      alert("Selecciona un tipo de horario.");
      return;
    }

    if (!data.plantel) {
      alert("Selecciona un plantel.");
      return;
    }

    try {
      if (params.id) {
        await updateEmployee(params.id, {
          ...data,
          tipoHorario: data.tipoHorario,
          plantel: data.plantel,
        });
      } else {
        await createEmployee({
          ...data,
          tipoHorario: data.tipoHorario,
          plantel: data.plantel,
        });
      }
      navigate("/employees");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar el empleado.");
    }
  });

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="flex min-h-screen">
      <MenuAdmin />
      <div className="flex-1 bg-gray-100 p-10">
        <div className="bg-white shadow-lg max-w-md w-full p-8 rounded-2xl mx-auto">
          <form onSubmit={onSubmit}>
            <label htmlFor="name" className="text-gray-800 font-semibold">
              Nombre
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Nombre"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg my-2 text-gray-800"
            />

            <label htmlFor="email" className="text-gray-800 font-semibold">
              Correo electrónico
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Correo"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg my-2 text-gray-800"
            />

            <label htmlFor="role" className="text-gray-800 font-semibold">
              Rol
            </label>
            <select
              {...register("role")}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg my-2 text-gray-800"
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </select>

            <label htmlFor="plantel" className="text-gray-800 font-semibold">
              Plantel
            </label>
            <select
              {...register("plantel")}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-800 w-full my-2"
            >
              <option value="">Seleccionar plantel</option>
              {planteles.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <label htmlFor="tipoHorario" className="text-gray-800 font-semibold">
              Tipo de horario
            </label>
            <select
              {...register("tipoHorario")}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-800 w-full my-2"
            >
              <option value="">Seleccionar horario</option>
              {tiposHorario.map((tipo) => (
                <option key={tipo._id} value={tipo._id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
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