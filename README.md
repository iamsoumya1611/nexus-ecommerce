# E-Commerce Platform

A full-featured e-commerce platform built with the MERN stack.

## Features

- User authentication (register, login, logout)
- Product listing with filtering and sorting
- Shopping cart functionality
- Order processing with payment integration
- Admin panel for product, user, and order management
- Cloudinary image upload for products
- Category-specific product attributes
- Responsive design with Tailwind CSS

## Setup Instructions

1. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. **Import Sample Data:**
   ```bash
   # Import sample products
   cd server
   npm run import-products
   
   # Destroy sample products
   npm run destroy-products
   ```

4. **Run the Application:**
   ```bash
   # Run server and client concurrently
   cd server
   npm run dev-all
   
   # Or run separately
   # Server: npm run dev
   # Client: npm run dev-frontend
   ```

## Admin Features

- **Product Management:**
  - Create, edit, and delete products
  - Upload product images to Cloudinary
  - Set category-specific attributes (Electronics, Fashion, Books, etc.)
  
- **User Management:**
  - View all users
  - Edit user details
  - Grant/revoke admin privileges
  
- **Order Management:**
  - View all orders
  - Mark orders as delivered

## Category-Specific Attributes

Products can have different attributes based on their category:

- **Electronics:** Model, Storage, Color, Screen Size
- **Fashion:** Size, Material, Gender
- **Books:** Author, Publisher, Pages
- **Home & Kitchen:** Weight, Dimensions
- **Sports:** Gender
- **Beauty:** Gender

## Cloudinary Integration

Product images are uploaded to Cloudinary for efficient storage and delivery. The upload process:
1. Select an image file in the admin product creation/edit form
2. Image is converted to base64 and sent to the server
3. Server uploads the image to Cloudinary
4. Cloudinary returns the image URL and ID
5. Product is saved with the Cloudinary image URL

## Available Scripts

### Server Scripts
- `npm run dev` - Start the server in development mode
- `npm run import-products` - Import sample products
- `npm run destroy-products` - Remove all products from database

### Client Scripts
- `npm run dev-frontend` - Start the React development server
- `npm run build` - Build the React application for production

## Technologies Used

- **Frontend:** React, Redux, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Image Storage:** Cloudinary
- **Payment Processing:** Stripe