export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'recipient' | 'admin';
  location: string;
  phone: string;
  isApproved: boolean;
  createdAt: string;
}

export interface DonorProfile {
  _id: string;
  userId: string | User;
  bloodGroup: string;
  organs: string[];
  location: string;
  isAvailable: boolean;
  notes?: string;
}

export interface DonationRequest {
  _id: string;
  userId: string | User;
  type: 'blood' | 'organ';
  bloodGroup?: string;
  organType?: string;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  reason?: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  matchedDonors: (string | User)[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
