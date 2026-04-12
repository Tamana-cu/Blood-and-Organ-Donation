import mongoose, { Document, Schema } from 'mongoose';
import type { BloodGroup, OrganType } from './Donor';

export type Urgency = 'low' | 'medium' | 'high';
export type RequestStatus = 'pending' | 'matched' | 'completed' | 'cancelled';
export type RequestType = 'blood' | 'organ';

export interface IRequest extends Document {
  userId: mongoose.Types.ObjectId;
  type: RequestType;
  bloodGroup?: BloodGroup;
  organType?: OrganType;
  urgency: Urgency;
  location: string;
  reason?: string;
  status: RequestStatus;
  matchedDonors: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: ['blood', 'organ'],
      required: [true, 'Request type is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    },
    organType: {
      type: String,
      enum: [
        'kidney',
        'liver',
        'heart',
        'lung',
        'pancreas',
        'cornea',
        'bone_marrow',
      ],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'matched', 'completed', 'cancelled'],
      default: 'pending',
    },
    matchedDonors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Request = mongoose.models.Request || mongoose.model<IRequest>('Request', requestSchema);
