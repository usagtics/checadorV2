import { z } from "zod";

export const registerSchema = z.object({
  username: z.string({
    required_error: 'Username is required',
  }),
  email: z.string({
    required_error: 'Email is required',
  }).email({
    message: 'Email is not valid',
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(6, {
    message: 'Password must be at least 6 characters',
  }),
  role: z.enum(['admin', 'employee', 'super-admin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be admin, employee, or super-admin',
  }), 
});

export const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
  }).email({
    message: 'Email is not valid',
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(6, {
    message: 'Password must be at least 6 characters',
  }),
});