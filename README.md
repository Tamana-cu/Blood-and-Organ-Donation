# LifeLink 🩸 | Blood & Organ Donation Portal

A high-performance, real-time donation matching platform designed to connect life-savers with those in need. Built with a premium, medical-grade UI and robust backend architecture.

## 🚀 Key Features

- **Advanced Matching System**: Matches donors and recipients based on blood group, organ type, and location.
- **Role-Based Dashboards**: Specialized interfaces for Donors, Recipients, and Administrators.
- **LifeLink Hero Recognition**: Achievement system with badges and downloadable certificates for donors.
- **Real-time Health Vitals**: Integrated health parameter screening for donation readiness.
- **Admin Command Center**: Complete oversight of users, requests, and system analytics.

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router 6, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Express.js, Node.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT Authentication, Bcrypt hashing.
- **Styling**: Modern dark/light mode with CSS variables.

## 📦 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- PNPM (recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tamana-cu/Blood-and-Organ-Donation.git
   cd Blood-and-Organ-Donation
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root based on `.env.example`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

## 📂 Project Structure

- `client/`: React frontend application.
- `server/`: Express backend API.
- `shared/`: Shared types and utilities.
- `public/`: Static assets.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**LifeLink** - *Giving Life a Second Chance.*
