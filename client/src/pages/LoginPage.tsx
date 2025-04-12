import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, InputAdornment } from "@mui/material";
import "../styles.css";
import usagImage from "../assets/usag.png";
import { useEffect } from "react";

type FormData = {
  email: string;
  password: string;
};

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { signin, errors: signinErrors, isAuthenticated, user } = useAuth();  // Desestructuración aquí
  const navigate = useNavigate();
  
  const onSubmit = async (data: FormData) => {
    await signin(data);  
  };
  
  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);  
    console.log("user:", user);  
  
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        console.log("Redirigiendo a /employees");
        navigate("/employees");
      } else {
        console.log("Redirigiendo a /tasks");
        navigate("/tasks");
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  
  

  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 overflow-hidden">

      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="floating-shape"
          style={{
            width: `${Math.floor(Math.random() * 170) + 60}px`,
            height: `${Math.floor(Math.random() * 120) + 60}px`,
            top: `${[10, 30, 60, 85][i]}%`,
            left: `${[15, 75, 25, 80][i]}%`,
            transform: `rotate(${Math.random() * 45}deg)`,
            animationDuration: `${Math.random() * 6 + 4}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <img
        src={usagImage}
        alt="USAG"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-30 h-auto"
      />

      <div className="relative  from-blue-300 via-blue-500 to-blue-700 overflow-hidden bg-opacity-30 backdrop-blur-lg shadow-2xl rounded-3xl p-20 w-full max-w-md transform hover:scale-105 transition-all duration-300">
        {signinErrors.map((error: string, i: number) => (
          <div key={i} className="bg-red-500 p-2 text-white my-2 rounded-md">
            {error}
          </div>
        ))}

        <div className="w-max">
          <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 px-4 py-3 border-r-white pr-5 text-5xl text-white font-bold">
            USAG
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {" "}
          {/* Mayor espaciado entre los campos */}
          <div className="relative">
            <TextField
              type="email"
              {...register("email", { required: "Email is required" })}
              fullWidth
              label="Email"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-envelope text-blue-500" />
                  </InputAdornment>
                ),
              }}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputLabelProps={{
                style: {
                  color: "#FFFFFF", 
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", 
                  },
                  "&:hover fieldset": {
                    borderColor: "white", 
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "blue", 
                  },
                  "& input": {
                    color: "white", 
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "blue", 
                },
                "& .MuiInputLabel-root.MuiFormLabel-filled": {
                  color: "blue",
                },
              }}
            />
          </div>
          <div className="relative">
            <TextField
              type="password"
              {...register("password", { required: "Password is required" })}
              fullWidth
              label="Password"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="fas fa-lock text-blue-500" />
                  </InputAdornment>
                ),
              }}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputLabelProps={{
                style: {
                  color: "#FFFFFF", 
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white", 
                  },
                  "&:hover fieldset": {
                    borderColor: "white", 
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "blue",
                  },
                  "& input": {
                    color: "white", 
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "blue", 
                },
                "& .MuiInputLabel-root.MuiFormLabel-filled": {
                  color: "blue", 
                },
              }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#2563eb",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
              },
              "& i": {
                marginLeft: "8px",
              },
            }}
          >
            Login <i className="fas fa-sign-in-alt" />
          </Button>
        </form>

        <p className="text-white text-center mt-6">
          Don't have an account?
          <Link
            to="/register"
            className="font-bold hover:underline text-blue-300"
          >
            {" "}
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
