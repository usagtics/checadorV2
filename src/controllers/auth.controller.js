import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import Employee from '../models/empleados.model.js';

export const register = async (req, res) => {
  const { email, password, username, role } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(["El correo ya está registrado como usuario."]);

    let empleado = await Employee.findOne({ email });

    if (!empleado && role === "client") {
        empleado = await Employee.create({
            name: username,
            email,
            role: "client"
        });
    }

    if (!empleado && role !== "client") {
        return res.status(404).json({ message: "No existe un empleado registrado con este correo. Contacta a RH." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: passwordHash,
      role: empleado.role,
      empleadoId: empleado._id,
    });

    const userSaved = await newUser.save();

    const token = await createAccessToken({ 
        id: userSaved._id, 
        role: userSaved.role,
        empleadoId: empleado._id 
    });

    res.cookie("token", token);
    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      role: userSaved.role,
      empleadoId: userSaved.empleadoId,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("\n=== INTENTO DE LOGIN COLABORADOR ===");
  console.log(`Email recibido desde React: "${email}"`);

  try {
    const userFound = await User.findOne({ email });
    
    // 👇 VER QUÉ ENCONTRÓ MONGO 👇
    console.log("Resultado de MongoDB:", userFound ? "Usuario Encontrado" : "NULL (No lo encontró)");

    if (!userFound) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    let empleado = null;
    if (userFound.empleadoId) {
      empleado = await Employee.findById(userFound.empleadoId).populate({
        path: 'tipoHorario',
        select: 'nombre hora_entrada hora_salida tolerancia_min',
        strictPopulate: false 
      });
    }

    const token = await createAccessToken({
      id: userFound._id,
      role: empleado ? empleado.role : userFound.role,
      empleadoId: empleado ? empleado._id : null,
    });

    res.cookie("token", token);
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: empleado ? empleado.role : userFound.role,
      empleadoId: empleado ? empleado._id : null,
      tipoHorario: empleado ? empleado.tipoHorario : null,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0)
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  try {
    // ✅ AQUÍ ESTÁ LA MAGIA: strictPopulate: false evita que se caiga el servidor
    const userFound = await User.findById(req.user.id).populate({
      path: 'empleadoId',
      strictPopulate: false, 
      populate: {
        path: 'tipoHorario',
        select: 'nombre hora_entrada hora_salida tolerancia_min',
        strictPopulate: false
      },
    });

    if (!userFound) return res.status(400).json({ message: "User not found" });

    const empleado = userFound.empleadoId;
    
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: empleado ? empleado.role : userFound.role,
      empleadoId: empleado ? empleado._id : null,
      tipoHorario: empleado ? empleado.tipoHorario : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    const userFound = await User.findById(user.id).populate({
      path: 'empleadoId',
      strictPopulate: false,
      populate: {
        path: 'tipoHorario',
        select: 'nombre hora_entrada hora_salida tolerancia_min',
        strictPopulate: false
      },
    });

    if (!userFound) return res.status(401).json({ message: "Unauthorized" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      empleadoId: userFound.empleadoId,
      tipoHorario: userFound.empleadoId?.tipoHorario || null,
    });
  });
};

export const assignUserToEmployee = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Este usuario ya tiene cuenta de acceso." });

    const empleado = await Employee.findOne({ email }).populate({
        path: 'tipoHorario', 
        strictPopulate: false
    });
    
    if (!empleado) {
        return res.status(404).json({ message: "No se encontró ningún empleado con el correo: " + email });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username: username || empleado.name, 
      password: passwordHash,
      role: empleado.role, 
      empleadoId: empleado._id, 
    });

    const savedUser = await newUser.save();

    const token = await createAccessToken({
      id: savedUser._id,
      role: savedUser.role,
      empleadoId: empleado._id,
    });

    res.cookie("token", token);
    res.json({
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      empleadoId: empleado._id,
      tipoHorario: empleado.tipoHorario || null,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};