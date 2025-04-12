import express from "express";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
import authRoutes from "./routes/auth.routes.js"
import taskRoutes from './routes/tasks.routes.js'
import employeesRoutes from './routes/empleados.routes.js'
import cors from "cors";
import tipoHorarioRoutes from './routes/tipoHorario.routes.js'; 



const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", employeesRoutes);
app.use("/api", tipoHorarioRoutes); 



export default app;