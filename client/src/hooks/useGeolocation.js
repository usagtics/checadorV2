import { useState, useEffect, useCallback } from "react";

export const useGeolocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null); // Nuevo: Para ver el margen de error
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada en este navegador");
      return;
    }

    // ESTAS SON LAS OPCIONES MÁGICAS QUE TE FALTABAN
    const options = {
      enableHighAccuracy: true, // Fuerza a usar el GPS real / Wi-Fi preciso
      timeout: 10000,           // Espera hasta 10 segundos para tener buena señal
      maximumAge: 0             // No uses una ubicación vieja guardada en caché
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy); // Guardamos qué tan precisa fue la lectura
        
        // Debug para ti: Ver en consola cuánto error tiene
        console.log(`Ubicación obtenida. Precisión: +/- ${position.coords.accuracy} metros.`);
      },
      (err) => {
        console.error("Error de geolocalización:", err);
        setError("Error al obtener la ubicación. Asegúrate de tener el GPS activado.");
      },
      options // <--- Aquí pasamos las opciones
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Retornamos también la función 'getLocation' por si quieres poner un botón de "Actualizar Ubicación"
  return { latitude, longitude, accuracy, error, getLocation };
};