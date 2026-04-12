import mongoose, { Document, Schema } from 'mongoose';

export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type OrganType =
  | 'kidney'
  | 'liver'
  | 'heart'
  | 'lung'
  | 'pancreas'
  | 'cornea'
  | 'bone_marrow';

export interface IDonor extends Document {
  userId: mongoose.Types.ObjectId;
  bloodGroup: BloodGroup;
  organs: OrganType[];
  location: string;
  isAvailable: boolean;
  lastDonationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donorSchema = new Schema<IDonor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      required: [true, 'Blood group is required'],
    },
    organs: {
      type: [String],
      enum: [
        'kidney',
        'liver',
        'heart',
        'lung',
        'pancreas',
        'cornea',
        'bone_marrow',
      ],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastDonationDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Donor = mongoose.models.Donor || mongoose.model<IDonor>('Donor', donorSchema);
