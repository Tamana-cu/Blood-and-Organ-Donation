# Blood & Organ Donation Portal - Complete Guide

A production-ready full-stack web application for connecting blood and organ donors with recipients.

## 🎯 Features

### 1. **Authentication System**
- User registration and login
- Role-based access (Donor, Recipient, Admin)
- JWT-based authentication
- Bcrypt password hashing for security

### 2. **Donor Section**
- Register as a donor with blood group and organs
- Update donation availability and preferences
- Track donation location and contact information
- View matching recipient requests

### 3. **Recipient Section**
- Create blood/organ requests with urgency levels
- Automatic matching with compatible donors
- View all matched donors with contact details
- Location-based matching

### 4. **Admin Panel**
- Approve/reject new user registrations
- Manage all donors and recipients
- Remove fake or fraudulent accounts
- View comprehensive statistics and analytics
- Monitor requests and matches
- Blood group distribution analysis

### 5. **Matching System**
- Automatic matching based on blood type/organ
- Location proximity consideration
- Urgency-based prioritization
- Real-time donor availability status

## 📋 Project Structure

```
├── client/                       # React Frontend
│   ├── pages/
│   │   ├── Index.tsx            # Landing page
│   │   ├── Login.tsx            # Login page
│   │   ├── Register.tsx         # Registration page
│   │   ├── DonorDashboard.tsx   # Donor dashboard
│   │   ├── RecipientDashboard.tsx # Recipient dashboard
│   │   └── AdminDashboard.tsx   # Admin panel
│   ├── components/              # Reusable UI components
│   ├── global.css               # Global styles & theme
│   └── App.tsx                  # Main app with routing
├── server/                       # Express Backend
│   ├── models/                  # MongoDB models
│   │   ├── User.ts
│   │   ├── Donor.ts
│   │   └── Request.ts
│   ├── routes/                  # API endpoints
│   │   ├── auth.ts
│   │   ├── donors.ts
│   │   ├── requests.ts
│   │   └── admin.ts
│   ├── config/                  # Configuration
│   │   └── database.ts
│   ├── utils/                   # Utility functions
│   │   └── auth.ts              # JWT & middleware
│   └── index.ts                 # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
└── package.json                 # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- **MongoDB**: Local MongoDB server or MongoDB Atlas connection string
- **Node.js**: v18+
- **npm/pnpm**: Package manager

### Installation & Setup

1. **Start MongoDB** (if running locally):
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or use MongoDB Atlas cloud database
   ```

2. **Configure Environment Variables**:
   Edit `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/donation-portal
   JWT_SECRET=your-secure-secret-key-here
   NODE_ENV=development
   ```

3. **Install Dependencies**:
   ```bash
   pnpm install
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:8080`

5. **Build for Production**:
   ```bash
   pnpm build
   ```

## 📱 User Roles & Access

### Donor
- **Access**: `/donor/dashboard`
- **Features**: 
  - Register blood group and organs for donation
  - Update availability status
  - View recipient requests
  - Manage donation preferences

### Recipient
- **Access**: `/recipient/dashboard`
- **Features**:
  - Create blood/organ requests
  - Set urgency levels (low, medium, high)
  - View matched donors
  - Contact donors directly

### Admin
- **Access**: `/admin/dashboard`
- **Features**:
  - Approve pending user registrations
  - View all system statistics
  - Manage users (approve/delete)
  - Monitor donations and requests
  - Remove fraudulent accounts

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Donors
- `GET /api/donors` - List all donors
- `GET /api/donors/:id` - Get donor profile
- `POST /api/donors/register` - Register as donor
- `PUT /api/donors/:id` - Update donor profile
- `GET /api/donors/profile/me` - Get own donor profile
- `GET /api/donors/blood-group/:bloodGroup` - Get donors by blood group
- `GET /api/donors/organ/:organType` - Get donors by organ

### Requests
- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create new request
- `GET /api/requests/user/my-requests` - Get own requests
- `GET /api/requests/:id/matches` - Get matched donors
- `PUT /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Cancel request

### Admin
- `GET /api/admin/dashboard/stats` - Get statistics
- `GET /api/admin/users/all` - List all users
- `GET /api/admin/users/pending/all` - List pending approvals
- `PUT /api/admin/users/:id/approve` - Approve user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/donors/all` - List all donors
- `GET /api/admin/requests/all` - List all requests

## 📊 Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'donor' | 'recipient' | 'admin'
  location: string
  phone: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Donor
```typescript
{
  userId: ObjectId (ref: User)
  bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'
  organs: string[] // kidney, liver, heart, lung, pancreas, cornea, bone_marrow
  location: string
  isAvailable: boolean
  lastDonationDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Request
```typescript
{
  userId: ObjectId (ref: User)
  type: 'blood' | 'organ'
  bloodGroup?: string
  organType?: string
  urgency: 'low' | 'medium' | 'high'
  location: string
  reason?: string
  status: 'pending' | 'matched' | 'completed' | 'cancelled'
  matchedDonors: ObjectId[] (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive**: Fully responsive on mobile, tablet, and desktop
- **Intuitive Navigation**: Easy-to-understand user flows
- **Real-time Feedback**: Toast notifications for all actions
- **Color-coded Status**: Visual indicators for urgency and status
- **Dark Mode Ready**: Built with dark mode support

## 🔍 Testing the App

### Test Accounts (Create during signup):

1. **Donor Account**:
   - Register with role: Donor
   - Add blood group and organs
   - Mark as available

2. **Recipient Account**:
   - Register with role: Recipient
   - Create a blood/organ request
   - View matched donors

3. **Admin Account**:
   - Register with role: Admin
   - Approve pending users
   - View statistics

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/donation-portal` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Server port | `8080` |
| `PING_MESSAGE` | Ping endpoint response | `pong` |

## 🚀 Deployment

### Netlify
```bash
# Connected via MCP integration
pnpm build
# Netlify auto-deploys from your repo
```

### Vercel
```bash
# Connected via MCP integration
pnpm build
# Vercel auto-deploys from your repo
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

## 📝 Features Checklist

- ✅ User authentication with JWT
- ✅ Role-based access control
- ✅ Donor registration and profile management
- ✅ Recipient request creation
- ✅ Automatic donor-recipient matching
- ✅ Admin user approval system
- ✅ Admin dashboard with statistics
- ✅ Responsive mobile-first design
- ✅ Modern UI with Tailwind CSS
- ✅ Real-time notifications
- ✅ Location-based matching
- ✅ Blood group compatibility

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- Role-based authorization middleware
- Input validation
- CORS protection
- Secure password storage

## 📞 Support & Contact

For issues or questions, refer to the inline code documentation or update the `/` page with your contact information.

## 📄 License

This project is built for healthcare and donation purposes. Please ensure compliance with local regulations for blood and organ donation systems.

---

**Built with**: React, Express.js, MongoDB, TypeScript, Tailwind CSS, and modern web technologies.
