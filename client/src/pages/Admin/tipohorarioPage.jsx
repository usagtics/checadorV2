import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTipoHorario } from "../../context/tipohorarioContext"; 
import MenuAdmin from "../../menu/menuAdmin"; 
import Swal from "sweetalert2";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaBuilding, 
  FaClock,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const DepartamentosPage = () => {
  const navigate = useNavigate();

  const {
    tipoHorarios: departamentos,
    getTipoHorarios,
    createTipoHorario,
    updateTipoHorario, 
    deleteTipoHorario,
  } = useTipoHorario();

  const [formData, setFormData] = useState({
    nombre: "",
    hora_entrada: "09:00",
    hora_salida: "18:00",
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    getTipoHorarios();  
  }, [getTipoHorarios]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      return Swal.fire("Error", "El nombre del departamento es obligatorio", "error");
    }

    try {
        if (editMode) {
            await updateTipoHorario(editingId, formData);
            Swal.fire("Actualizado", "Departamento actualizado", "success");
        } else {
            const datosNuevo = {
                ...formData,
                fechaCreacion: new Date().toISOString()
            };
            await createTipoHorario(datosNuevo);
            Swal.fire("Creado", "Departamento creado", "success");
        }

        setFormData({ nombre: "", hora_entrada: "09:00", hora_salida: "18:00" });
        setEditMode(false);
        setEditingId(null);
        setShowForm(false);
        await getTipoHorarios();

    } catch (error) {
        console.error("Error al guardar:", error);
        Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Se eliminará este departamento permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar"
    });

    if (confirm.isConfirmed) {
        await deleteTipoHorario(id);
        await getTipoHorarios();
        Swal.fire("Eliminado", "Departamento eliminado", "success");
    }
  };

  const handleEdit = (depto) => {
    setFormData({
      nombre: depto.nombre || "",
      hora_entrada: depto.hora_entrada || "09:00",
      hora_salida: depto.hora_salida || "18:00",
    });
    setEditMode(true);
    setEditingId(depto._id);
    setShowForm(true); 
  };

  const handleRegisterNew = () => {
    setFormData({ nombre: "", hora_entrada: "09:00", hora_salida: "18:00" });
    setEditMode(false);
    setEditingId(null);
    setShowForm(!showForm); 
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartamentos = departamentos ? departamentos.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = departamentos ? Math.ceil(departamentos.length / itemsPerPage) : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden"> 
      
      <div className="hidden md:block">
          <MenuAdmin />
      </div>
      
      <div className="flex-1 p-4 md:p-8 pt-20 md:ml-64 overflow-y-auto h-screen w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                    <FaBuilding className="text-blue-600" />
                    Departamentos
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Gestiona las áreas y horarios de trabajo.</p>
            </div>
            
            <button 
                onClick={handleRegisterNew}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 text-white rounded-lg shadow-md transition-all transform hover:scale-105 text-sm md:text-base ${
                    showForm ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {showForm ? "Cerrar" : <><FaPlus /> Nuevo Departamento</>}
            </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-lg border-l-4 border-blue-500 animate-fade-in-down transition-all duration-300">
             <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {editMode ? "Editar Departamento" : "Registrar Nuevo Departamento"}
             </h3>
             
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                
                {/* Nombre */}
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Área / Departamento</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <FaBuilding />
                        </span>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ej. Recursos Humanos"
                            className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Hora Entrada */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Entrada</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <FaClock />
                        </span>
                        <input
                            type="time"
                            name="hora_entrada"
                            value={formData.hora_entrada}
                            onChange={handleChange}
                            className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Hora Salida */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <FaClock />
                        </span>
                        <input
                            type="time"
                            name="hora_salida"
                            value={formData.hora_salida}
                            onChange={handleChange}
                            className="w-full pl-10 p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setEditMode(false);
                            setFormData({ nombre: "", hora_entrada: "09:00", hora_salida: "18:00" });
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm md:text-base"
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition text-sm md:text-base">
                        {editMode ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>

             </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horario</th>
                            <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentDepartamentos && currentDepartamentos.length > 0 ? (
                            currentDepartamentos.map((depto) => (
                                <tr key={depto._id} className="hover:bg-blue-50 transition-colors duration-150">
                                    
                                    {/* Nombre */}
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                <FaBuilding className="text-sm md:text-lg" />
                                            </div>
                                            <div className="ml-3 md:ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{depto.nombre}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Horario */}
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaClock className="mr-2 text-gray-400" />
                                            {depto.hora_entrada} - {depto.hora_salida}
                                        </div>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleEdit(depto)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3 md:mr-4 transition-colors p-1" 
                                            title="Editar"
                                        >
                                            <FaEdit size={16} className="md:w-5 md:h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(depto._id)} 
                                            className="text-red-500 hover:text-red-700 transition-colors p-1" 
                                            title="Eliminar"
                                        >
                                            <FaTrashAlt size={16} className="md:w-5 md:h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                                    No hay departamentos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls Estilo Corporativo */}
            {departamentos && departamentos.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  
                  {/* Vista Mobile (Simple) */}
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>

                  {/* Vista Desktop (Completa) */}
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, departamentos.length)}</span> de <span className="font-medium">{departamentos.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Anterior</span>
                          <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Botones de números de página (Opcional, aquí muestro solo Prev/Next con estilo unido) */}
                        <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            Página {currentPage} de {totalPages}
                        </div>

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Siguiente</span>
                          <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
              </div>
            )}
        </div>
       
      </div>
    </div>
  );
};

export default DepartamentosPage;