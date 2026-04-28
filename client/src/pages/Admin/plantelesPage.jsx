import React, { useEffect, useState } from "react";
import { usePlanteles } from "../../context/plantelesContext";
import Swal from "sweetalert2";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaPlus,
  FaNetworkWired // Icono para la IP
} from "react-icons/fa";
import MenuAdmin from "../../menu/menuAdmin";

const PlantelesPage = () => {
  const { planteles, getPlanteles, createPlantel, updatePlantel, deletePlantel } = usePlanteles();

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ipsPermitidas: "", // Campo nuevo para las IPs (texto)
    activo: true,
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getPlanteles();
  }, [getPlanteles]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre || !formData.direccion || !formData.ipsPermitidas) {
      return Swal.fire("Error", "Nombre, dirección e IPs son obligatorios", "error");
    }

    try {
      // PREPARACIÓN DE DATOS:
      // Convertimos el texto "1.1.1.1, 2.2.2.2" -> Array ["1.1.1.1", "2.2.2.2"]
      const datosEnviar = {
        ...formData,
        ipsPermitidas: formData.ipsPermitidas.split(',').map(ip => ip.trim()).filter(ip => ip !== "")
      };

      // Si es creación, agregamos fecha automática (si el backend no lo hace solo)
      if (!editMode) {
        datosEnviar.fechaCreacion = new Date().toISOString();
      }

      if (editMode) {
        await updatePlantel(editingId, datosEnviar);
        Swal.fire("Actualizado", "Plantel actualizado correctamente", "success");
      } else {
        await createPlantel(datosEnviar);
        Swal.fire("Creado", "Plantel creado correctamente", "success");
      }

      // Limpiar y cerrar
      setFormData({ nombre: "", direccion: "", ipsPermitidas: "", activo: true });
      setEditMode(false);
      setEditingId(null);
      setShowForm(false);
      await getPlanteles();

    } catch (error) {
      console.error(error);
      // Mostramos el mensaje exacto del backend (ej: "Debes registrar una IP...")
      const mensajeError = error.response?.data?.message || "Hubo un problema al guardar";
      Swal.fire("Error", mensajeError, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el plantel permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      await deletePlantel(id);
      await getPlanteles();
      Swal.fire("Eliminado", "El plantel ha sido eliminado exitosamente", "success");
    }
  };

  const handleEdit = (plantel) => {
    // Al editar, convertimos el Array de IPs a Texto para mostrarlo en el input
    const ipsString = Array.isArray(plantel.ipsPermitidas) 
      ? plantel.ipsPermitidas.join(", ") 
      : "";

    setFormData({
      nombre: plantel.nombre || "",
      direccion: plantel.direccion || "",
      ipsPermitidas: ipsString,
      activo: plantel.activo !== undefined ? plantel.activo : true,
    });
    setEditMode(true);
    setEditingId(plantel._id);
    setShowForm(true);
  };

  const handleRegisterNew = () => {
    setFormData({ nombre: "", direccion: "", ipsPermitidas: "", activo: true });
    setEditMode(false);
    setEditingId(null);
    setShowForm(!showForm);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <MenuAdmin />

      <div className="flex-1 ml-64 p-8 pt-24 overflow-y-auto h-screen">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaBuilding className="text-blue-600" />
              Gestión de Planteles
            </h2>
            <p className="text-gray-500 mt-1">Administra las sedes y sus IPs autorizadas.</p>
          </div>
          
          <button
            onClick={handleRegisterNew}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg shadow-md transition-all transform hover:scale-105 ${
              showForm
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {showForm ? "Cerrar Formulario" : <><FaPlus /> Nuevo Plantel</>}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 animate-fade-in-down">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {editMode ? "Editar Plantel" : "Registrar Nuevo Plantel"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plantel</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaBuilding />
                    </span>
                    <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Campus Central"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
              </div>
              
              {/* Dirección */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaMapMarkerAlt />
                    </span>
                    <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej. Av. Universidad #123"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
              </div>

              {/* CAMPO NUEVO: IPs Autorizadas */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">IPs Autorizadas (WiFi)</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaNetworkWired />
                    </span>
                    <input
                    type="text"
                    name="ipsPermitidas"
                    value={formData.ipsPermitidas}
                    onChange={handleChange}
                    placeholder="Ej. 192.168.1.1, 10.0.0.5 (Separadas por comas)"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Ingresa las direcciones IP públicas permitidas separadas por comas.</p>
              </div>

              {/* Checkbox Activo */}
              <div className="col-span-2">
                <label className="inline-flex items-center cursor-pointer p-2 border border-gray-200 rounded-lg bg-gray-50 w-full hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium select-none">
                    Plantel Operativo / Activo
                  </span>
                </label>
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-2">
                 <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                 >
                    Cancelar
                 </button>
                 <button
                    type="submit"
                    className="px-8 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition"
                 >
                    {editMode ? "Actualizar" : "Guardar"}
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plantel</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IPs Autorizadas</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {planteles.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <FaBuilding className="text-4xl text-gray-300 mb-2" />
                                <p>No hay planteles registrados.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    planteles.map((plantel) => (
                    <tr key={plantel._id} className="hover:bg-blue-50 transition-colors duration-150">
                        
                        {/* NOMBRE */}
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <FaBuilding className="text-lg" />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{plantel.nombre}</div>
                                <div className="text-xs text-gray-400">ID: {plantel._id.slice(-6)}</div>
                            </div>
                        </div>
                        </td>

                        {/* DIRECCIÓN */}
                        <td className="px-6 py-4">
                            <div className="flex items-start max-w-xs">
                                <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600 truncate" title={plantel.direccion}>
                                    {plantel.direccion}
                                </span>
                            </div>
                        </td>

                        {/* IPs (Lista visual) */}
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                                {plantel.ipsPermitidas && plantel.ipsPermitidas.length > 0 ? (
                                    plantel.ipsPermitidas.map((ip, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {ip}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-red-500 italic">Sin IPs asignadas</span>
                                )}
                            </div>
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            plantel.activo
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                        >
                            {plantel.activo ? <FaCheckCircle className="mr-1"/> : <FaTimesCircle className="mr-1"/>}
                            {plantel.activo ? "Activo" : "Inactivo"}
                        </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                            onClick={() => handleEdit(plantel)}
                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                            title="Editar"
                        >
                            <FaEdit size={18} />
                        </button>
                        <button
                            onClick={() => handleDelete(plantel._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Eliminar"
                        >
                            <FaTrashAlt size={18} />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlantelesPage;