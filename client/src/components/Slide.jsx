import React from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const Slide = ({ title, products }) => {
    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        }
    };

    // Ensure products is an array before mapping
    const validProducts = Array.isArray(products) ? products : [];

    return (
        <div className="slide-container mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-900">{title}</h2>
                <button className="text-primary-700 hover:text-primary-900 font-medium flex items-center">
                    View All <i className="fas fa-chevron-right ml-2 text-sm"></i>
                </button>
            </div>
            
            <Carousel
                responsive={responsive}
                swipeable={true}
                draggable={true}
                showDots={false}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                itemClass="carousel-item-padding-20-px"
                containerClass="carousel-container"
                slidesToSlide={1}
            >
                {validProducts.map((product) => (
                    <div key={product.id} className="bg-white m-2 p-4 flex flex-column items-center cursor-pointer hover:shadow-lg transition-shadow rounded-lg h-full">
                        <div className="text-center">
                            <img 
                                className='w-32 h-32 mt-1 mx-auto object-contain' 
                                src={product.url} 
                                alt={product.title?.shortTitle || 'Product'} 
                                loading="lazy"
                            />
                            <p className="text-sm mt-2 text-gray-900 font-medium line-clamp-2">{product.title?.shortTitle || 'Untitled Product'}</p>
                            <p className='text-sm mt-2 text-primary-500 font-semibold'>{product.discount || ''}</p>
                            <p className="text-sm mt-2 text-gray-900">{product.tagline || ''}</p>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default Slide