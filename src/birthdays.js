const $ = require('jquery');
import 'slick-carousel';

$(document).ready(function(){
    $('.birthday-slider').slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000
    });
});