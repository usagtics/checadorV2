import Directivo from '../models/Directivo.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const registerDirectivo = async (req, res) => {
    // 1. AGREGA 'role' AQUÍ (para que el código lea lo que mandas en Thunder Client)
    const { email, password, username, carrera, role } = req.body; 
    
    try {
        const userFound = await Directivo.findOne({ email });
        if (userFound) return res.status(400).json(["Este directivo ya está registrado"]);

        const passwordHash = await bcrypt.hash(password, 10);
        
        const newDirectivo = new Directivo({
            username,
            email,
            password: passwordHash,
            carrera,
            // 2. CAMBIA 'admin' POR role (así guardará lo que tú digas)
            role: role || 'admin'      
          });

        const userSaved = await newDirectivo.save();
        
        // ... (el resto del código del token se queda igual)
        const token = await createAccessToken({ 
            id: userSaved._id, 
            role: userSaved.role,
            carrera: userSaved.carrera 
        });

        res.cookie('token', token);
        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            carrera: userSaved.carrera,
            role: userSaved.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const loginDirectivo = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await Directivo.findOne({ email });
        if (!userFound) return res.status(400).json(["Directivo no encontrado"]);

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json(["Credenciales incorrectas"]);

        const token = await createAccessToken({ 
            id: userFound._id, 
            role: userFound.role, 
            carrera: userFound.carrera 
        });

        res.cookie('token', token);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            carrera: userFound.carrera,
            role: userFound.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getDirectivos = async (req, res) => {
  try {
    // Buscamos todos menos el password por seguridad
    const directivos = await Directivo.find().select("-password");
    res.json(directivos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteDirectivo = async (req, res) => {
  try {
    const deletedDirectivo = await Directivo.findByIdAndDelete(req.params.id);
    if (!deletedDirectivo) return res.status(404).json({ message: "No encontrado" });
    res.sendStatus(204); // Todo bien, pero no hay contenido que devolver
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Cambiar el rol (de admin a super-admin o viceversa)
export const updateDirectivoRole = async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await Directivo.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  
  if (!token) return res.status(401).json({ message: "No autorizado (Falta token)" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "No autorizado (Token inválido)" });

    const userFound = await Directivo.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "No autorizado (Usuario no existe)" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      carrera: userFound.carrera
    });
  });
};