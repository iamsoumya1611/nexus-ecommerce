import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Hero = () => {
  const data = [
        "https://rukminim1.flixcart.com/flap/1680/280/image/1defb861e409319b.jpg?q=50",
        "https://rukminim1.flixcart.com/flap/1680/280/image/685712c6cefb3c02.jpg?q=50",
        "https://rukminim1.flixcart.com/flap/1680/280/image/8d4150cc4f3f967d.jpg?q=50",
        "https://rukminim1.flixcart.com/flap/1680/280/image/685712c6cefb3c02.jpg?q=50"
    ];


     const SampleNextArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block", right: "10px", zIndex: 10 }}
                onClick={onClick}
            />
        );
    };

    const SamplePrevArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{ ...style, display: "block", left: "10px", zIndex: 10 }}
                onClick={onClick}
            />
        );
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        fade: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
    };

  return (
    <div className="banner-container">
            <Slider {...settings}>
                {data.map((item, i) => (
                    <div key={i}>
                        <img src={item} alt={`Banner ${i + 1}`} className='banner_img' loading="lazy" />
                    </div>
                ))}
            </Slider>
        </div>
  );
};

export default Hero;