import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25
    },
    mode: {
      type: String,
      enum: ['focus', 'short', 'long'],
      default: 'focus'
    },
    completed: {
      type: Boolean,
      default: true
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('FocusSession', focusSessionSchema);
