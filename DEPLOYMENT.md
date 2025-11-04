# Deployment Guide

## Vercel Deployment

This application is configured for deployment to Vercel. The deployment process involves:

1. Building the React frontend
2. Serving the frontend static files from the Express backend
3. Deploying the entire application as a single Vercel project

## Configuration Files

- `vercel.json`: Configures the Vercel deployment
- `server/server.js`: Modified to serve static files from the React build in production
- `server/package.json`: Added postinstall script to build the frontend during deployment

## Environment Variables

Ensure the following environment variables are set in your Vercel project settings:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel project settings
4. Deploy the project

The build process will automatically:
1. Install dependencies for both server and client
2. Build the React frontend
3. Start the Express server

## Troubleshooting

If you encounter build errors:

1. Check that all environment variables are properly set
2. Ensure the MongoDB connection string is correct
3. Verify that the build script in `server/package.json` runs successfully locally