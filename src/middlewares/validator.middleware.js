// middlewares/validator.middleware.js
export const validateSchema = (schema) => async (req, res, next) => {
    try {
      await schema.parseAsync(req.body); // Utiliza zod para validar el cuerpo de la solicitud
      next(); // Si la validación es exitosa, pasa al siguiente middleware
    } catch (error) {
      return res.status(400).json({ message: error.errors[0].message }); // En caso de error, retorna una respuesta con el error
    }
  };
  