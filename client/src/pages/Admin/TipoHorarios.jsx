import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuAdmin from "../../menu/menuAdmin";

function TipoHorario() {
  const [nombre, setNombre] = useState("");
  const [tipoHorarios, setTipoHorarios] = useState([]);


  const fetchTipoHorarios = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/tipo-horario");
      setTipoHorarios(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de horario:", error);
    }
  };


  useEffect(() => {
    fetchTipoHorarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/tipo-horario", { nombre });
      setNombre(""); 
      alert("Tipo de horario registrado");
      fetchTipoHorarios(); 
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  return (
    <>
        <div className="flex">
        <MenuAdmin />
        <div className="p-6">

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-md max-w-md mx-auto"
        >
          <h2 className="text-lg font-semibold mb-4">Registrar Tipo de Horario</h2>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del horario"
            className="border p-2 w-full mb-4 rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Guardar
          </button>
        </form>


        <div className="mt-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Tipos de Horario</h3>
          <ul>
            {tipoHorarios.length > 0 ? (
              tipoHorarios.map((tipoHorario) => (
                <li key={tipoHorario._id} className="mb-2">
                  {tipoHorario.nombre}
                </li>
              ))
            ) : (
              <p>No hay tipos de horario disponibles.</p>
            )}
          </ul>
        </div>
      </div>
        </div>
   
 
    </>
  );
}

export default TipoHorario;
