import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Varshini M.'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    preferences: {
      theme: { type: String, default: 'Light' },
      swatchId: { type: String, default: 'ocean' },
      font: { type: String, default: 'Inter' },
      density: { type: Number, default: 50 },
      cornerRadius: { type: Number, default: 16 },
      highContrastOutlines: { type: Boolean, default: true },
      useLargeSidebarIcons: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
