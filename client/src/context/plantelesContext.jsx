import React, { createContext, useContext, useState, useCallback } from "react";
import { 
  createPlantelRequest, 
  getPlantelesRequest, 
  deletePlantelRequest, 
  updatePlantelRequest 
} from "../api/planteles"; 
import Swal from "sweetalert2";

const PlantelesContext = createContext();

export const usePlanteles = () => {
  const context = useContext(PlantelesContext);
  if (!context) {
    throw new Error("usePlanteles must be used within a PlantelesProvider");
  }
  return context;
};

export const PlantelesProvider = ({ children }) => {
  const [planteles, setPlanteles] = useState([]);

  const getPlanteles = useCallback(async () => {
    try {
      const res = await getPlantelesRequest();
      const plantelesData = Array.isArray(res.data) ? res.data : []; 
      setPlanteles(plantelesData);
    } catch (error) {
      console.error("Error al obtener planteles:", error);
      setPlanteles([]); 
    }
  }, []);

  const createPlantel = async (plantel) => {
    try {
      const res = await createPlantelRequest(plantel);
      if (res.data && res.data._id) {
        Swal.fire("¡Éxito!", "Plantel creado correctamente.", "success");
        setPlanteles(prevPlanteles => [...prevPlanteles, res.data]); // Agregar el plantel creado a la lista
      } else {
        throw new Error("El plantel no fue creado correctamente.");
      }
    } catch (error) {
      console.error("Error al crear el plantel:", error);
      Swal.fire("Error", "Hubo un problema al crear el plantel.", "error");
    }
  };

  const deletePlantel = async (id) => {
    try {
      const res = await deletePlantelRequest(id);
      if (res.status === 204) {
        setPlanteles(prevPlanteles => prevPlanteles.filter((item) => item._id !== id)); // Eliminar el plantel de la lista
        Swal.fire("Eliminado", "Plantel eliminado correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al eliminar el plantel:", error);
      Swal.fire("Error", "No se pudo eliminar el plantel.", "error");
    }
  };

  const updatePlantel = async (id, plantel) => {
    try {
      const res = await updatePlantelRequest(id, plantel);
      if (res.data && res.data._id) {
        Swal.fire("¡Actualizado!", "El plantel fue actualizado correctamente.", "success");
        setPlanteles(prevPlanteles => prevPlanteles.map((p) => (p._id === id ? res.data : p))); // Actualizar el plantel en la lista
      } else {
        throw new Error("El plantel no fue actualizado correctamente.");
      }
    } catch (error) {
      console.error("Error al actualizar el plantel:", error);
      Swal.fire("Error", "Hubo un problema al actualizar el plantel.", "error");
    }
  };

  return (
    <PlantelesContext.Provider value={{ planteles, createPlantel, getPlanteles, deletePlantel, updatePlantel }}>
      {children}
    </PlantelesContext.Provider>
  );
};
