// middlewares/validator.middleware.js
export const validateSchema = (schema) => async (req, res, next) => {
    try {
      await schema.parseAsync(req.body); 
      next(); 
    } catch (error) {
      return res.status(400).json({ message: error.errors[0].message }); 
    }
  };
  