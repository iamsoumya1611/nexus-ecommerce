# Nexus E-commerce Server

A production-ready e-commerce backend built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure registration, login, and JWT-based authentication
- **Product Management**: Full CRUD operations for products with image upload
- **Order Processing**: Complete order workflow with stock management
- **Payment Integration**: Razorpay payment processing
- **Image Management**: Cloudinary integration for image hosting
- **Admin Panel**: Dedicated admin routes for user and product management
- **Security**: Comprehensive security measures including CORS, rate limiting, and input sanitization

## Prerequisites

- Node.js >= 14.x
- MongoDB Atlas account
- Cloudinary account
- Razorpay account (for payment processing)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the server directory:
```bash
cd server
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the server root with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `GET /api/products/top` - Get top rated products

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders` - Get all orders (admin only)

### Payments
- `POST /api/payment/order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/:paymentId` - Get payment details

### Uploads
- `POST /api/upload` - Upload image (admin only)
- `DELETE /api/upload/:id` - Delete image (admin only)

### Reviews
- `POST /api/products/:id/reviews` - Create product review

## Security Features

- JWT-based authentication
- Password encryption with bcrypt
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input sanitization (NoSQL injection prevention)
- XSS protection
- HTTP headers security with Helmet.js
- Parameter pollution prevention
- Secure cookies

## Production Deployment

Refer to `DEPLOYMENT_NOTES.md` for detailed production deployment instructions.

## License

MIT