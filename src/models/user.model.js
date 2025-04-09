import mongoose from "mongoose"

'fazt@gmail.com'

const userSchema = new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "client"],
        default: "client",
      },
    },
    {
      timestamps: true,
    }
  );
  
  export default mongoose.model('User', userSchema);

