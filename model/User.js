import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  date:{
    type:String,
    required:true,
  },
  time:{
    type:String,
    required:true,
  },
  resume: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
