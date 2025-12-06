import React, { useEffect } from 'react';
import { useRecommendation, recommendationActions } from '../contexts/RecommendationContext';
import Product from './Product';
import { ClipLoader } from 'react-spinners';
import LoadingSpinner from './LoadingSpinner';

const CategoryRecommendations = ({ category }) => {
  const { state: recommendationState, dispatch: recommendationDispatch } = useRecommendation();
  const { category: categoryRecommendations } = recommendationState;
  const { loading, error, recommendations } = categoryRecommendations;

  useEffect(() => {
    if (category) {
      recommendationActions.getCategoryRecommendations(category)(recommendationDispatch);
    }
  }, [recommendationDispatch, category]);

  if (!category) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">Recommended in {category}</h2>
        <p className="text-primary-700 max-w-2xl mx-auto">
          AI-selected top picks in this category just for you
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {recommendations.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <p className="text-primary-700">No recommendations available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryRecommendations;