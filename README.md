# Art-index

A modern, full-stack platform for discovering, managing, and auctioning fine art. Art-index connects artists, galleries, museums, sponsors, and collectors through a robust marketplace and content platform.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Client](#client)
  - [Server](#server)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
Art-index is a comprehensive art platform that enables:
- Online art auctions and bidding
- Gallery and museum management
- Sponsor banner campaigns
- User roles (admin, sponsor, gallery, museum, user)
- Partnerships and collaborations
- Art news, articles, and artist discovery
- Secure authentication and admin dashboard

---

## Features

### Client
- **Next.js 15** frontend with modern UI/UX
- **Auctions**: Browse, search, and bid on live and upcoming auctions
- **Galleries & Museums**: Explore, manage, and showcase collections
- **Sponsor Banners**: Dynamic sponsor ad placements and analytics
- **User Roles**: Role-based dashboards for Admin, Gallery, Museum, Sponsor, and User
- **Admin Dashboard**: Comprehensive stats, user management, and content moderation
- **Partnerships**: Submit and manage partnership requests
- **Authentication**: Secure login, registration, and password management
- **Art News & Articles**: Latest news, stories, and artist features
- **Responsive Design**: Mobile-first, accessible, and fast

### Server
- **Node.js + Express** REST API
- **MongoDB** with Mongoose ODM
- **Auctions**: Create, update, and manage auctions and bids
- **Gallery & Museum Management**: CRUD for galleries, museums, and artworks
- **Sponsor Banner System**: Banner creation, analytics, and tracking
- **User Management**: Role-based access, admin controls, and user stats
- **Partnerships**: API for partnership requests and approvals
- **Authentication**: JWT-based auth, role middleware, and secure endpoints
- **Admin APIs**: User, auction, and content management endpoints
- **Email Notifications**: For registration, partnership, and auction events
- **File Uploads**: Artwork and banner image uploads (with multer)

---

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **State Management**: Redux Toolkit
- **Authentication**: JWT, role-based middleware
- **Other**: Lucide Icons, XLSX (for bulk uploads), Multer (file uploads)

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/art-index.git
cd art-index
```

### 2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure environment variables
- Copy `.env.example` to `.env` in both `client` and `server` directories and fill in the required values (MongoDB URI, JWT secret, etc).

### 4. Run the development servers
```bash
# Start the backend API
cd server
npm run dev

# Start the frontend
cd ../client
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/v1/api](http://localhost:5000/v1/api)

---

## Project Structure

```
Art-index/
├─ client/      # Next.js frontend
│  ├─ src/app/  # App directory (pages, components, features)
│  └─ ...
├─ server/      # Node.js/Express backend
│  ├─ src/v1/api/  # API, controllers, models, routes
│  └─ ...
└─ README.md
```

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

All contributions are welcome! Please open an issue for major changes or feature requests.

---

## License

This project is licensed under the MIT License.
