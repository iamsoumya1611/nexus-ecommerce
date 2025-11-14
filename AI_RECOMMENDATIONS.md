# AI-Powered Product Recommendations

This document explains how to set up and use the AI-powered product recommendation feature in the Nexus e-commerce platform.

## Overview

The AI recommendation system uses Google's Gemini 1.5 Flash model to provide personalized product recommendations based on user purchase history and product categories.

## Setup Instructions

### 1. Obtain a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/) or [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Generative AI API
4. Create an API key
5. Copy the API key for use in the next step

### 2. Configure Environment Variables

Update the `.env` file in the `server` directory with your actual Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies

The required dependencies should already be installed:
- `@google/generative-ai` (server-side)
- `react-spinners` (client-side)

If for some reason they are missing, install them:

```bash
# In the server directory
npm install @google/generative-ai

# In the client directory
npm install react-spinners
```

## How It Works

### Personalized Recommendations

For logged-in users, the system:
1. Analyzes the user's purchase history
2. Extracts product categories and preferences
3. Uses AI to generate personalized product recommendations
4. Falls back to category-based recommendations if AI fails

### Category Recommendations

For specific product categories:
1. Fetches top products in the category
2. Uses AI to select the most appealing products
3. Falls back to top-rated products if AI fails

## Components

### Server-Side
- `server/config/gemini.js` - Configuration for Gemini AI model
- `server/controllers/recommendationController.js` - AI-powered recommendation logic
- `server/routes/recommendationRoutes.js` - API endpoints

### Client-Side
- `client/src/actions/recommendationActions.js` - Redux actions for recommendations
- `client/src/reducers/recommendationReducers.js` - Redux reducers for recommendation state
- `client/src/components/AIRecommendations.jsx` - Component for personalized recommendations
- `client/src/components/CategoryRecommendations.jsx` - Component for category-based recommendations

## API Endpoints

### Get Personalized Recommendations
```
GET /api/recommendations
```
Requires authentication. Returns AI-generated product recommendations for the logged-in user.

### Get Category Recommendations
```
GET /api/recommendations/category/:category
```
Returns AI-selected top products in the specified category.

## Troubleshooting

### No Recommendations Showing
1. Ensure the user is logged in (personalized recommendations only show for authenticated users)
2. Check that the Gemini API key is correctly configured
3. Verify that the user has purchase history (new users will see popular products)

### AI Errors
1. Check the server logs for AI-related errors
2. Verify the Gemini API key is valid and has proper permissions
3. Ensure the server has internet access to reach Google's AI services

## Customization

You can customize the AI prompts in `server/controllers/recommendationController.js` to adjust how recommendations are generated.