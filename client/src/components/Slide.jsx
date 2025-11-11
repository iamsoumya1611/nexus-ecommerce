import Divider from '@mui/material/Divider';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { products } from '../productdata';
import { colorPalette } from '../config/colors';
// import './slide.css';

const responsive = {
    superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: 5
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 4
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
    }
};

const Slide = (props) => {
    // Ensure we have products to display
    if (!products || products.length === 0) {
        return (
            <div className='w-full my-2 mx-auto font-sans'>
                <div className='flex justify-between items-center mt-4 p-5'>
                    <h3 className='text-primary-700 font-semibold text-lg'>{props.title}</h3>
                    <button className="py-2 px-4 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors font-medium">View All</button>
                </div>
                <Divider />
                <div className="bg-white p-4 text-center text-gray-500">
                    No products available at the moment
                </div>
            </div>
        );
    }

    return (
        <div className='w-full my-2 mx-auto font-sans'>
            <div className='flex justify-between items-center mt-4 p-5'>
                <h3 className='text-primary-700 font-semibold text-lg'>{props.title}</h3>
                <button className="py-2 px-4 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors font-medium">View All</button>
            </div>

            <Divider />

            <Carousel 
                responsive={responsive}
                infinite={true}
                draggable={true}
                swipeable={true}
                showDots={false}
                centerMode={false}
                autoPlay={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-20-px"
                containerClass="carousel-container"
                slidesToSlide={1}
            >
                {products.map((product) => (
                    <div key={product.id} className="bg-white m-2 p-4 flex flex-column items-center cursor-pointer hover:shadow-lg transition-shadow rounded-lg h-full">
                        <div className="text-center">
                            <img 
                                className='w-32 h-32 mt-1 mx-auto object-contain' 
                                src={product.url} 
                                alt={product.title.shortTitle} 
                            />
                            <p className="text-sm mt-2 text-gray-900 font-medium line-clamp-2">{product.title.shortTitle}</p>
                            <p className='text-sm mt-2 text-primary-500 font-semibold'>{product.discount}</p>
                            <p className="text-sm mt-2 text-gray-900">{product.tagline}</p>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default Slide