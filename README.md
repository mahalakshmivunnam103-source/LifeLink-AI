# LifeLink AI — Smart Blood Donor & Blood Bank Network

> **A secure, medically validated full-stack platform connecting accredited hospitals with potentially eligible blood donors and registered blood bank reserves.**

---

## 📌 Project Overview

**LifeLink AI** is engineered to address emergency blood shortages by intelligently matching hospital blood requests with nearby, compatible voluntary blood donors. When suitable individual donors are unavailable or paused, the platform automatically activates an emergency **Blood Bank Fallback**, displaying nearby accredited blood centers with verified unit counts and reservation channels.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons
- **Interactive Mapping**: Leaflet & OpenStreetMap (No proprietary API keys required)
- **Backend API**: Node.js, Express.js (RESTful modular architecture)
- **Database**: MongoDB with Mongoose (plus a built-in zero-config Smart In-Memory Data Store with pre-seeded demo records for all 4 roles)
- **Authentication & Security**: JSON Web Tokens (JWT), Bcrypt password hashing, Role-Based Access Control (RBAC), and donor contact masking
- **Styling**: Vanilla CSS Medical Dashboard Design System (Crimson Red `#DC2626`, Deep Navy `#0F1E36`, and Clinical White `#FFFFFF`)
- **AI Module**: Clinical Urgency Triage & Outreach Advisor (Calculates blood group scarcity, patient urgency scores, and recommended donor batch sizes)

---

## 📂 Project Structure

```
LifeLink-AI/
├── backend/
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Safe template with placeholders
│   ├── package.json
│   ├── server.js                     # Express app entry point & route registration
│   ├── config/
│   │   ├── constants.js              # RBC compatibility matrix, screening intervals, roles
│   │   └── db.js                     # MongoDB connection with smart memory fallback
│   ├── models/
│   │   ├── User.js                   # Authentication & user roles
│   │   ├── DonorProfile.js           # Coordinates, blood group, last donation, privacy flags
│   │   ├── HospitalProfile.js        # License, hospital location, trauma desk contact
│   │   ├── BloodBankProfile.js       # Blood bank license, unit inventory, operating hours
│   │   ├── BloodRequest.js           # Blood group, units, urgency, notified donors
│   │   └── Notification.js           # Real-time alert dispatch & response tracking
│   ├── services/
│   │   ├── dataStore.js              # Unified data access layer (dual Mongoose & memory)
│   │   ├── donorMatchingService.js   # Haversine distance, compatibility & 90/120d screening
│   │   ├── notificationService.js    # In-app alert dispatcher & audit logger
│   │   └── aiTriageService.js        # Urgency scoring & donor call script generator
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   └── roleCheck.js              # RBAC & hospital/blood bank license verification checks
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth (register, login, me)
│   │   ├── hospitalRoutes.js         # /api/hospital (matching donors, requests, fallback)
│   │   ├── donorRoutes.js            # /api/donor (profile, eligibility date, accept/decline)
│   │   ├── bloodBankRoutes.js        # /api/bloodbank (inventory CRUD, inquiry confirmations)
│   │   ├── adminRoutes.js            # /api/admin (license review, suspicious requests, audit)
│   │   └── aiRoutes.js               # /api/ai (modular triage advisor & matrix guide)
│   └── seed/
│       └── seedData.js               # Standalone database seed script
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                   # Role routing & alert layout
│       ├── index.css                 # Medical design tokens, cards, badges, and layout
│       ├── api/
│       │   └── axiosClient.js        # Centralized HTTP client with JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx       # State management for user session & active role
│       ├── utils/
│       │   ├── compatibility.js      # Medical RBC compatibility rules
│       │   └── formatters.js         # Distance, date formatting, and privacy masking
│       ├── components/
│       │   ├── common/               # Navbar, Footer, StatusBadge, Modal
│       │   ├── maps/
│       │   │   └── NetworkMap.jsx    # Leaflet OpenStreetMap with custom markers
│       │   ├── ai/
│       │   │   └── AiTriageAdvisor.jsx # AI-powered triage & smart urgency analyzer
│       │   └── tables/
│       │       ├── DonorMatchTable.jsx # Match list with distance & screening indicators
│       │       └── InventoryGrid.jsx   # Blood bank inventory manager
│       └── pages/
│           ├── Home.jsx              # Landing page, compatibility guide & portal links
│           ├── Login.jsx             # Role-tabbed login with 1-click Quick Demo Fill
│           ├── Register.jsx          # Role-specific registration
│           ├── hospital/
│           │   ├── HospitalDashboard.jsx
│           │   └── CreateRequestModal.jsx
│           ├── donor/
│           │   └── DonorDashboard.jsx
│           ├── bloodbank/
│           │   └── BloodBankDashboard.jsx
│           └── admin/
│               └── AdminDashboard.jsx
└── README.md
```

---

## 🔑 Pre-Configured Demo Accounts

The system comes pre-seeded with realistic healthcare profiles for each role. You can log in using these credentials or click the **Pre-filled Demo Profile** button on the Login page:

| Role | Email | Password | Facility / Name | Notes |
|---|---|---|---|---|
| **Hospital Staff** | `hospital@citymed.org` | `Hospital123!` | City General Hospital & Trauma Centre | Verified trauma center with active requests |
| **Blood Donor** | `donor.rahul@gmail.com` | `Donor123!` | Rahul Sharma (O- Universal Donor) | Passed 90-day screening filter (~1.9 km) |
| **Blood Bank** | `staff@redcross-central.org` | `Bank123!` | Red Cross Regional Blood Center | Verified inventory with 5 units of O- |
| **Admin** | `admin@lifelink.org` | `Admin123!` | Dr. Vikram Malhotra | Verification queue & suspicious requests |
| **Pending Hospital** | `pending.hospital@apexcare.org` | `Hospital123!` | Apex Multispeciality Hospital | Demonstrates admin verification workflow |

---

## 🚀 Installation & Run Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Optional: Local MongoDB or MongoDB Atlas URI (The application automatically runs in Smart In-Memory mode if MongoDB is not present).

### Step 1: Start the Backend Server

Open a terminal window and run:

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (already completed)
npm install

# Start the server (runs on http://localhost:5000)
node server.js
```

> **Note**: To seed a fresh external MongoDB instance, set `MONGODB_URI` in `backend/.env` and run `npm run seed`.

### Step 2: Start the Frontend Application

Open a second terminal window and run:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (already completed)
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## ☁️ Deploying to Vercel (Multi-Service)

LifeLink AI is configured with Vercel Services via [`vercel.json`](file:///c:/Users/asus/OneDrive/Desktop/LifeLink-AI/vercel.json) to deploy both the Express API and Vite React frontend under a single project and domain:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "framework": "express"
    },
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "service": "frontend"
      }
    }
  ]
}
```

### Local Testing with Vercel CLI
To test both services running together with Vercel's multi-service routing:
```bash
vercel dev
```

---

## 🩺 Medical Compatibility & Screening Rules

### 1. RBC Compatibility Matrix
LifeLink AI screens potential donors strictly by Red Blood Cell compatibility:
- **O-**: Universal RBC donor (Can donate to all recipient blood groups).
- **O+**: Can donate to O+, A+, B+, AB+.
- **A-**: Can donate to A-, A+, AB-, AB+.
- **A+**: Can donate to A+, AB+.
- **B-**: Can donate to B-, B+, AB-, AB+.
- **B+**: Can donate to B+, AB+.
- **AB-**: Can donate to AB-, AB+.
- **AB+**: Can donate to AB+ only (Universal RBC recipient).

### 2. Configurable Screening Reference Intervals
- **Male whole-blood donors**: Reference interval of **90 days** since last donation.
- **Female whole-blood donors**: Reference interval of **120 days** since last donation.
- **First-time donors**: No prior donation date needed; automatically flagged as screen eligible.
- **Prominent Medical Notice**:
  > *"Notice: Donation interval is an initial screening filter only, not a guarantee of medical eligibility. Final donor eligibility and blood compatibility must be confirmed by qualified blood bank staff."*
  *(The system strictly avoids guessing eligibility based on strength or weight alone).*

### 3. Automatic Blood Bank Fallback
When a hospital's search yields zero available compatible donors within the configured radius (or upon explicit hospital request), the interface activates the **Blood Bank Fallback** panel. This lists nearby verified blood banks with exact unit counts and verified timestamps, allowing hospital staff to submit priority reservation inquiries.

---

## 🔒 Security & Privacy Protections

1. **Donor Contact Privacy**:
   - Phone numbers and exact coordinates are **masked** (`+91 98*****10`) by default.
   - Donors control a direct consent toggle (`consentShareContact`). If disabled, hospital staff can only view contact details after the donor explicitly accepts a donation alert.
2. **Role-Based Access Control (RBAC)**:
   - Each route is guarded by JWT middleware and role checks (`auth.js` and `roleCheck.js`).
   - Hospitals and blood banks must be verified by an administrator before emergency broadcasting features are activated.
3. **Suspicious Request Detection**:
   - Blood requests exceeding clinical thresholds (e.g., >30 units in a single broadcast) are automatically flagged for administrative investigation.
4. **Environment Variables**:
   - Database credentials and secrets are kept in `backend/.env`. A safe `backend/.env.example` is committed for reference.

---

## 🧪 Testing the Main Workflows

1. **Hospital Workflow**:
   - Log in as `hospital@citymed.org` (`Hospital123!`).
   - Click **New Blood Request** or adjust the search radius to 25 km for blood group `O-`.
   - Observe the interactive Leaflet map displaying the hospital pin, donor radius, and blood bank marker.
   - Click **Notify Donor** next to Rahul Sharma to dispatch an in-app emergency alert.
2. **Donor Workflow**:
   - In another browser tab/incognito window, log in as `donor.rahul@gmail.com` (`Donor123!`).
   - View the incoming request in the inbox with clinical urgency details.
   - Click **Accept to Donate**.
3. **Blood Bank Fallback Workflow**:
   - On the hospital console, search for a rare blood group with zero active donors (e.g. `AB-` with radius 10 km).
   - Observe the automatic activation of the **Nearby Registered Blood Banks Fallback** banner.
   - Click **Send Priority Reservation Inquiry** to reserve units from Red Cross Regional Blood Center.
   - Log in as `staff@redcross-central.org` (`Bank123!`) to inspect the reservation and confirm availability.
4. **Admin Workflow**:
   - Log in as `admin@lifelink.org` (`Admin123!`).
   - View the pending verifications queue (e.g. Apex Multispeciality Hospital).
   - Click **Verify & Approve License**.
   - Review the suspicious requests queue (e.g., Request #654...0002 flagged for 45 units) and resolve the flag.
