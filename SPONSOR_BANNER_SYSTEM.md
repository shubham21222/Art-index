# Sponsor Banner System

## Overview

The Sponsor Banner System allows you to display sponsored content banners across different sections of the Art Index platform. The system includes impression and click tracking, admin management, and automatic placement based on configuration.

## Features

### 🎯 **Banner Management**
- Create, edit, and delete sponsor banners
- Set placement locations (homepage, collect, museums, artists, galleries, price-index)
- Configure banner positions (top, middle, bottom)
- Set start and end dates for campaigns
- Toggle banner active/inactive status

### 📊 **Analytics & Tracking**
- Automatic impression tracking when banners are displayed
- Click tracking when users interact with banners
- Click-through rate (CTR) calculation
- Performance statistics in admin dashboard
- Real-time analytics by placement

### 🎨 **Visual Design**
- Responsive banner design with gradient overlays
- Sponsor branding and call-to-action buttons
- "Contact Us" section for potential advertisers
- Loading states and fallback content

### 🔧 **Admin Features**
- Complete CRUD operations for banner management
- Statistics dashboard with key metrics
- Bulk operations and status management
- Contact information management

## API Endpoints

### Public Endpoints (No Authentication Required)
```
GET /api/sponsor-banner/active/:placement?position=:position
POST /api/sponsor-banner/track/impression/:id
POST /api/sponsor-banner/track/click/:id
```

### Admin Endpoints (Authentication Required)
```
POST /api/sponsor-banner/create
GET /api/sponsor-banner/all
GET /api/sponsor-banner/stats
GET /api/sponsor-banner/:id
PUT /api/sponsor-banner/:id
DELETE /api/sponsor-banner/:id
PATCH /api/sponsor-banner/:id/toggle
```

## Database Schema

```javascript
{
  title: String,           // Banner title
  description: String,     // Banner description
  image: String,          // Banner image URL
  link: String,           // Click-through URL
  sponsorName: String,    // Sponsor company name
  sponsorWebsite: String, // Sponsor website
  placement: String,      // Placement location
  position: String,       // Position within placement
  isActive: Boolean,      // Active status
  startDate: Date,        // Campaign start date
  endDate: Date,          // Campaign end date
  impressions: Number,    // Impression count
  clicks: Number,         // Click count
  clickThroughRate: Number, // Calculated CTR
  contactEmail: String,   // Contact email
  contactPhone: String,   // Contact phone
  budget: Number,         // Campaign budget
  status: String,         // Campaign status
  createdBy: ObjectId     // Admin who created
}
```

## Usage

### 1. Adding Banners to Pages

Import and use the SponsorBanner component:

```jsx
import SponsorBanner from '@/components/SponsorBanner';

// In your page component
<SponsorBanner placement="homepage" position="middle" />
```

### 2. Available Placements

- `homepage` - Main homepage
- `collect` - Collect art page
- `museums` - Museums section
- `artists` - Artists section
- `galleries` - Galleries section
- `price-index` - Price index pages

### 3. Available Positions

- `top` - Top of the page
- `middle` - Middle of the page
- `bottom` - Bottom of the page

### 4. Admin Management

Access the admin panel at `/admin/sponsor-banners` to:
- View all banners and their performance
- Create new banner campaigns
- Edit existing banners
- Toggle banner status
- View analytics and statistics

## Implementation Details

### Frontend Components

1. **SponsorBanner.jsx** - Main banner component with tracking
2. **Admin Page** - Complete management interface
3. **API Routes** - Next.js API routes for backend communication

### Backend Implementation

1. **Model** - MongoDB schema with validation
2. **Controller** - Business logic and API handlers
3. **Routes** - Express.js route definitions
4. **Middleware** - Authentication and authorization

### Tracking System

- **Impressions**: Automatically tracked when banner loads
- **Clicks**: Tracked when user clicks the banner
- **CTR**: Calculated as (clicks / impressions) * 100
- **Real-time**: Updates happen immediately in the database

## Example Banner Configuration

```javascript
{
  title: "Discover Contemporary Art",
  description: "Explore the latest works from emerging artists",
  image: "https://example.com/banner-image.jpg",
  link: "https://nyelizabeth.com",
  sponsorName: "NY Elizabeth Gallery",
  sponsorWebsite: "https://nyelizabeth.com",
  placement: "homepage",
  position: "middle",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  contactEmail: "contact@nyelizabeth.com",
  contactPhone: "+1-555-0123",
  budget: 5000,
  status: "active"
}
```

## Security Features

- Admin-only access to management functions
- Input validation and sanitization
- Rate limiting on tracking endpoints
- Secure token-based authentication

## Performance Considerations

- Lazy loading of banner images
- Efficient database queries with indexing
- Minimal impact on page load times
- Responsive design for all devices

## Future Enhancements

- A/B testing capabilities
- Advanced targeting options
- Revenue tracking and reporting
- Banner rotation algorithms
- Integration with external analytics
- Email campaign integration 