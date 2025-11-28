import React, { useEffect } from 'react';
import { useRecommendation, recommendationActions } from '../contexts/RecommendationContext';
import { useUser } from '../contexts/UserContext';
import Product from './Product';
import { ClipLoader } from 'react-spinners';

const AIRecommendations = () => {
  const { state: recommendationState, dispatch: recommendationDispatch } = useRecommendation();
  const { list: recommendationList } = recommendationState;
  const { loading, error, recommendations } = recommendationList;

  const { userInfo } = useUser();

  useEffect(() => {
    // Always fetch recommendations, even for non-logged-in users
    recommendationActions.listRecommendations()(recommendationDispatch);
  }, [recommendationDispatch]);

  return (
    <div className="my-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-primary-900 mb-4">Recommended For You</h2>
        <p className="text-primary-700 max-w-2xl mx-auto">
          {userInfo 
            ? "AI-powered recommendations based on your preferences and purchase history" 
            : "AI-powered recommendations tailored just for you"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader color="#4F46E5" size={50} />
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
          <p className="text-primary-700">No recommendations available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;