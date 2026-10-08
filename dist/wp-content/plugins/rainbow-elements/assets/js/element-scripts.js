(function ($) {
    "use strict";

    var $document = $(document),
        $window = $(window),
        isEditMode = false;


    /**
     * Portfolio Filter Options
     * @param $scope
     * @param $
     * @constructor
     */
    var PortfolioFilter = function ($scope, $){
        var rn_portfolio_area = $scope.find('.rn-portfolio-area').eq(0);
        var uniq_id = rn_portfolio_area.attr('id');

        $('#' + uniq_id ).imagesLoaded(function () {
            // filter items on button click
            $('#' + uniq_id + ' .messonry-button').on('click', 'button', function () {
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({
                    filter: filterValue
                });
            });
            // init Isotope
            var $grid = $('#' + uniq_id + ' .rn-filterable-portfolios').isotope({
                itemSelector: '.rn-filterable-portfolio-item',
                percentPosition: true,
                transitionDuration: '0.7s',
                layoutMode: 'fitRows',
                masonry: {
                    // use outer width of grid-sizer for columnWidth
                    columnWidth: '.rn-filterable-portfolio-item',
                }
            });
        });

       

        $('#' + uniq_id + ' .messonry-button button').on('click', function (event) {
            $(this).siblings('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
            event.preventDefault();
        });
    }

    
    var PortfolioFilterSlider = function ($scope, $){

       
        var rn_portfolio_area = $scope.find('.portfolio-style-three').eq(0);
        var uniq_id = rn_portfolio_area.attr('id');
   
        var SlickCarousel = $('#' + uniq_id );
        if (SlickCarousel.length) {
            try {
                if (SlickCarousel.find('.portfolio-slick-activation').hasClass('slick-initialized')) {
                    SlickCarousel.find('.portfolio-slick-activation').slick('unslick');
                }                   
            } catch (e) {}
            
            SlickCarousel.find('.portfolio-slick-activation').slick({               
                infinite: false,
                slidesToShow: 3,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                cssEase: 'linear',
                adaptiveHeight: true,
                prevArrow: '<button class="slide-arrow prev-arrow"><i class="feather-arrow-left"></i></button>',
                nextArrow: '<button class="slide-arrow next-arrow"><i class="feather-arrow-right"></i></button>',
                responsive: [{
                        breakpoint: 1124,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 868,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            dots: true,
                            arrows: false,
                        }
                    }
                ]
                
            });
        }
        
    }
  

    var portfolio_ajax = function() {};

    // Init 
	$(window).on('elementor/frontend/init', function () {
	    if(elementorFrontend.isEditMode()) {
	        isEditMode = true;
	    }
       elementorFrontend.hooks.addAction('frontend/element_ready/rainbow-portfolio-grid.default', PortfolioFilter);

        if(elementorFrontend.isEditMode()) { 
            elementorFrontend.hooks.addAction('frontend/element_ready/rainbow-portfolio-grid.default', PortfolioFilterSlider);
        }
        elementorFrontend.hooks.addAction('frontend/element_ready/rainbow-portfolio-grid.default', portfolio_ajax);
    });


}(jQuery));
