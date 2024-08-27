import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
