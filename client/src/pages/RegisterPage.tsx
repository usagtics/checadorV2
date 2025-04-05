import {useForm} from 'react-hook-form'
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { Link } from "react-router-dom";



function RegisterPage() {

    const {register,
          handleSubmit, 
          formState:{errors}
        } = useForm();
    const { signup, user, isAuthenticated, errors: RegisterErrors } = useAuth(); 
    const navigate = useNavigate()

    useEffect(() => {
     if (isAuthenticated) navigate('/tasks')
    }, [isAuthenticated])

    console.log(user)
    
const onSubmit = handleSubmit(async (values) => {
    signup(values);
       
     } )


    return (
        <div className="bg-sky-200 max-w-md p-10 rounden-md">
     {
    RegisterErrors.map((error: string, i: number) => (
        <div key={i} className="bg-red-500 p-2 text-white">
            {error}
        </div>
    ))
}


         <form
          onSubmit={onSubmit}>
            <input type="text" {...register('username', {required: true})}
             className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
             placeholder="Username"
            />
            {
             errors.username &&
             <p className='text-red-500'>Username is required</p>
            }
            <input type="email" {...register('email', {required: true})}
            className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
            placeholder="Email"
           />
             {
             errors.email &&
             <p className='text-red-500'>Email is required</p>
            }
            <input type="password" {...register('password', {required: true})}
            className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md my-2"
            placeholder="Password"
            />
              {
             errors.password &&
             <p className='text-red-500'>password is required</p>
            }
            <button type="submit" className="w-full bg-sky-50 text-dark px-4 py-2 rounded-md">Register</button>
        </form>
        <p className="flex gap-x-2 justify-between">
                Dont have an account? <Link to="/login" 
                className="text-sky-500">Login</Link>
            </p>
        </div>
      
    );
}

export default RegisterPage