# Inquiry User Creation Feature

## Overview
When someone fills out an "I'm interested" form for any artwork, the system now automatically:

1. **Checks if the user exists** - If the email already exists in the database, it creates a normal inquiry
2. **Creates a new user account** - If the email doesn't exist, it creates a new user account
3. **Sends welcome email** - Sends an email with verification and password creation links
4. **Links inquiry to user** - Associates the inquiry with the newly created user account

## How It Works

### Backend Changes

#### 1. Updated Inquiry Controller (`server/src/v1/api/controllers/InquiryController/inquiry.controller.js`)
- Added user existence check
- Automatic user creation for new emails
- Email sending with verification and password creation links
- Inquiry linking to user account

#### 2. Updated Inquiry Model (`server/src/v1/api/models/Inquiry/inquiry.model.js`)
- Added `userId` field to link inquiries to users
- Backward compatible (existing inquiries won't break)

#### 3. New Auth Routes (`server/src/v1/api/routes/Auth/Auth.routes.js`)
- `GET /api/v1/auth/verify-email/:token` - Email verification
- `POST /api/v1/auth/create-password/:token` - Password creation

#### 4. New Auth Controller Functions (`server/src/v1/api/controllers/AuthController/auth.controller.js`)
- `verifyEmail()` - Handles email verification
- `createPassword()` - Handles password creation for new users

### Frontend Changes

#### 1. Updated ContactModal (`client/src/app/components/ContactModal.js`)
- Enhanced success message handling
- Different messages for new vs existing users

#### 2. New Pages
- `client/src/app/verify-email/[token]/page.js` - Email verification page
- `client/src/app/create-password/[token]/page.js` - Password creation page

## Email Flow

### Welcome Email Content
The welcome email includes:
- Personalized greeting with user's name
- Artwork details (name and message)
- Two action buttons:
  - **Verify Your Email** - Links to email verification
  - **Create Your Password** - Links to password creation
- Information about account benefits
- 24-hour expiration notice

### Email Template Features
- Responsive design
- Professional styling with gradients
- Clear call-to-action buttons
- Artwork information display
- Security information

## User Experience

### For New Users
1. User fills out "I'm interested" form
2. System creates account and sends welcome email
3. User receives email with verification and password creation links
4. User can either:
   - Click "Verify Email" first, then "Create Password"
   - Click "Create Password" directly (both work)
5. User is automatically logged in after password creation
6. User is redirected to dashboard

### For Existing Users
1. User fills out "I'm interested" form
2. System creates normal inquiry (no email sent)
3. User receives standard success message

## Security Features

- **Token Expiration**: Both verification and password creation tokens expire in 24 hours
- **Secure Tokens**: Uses crypto.randomBytes(20) for token generation
- **Password Validation**: Minimum 6 characters, confirmation required
- **Token Cleanup**: Tokens are cleared after use

## API Endpoints

### New Endpoints
- `GET /api/v1/auth/verify-email/:token` - Verify email address
- `POST /api/v1/auth/create-password/:token` - Create password for new user

### Updated Endpoints
- `POST /api/v1/inquiry` - Now handles user creation and email sending

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:
```
CLIENT_EMAIL=your-email@gmail.com
CLIENT_EMAIL_PASSWORD=your-app-password
CLIENT_EMAIL_REPLY=reply-to-email@domain.com
```

## Testing

To test the functionality:

1. **New User Test**:
   - Fill out an "I'm interested" form with a new email
   - Check that welcome email is sent
   - Click verification link
   - Create password
   - Verify user is logged in

2. **Existing User Test**:
   - Fill out an "I'm interested" form with existing email
   - Verify no email is sent
   - Verify normal inquiry is created

## Error Handling

- Email sending failures don't prevent inquiry creation
- Invalid tokens show appropriate error messages
- Network errors are handled gracefully
- Form validation prevents invalid submissions

## Future Enhancements

Potential improvements:
- Add email verification status to user model
- Implement email resend functionality
- Add more detailed user onboarding flow
- Create user dashboard for managing inquiries
- Add email templates for different artwork types 