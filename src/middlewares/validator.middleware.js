export const validateSchema = (schema) => (req, res, next) => {
   try {
       schema.parse(req.body); // Valida el cuerpo del request
       next(); // Si es válido, pasa al siguiente middleware/controlador
   } catch (error) {
       return res.status(400).json( error.errors.map(error => error.message)  );
   }
};
