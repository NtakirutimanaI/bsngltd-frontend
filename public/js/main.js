window.initTemplate = function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    if (window.WOW) new WOW().init();


    // Sticky Navbar
    $(window).off('scroll').scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('bg-white shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('bg-white shadow-sm').css('top', '-150px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').off('click').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Destroy existing carousels if any to prevent duplicate initialization
    if ($(".header-carousel").hasClass('owl-loaded')) {
        $(".header-carousel").trigger('destroy.owl.carousel');
        $(".header-carousel").removeClass('owl-hidden');
    }
    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        dots: true,
        items: 1
    });

    if ($(".testimonial-carousel").hasClass('owl-loaded')) {
        $(".testimonial-carousel").trigger('destroy.owl.carousel');
        $(".testimonial-carousel").removeClass('owl-hidden');
    }
    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        animateIn: 'fadeIn',
        animateOut: 'fadeOut',
        dots: true,
        loop: true,
        nav: false
    });
    
};


