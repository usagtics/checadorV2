import axios from "./axios"; 

export const getPlantelesRequest = async () => {
  try {
    const response = await axios.get('/planteles'); 
    console.log("Datos obtenidos de planteles:", response.data);  
    return response;
  } catch (error) {
    console.error('Error al obtener los planteles:', error);
    throw error; 
  }
};

export const getPlantelRequest = (id) => {
  return axios.get(`/planteles/${id}`).then(response => {
    console.log("Datos del plantel:", response.data); 
    return response;
  }).catch(error => {
    console.error('Error al obtener el plantel:', error);
    throw error;
  });
};

export const createPlantelRequest = (plantel) => {
  return axios.post("/planteles", plantel).then(response => {
    console.log("Plantel creado:", response.data);  
    return response;
  }).catch(error => {
    console.error("Error al crear el plantel:", error.response ? error.response.data : error.message);
    throw error;
  });
};

export const updatePlantelRequest = (id, plantel) => {
  return axios.put(`/planteles/${id}`, plantel).then(response => {
    console.log("Plantel actualizado:", response.data);  
    return response;
  }).catch(error => {
    console.error("Error al actualizar el plantel:", error.response ? error.response.data : error.message);
    throw error;
  });
};

export const deletePlantelRequest = (id) => {
  return axios.delete(`/planteles/${id}`).then(response => {
    console.log("Plantel eliminado:", response.data);  
    return response;
  }).catch(error => {
    console.error("Error al eliminar el plantel:", error.response ? error.response.data : error.message);
    throw error;
  });
};
