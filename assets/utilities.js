/* eslint-disable */
/* ==================================================
#Image functions
#Recently viewed
#Load more / infinite load
#Filter products with AJAX
#Search autocomplete
#Sidebar filter on collection pages
#Misc
#Quick shop
#Newsletter popup
#Currency converter
#Product Media Controls
#Plyr setup

/*============================================================================
  Image functions
==============================================================================*/


window.usePageDots = window.PXUTheme.theme_settings.page_dots_enabled;

 window.imageFunctions = {
  zoom: function(){
    var $image = $(event.target);
    var zoomSrc = $image.data('zoom-src');

    if (zoomSrc) {
      $image.wrap('<span class="zoom-container"></span>').css('display', 'block').parent().zoom({
        url: zoomSrc,
        touch: false,
        magnify: 1
      });
    }
  },
  linkGalleryAndCarousel: function($gallery, $carousel){

    $carousel.find('.gallery-cell:nth-child(1)').addClass('is-nav-selected');

    //EVENT - click on carousel item to slide gallery
    $carousel.on( 'click', '.gallery-cell', function() {
        var index = $(this).index();
        $carousel.find('.is-nav-selected').removeClass('is-nav-selected');
        $(this).addClass('is-nav-selected');
        $gallery.flickity( 'select', index );
    });

    //EVENT - update carousel based on gallery index
    $gallery.on( 'select.flickity', function() {
      var galleryData = $(this).data('flickity');
      if (galleryData){
        $carousel.find('.is-nav-selected').removeClass('is-nav-selected');
        $carousel.find('.gallery-cell:nth-child(' + (galleryData.selectedIndex + 1) + ')').addClass('is-nav-selected');
      }
    });
  },
  fullWidth: function(images, imageContainer){
    $(images).each(function(){
      var $image = $(this),
          alt = $image.attr('alt'),
          src = $image.attr('src');

      if (alt.indexOf("[") >= 0){

        //remove from description
        $image.remove();

        //find shortcode values and remove from alt
        var shortcodes = alt.match(/\[(.*?)\]/ig);
        alt = alt.replace(/\[(.*?)\]/ig, '');

        //remove brackets from shortcode to be used as classes
        var captionClass = $.map( shortcodes, function( value, index ) {
            value = value.replace(/[\[\]']+/g,'');
            return value;
        });

        //markup for caption

        var caption = [
            '<div class="position-' + (captionClass.length ? captionClass : 'center') + ' caption js-caption">',
              '<div class="caption-content caption-background-false align-' + (captionClass.length ? captionClass : 'center') + '">',
                '<p class="headline">' + alt + '</p>',
              '</div>',
            '</div>'
        ].join('');

        //image attributes added
        $image.attr({
          alt: alt,
          class: 'lazyload blur-up',
          src: src,
          dataSizes: 'auto'
        });

        var image = $image.prop('outerHTML')
        var banner =  '<div class="banner">' + image + caption + '</div>'

        $(imageContainer).append(banner);
      }
    })
  },
  showSecondaryImage: function(){
    if (window.PXUTheme.media_queries.large.matches) {
      $('.has-secondary-media-swap').off().on('mouseenter', function() {
        if (window.PXUTheme.theme_settings.product_form_style == 'select') {
          $(this).find('.product_gallery').toggleClass('secondary-media-hidden');
        }
        $(this).find('.image-element__wrap img').toggleClass('secondary-media-hidden');
        $(this).find('[data-html5-video]').toggleClass('secondary-media-hidden');
        $(this).find('.external-video__container').toggleClass('secondary-media-hidden');
        window.videoFeature.enableVideoOnHover($(this));
      });

      $('.has-secondary-media-swap').on('mouseleave', function() {
        if (window.PXUTheme.theme_settings.product_form_style == 'select') {
          $(this).find('.product_gallery').toggleClass('secondary-media-hidden');
        }
        $(this).find('.image-element__wrap img').toggleClass('secondary-media-hidden');
        $(this).find('[data-html5-video]').toggleClass('secondary-media-hidden');
        $(this).find('.external-video__container').toggleClass('secondary-media-hidden');
        window.videoFeature.enableVideoOnHover($(this));
      });
    }
  },
  //Fix for flickity issue on IOS, where you can't swipe through the slider
  flickityIosFix: function()  {
    var touchingCarousel = false,
      touchStartCoords;

    document.body.addEventListener('touchstart', function(e) {
      if (e.target.closest('.flickity-slider')) {
        touchingCarousel = true;
      } else {
        touchingCarousel = false;
        return;
      }

      touchStartCoords = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }
    });

    document.body.addEventListener('touchmove', function(e) {
      if (!(touchingCarousel && e.cancelable)) {
        return;
      }

      var moveVector = {
        x: e.touches[0].pageX - touchStartCoords.x,
        y: e.touches[0].pageY - touchStartCoords.y
      };

      if (Math.abs(moveVector.x) > 7)
        e.preventDefault()

    }, {passive: false});
  }
}

/* ============================================================================
  Recently viewed
============================================================================== */

window.recentlyViewed = {
  init() {
    let productHandle;
    let rvCookie;
    let rvProducts;
    let displayProducts;
    let rvProductArray;

    if ($('.js-product-section[data-rv-handle]').length) {
      productHandle = $('.js-product-section').data('rv-handle').toString();
      rvCookie = window.Cookies.get('recentlyViewed');
      rvProducts = window.recentlyViewed.getCookieProducts(rvCookie, productHandle);
    } else if ($('.recently-viewed__section').length) {
      rvCookie = window.Cookies.get('recentlyViewed');
      rvProducts = window.recentlyViewed.getCookieProducts(rvCookie, productHandle);
    } else if ($('.js-sidebar-recently-viewed').length) {
      rvCookie = window.Cookies.get('recentlyViewed');
      rvProducts = window.recentlyViewed.getCookieProducts(rvCookie, productHandle);
    }

    if (rvProducts) {
      rvProductArray = unescape(rvProducts).split(',');
    }

    if (productHandle) {
      if (!$.inArray(productHandle, rvProductArray) !== -1) {
        displayProducts = [];
        rvProductArray.unshift(productHandle);
        $.each(rvProductArray, (_i, el) => {
          if ($.inArray(el, displayProducts) === -1) displayProducts.push(el);
        });
      }

      window.recentlyViewed.setCookieProducts(displayProducts);
    } else {
      displayProducts = rvProductArray;
    }

    if ($('.recently-viewed__section').length) {
      const parent = '.recently-viewed__section';
      const recentlyViewedProductsLoaded = $(parent).data('recently-viewed-items-loaded');

      if (recentlyViewedProductsLoaded) {
        return false;
      }

      window.recentlyViewed.getProductInformation(parent, displayProducts, productHandle);
    } else if ($('.js-recently-viewed .rv-main').length) {
      const parent = '.js-recently-viewed';
      const recentlyViewedProductsLoaded = $(parent).data('recently-viewed-items-loaded');

      if (recentlyViewedProductsLoaded) {
        return false;
      }

      window.recentlyViewed.getProductInformation(parent, displayProducts, productHandle);
    }

    if ($('.sidebar .js-sidebar-recently-viewed').length) {
      const parent = '.sidebar .js-sidebar-recently-viewed';
      const recentlyViewedProductsLoaded = $(parent).data('recently-viewed-items-loaded');
      if (recentlyViewedProductsLoaded) {
        return false;
      }

      if (productHandle) {
        window.recentlyViewed.getProductInformation(parent, displayProducts, productHandle);
      } else {
        window.recentlyViewed.getProductInformation(parent, displayProducts);
      }
    }
  },
  getCookieProducts(rvCookie, productHandle) {
    if (!rvCookie && productHandle) {
      window.Cookies.set(
        'recentlyViewed',
        productHandle,
        {
          expires: 30,
          path: '/',
          sameSite: 'None',
          secure: true,
        },
      );
      rvCookie = window.Cookies.get('recentlyViewed');
    } else {
      rvCookie = window.Cookies.get('recentlyViewed');
    }

    return rvCookie;
  },
  setCookieProducts(rvProductArray) {
    window.Cookies.set(
      'recentlyViewed',
      escape(rvProductArray.join(',')),
      {
        expires: 30,
        path: '/',
        sameSite: 'None',
        secure: true,
      },
    );
  },
  getProductInformation(parent, displayProducts, productHandle) {
    // Add data-attribute 'recently-viewed-items-loaded="true" to parent container
    $(parent).attr('data-recently-viewed-items-loaded', 'true');

    if (productHandle) {
      displayProducts.splice($.inArray(productHandle, displayProducts), 1);
    }

    const productLimit = $(parent).data('visible-products');

    if (productLimit && displayProducts) {
      displayProducts = displayProducts.slice(0, productLimit);
    }

    $.each(displayProducts, (index, value) => {
      if (value) {
        $(parent).removeClass('hidden');

        $(parent).parents('.sidebar-block').show();

        $.ajax({
          type: 'GET',
          url: `${window.PXUTheme.routes.all_products_collection_url}/products/${value}?view=rv`,
          success(data) {
            const rvProduct = $(data).find('.js-recently-viewed-product');

            $(parent).find(`.rv-box-${index}`).append(rvProduct);

            // Call enable gallery function for product galleries
            $(`.rv-box-${index} [data-product-gallery]`).each((_, gallery) => {
              const $productGallery = $(gallery);
              window.productPage.enableGallery($productGallery);
            });

            // Convert currencies
            if (window.PXUTheme.currency.show_multiple_currencies) {
              window.currencyConverter.convertCurrencies();
            }

            // Run option selectors
            window.productPage.runOptionSelector($(`.rv-box-${index}`));

            // Initialize shopify payment buttons
            if (Shopify.PaymentButton) {
              Shopify.PaymentButton.init();
            }

            // Hide <noscript> elements
            window.hideNoScript();

            // Initialize swatch toggler
            $('.swatch_options label').on('click', function() {
              window.quickShop.toggleSwatchImages($(this));
            });

            // Initialize the show secondary media on hover feature
            if (window.PXUTheme.theme_settings.collection_secondary_image) {
              window.imageFunctions.showSecondaryImage();
            }

            const $video = rvProduct.find('[data-html5-video] video, [data-youtube-video]');
            if ($video.length > 0) {
              window.videoFeature.setupPlayerForRecentlyViewedProducts(rvProduct.find('[data-html5-video] video, [data-youtube-video]'));
            }
          },
          error(x, t, m) {
            console.log(x);
            console.log(t);
            console.log(m);
          },
          dataType: 'html',
        });
      }

      if ($(parent).find('.rv-main').hasClass('js-rv-grid')) {
        if (displayProducts.length <= productLimit) {
          $('.js-rv-grid .thumbnail').eq(displayProducts.length).nextAll().addBack()
            .remove();
        } else {
          $('.js-rv-grid .thumbnail').eq(productLimit).nextAll().addBack()
            .remove();
        }
      }
    });
  }
};

/* ===============================================
  #Load more / infinite load
================================================== */

var enableLoadMoreProducts = function() {
  $('body').on('click', '.js-load-more a', function(e) {
    enableInfiniteScroll('.product-list');
    e.stopPropagation();
    return false;
  });
}

var enableLoadMoreButton = function(parentClass) {

  var $grid = parentClass + '[data-load-more--grid]';
  var $gridItems = parentClass + ' [data-load-more--grid-item]';


  $('body').on('click', '[data-load-more]', function (e) {

    e.preventDefault();

    var $button = $(this);
    var url = $button.attr('href');

    loadNextPage(url, $button);
  });

  function loadNextPage(url, $button) {

    $.ajax({
      type: 'GET',
      dataType: 'html',
      url: url,
      beforeSend: function () {
        $button.addClass('is-loading');
        $('.load-more__icon').addClass('loading-in-progress').css({
          'height': '40px',
          'width': '40px',
          'opacity': '1'
        });
      },
      success: function success(data) {
        $button.removeClass('is-loading');
        $('.load-more__icon').removeClass('loading-in-progress').css({
          'height': '0',
          'width': '0',
          'opacity': '0'
        });

        const thumbnails = $(data).find($gridItems);

        var loadMoreButtonUrl = $(data).find('[data-load-more]').attr('href');

        $('[data-load-more]').attr('href', loadMoreButtonUrl);
        $($grid).first().append(thumbnails).append($('.js-load-more'));

        // Convert currencies
        if (window.PXUTheme.currency.show_multiple_currencies) {
          window.currencyConverter.convertCurrencies();
        }

        // Initialize the product page and run option selectors
        window.productPage.init();
        window.productPage.runOptionSelector(thumbnails);

        // Initialize shopify payment buttons
        if (Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        // Initialize the quick shop
        if (window.PXUTheme.theme_settings.quick_shop_enabled) {
          window.quickShop.init();
        }

        // Hide <noscript> elements
        window.hideNoScript();

        // Initialize video players
        window.videoFeature.init();

        // Initialize the show secondary media on hover feature
        if (window.PXUTheme.theme_settings.collection_secondary_image) {
          window.imageFunctions.showSecondaryImage();
        }

        // When there are no additional pages, hide load more button
        if (typeof loadMoreButtonUrl == 'undefined') {
          $('[data-load-more]').addClass('is-hidden');
        }
      },
      error: function (x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
        location.replace(location.protocol + '//' + location.host + filterURL);
      }
    });
  }
}

var enableInfiniteScroll = function(parentClass) {
  if ($(parentClass).length) {
    var infiniteScroll = new Waypoint.Infinite({
      element: $(parentClass)[0],
      items: parentClass,
      more: '[data-load-more]',
      loadingClass: 'loading-in-progress',
      onBeforePageLoad: function() {
        $('.js-load-more').hide();
      },
      onAfterPageLoad: function(data) {
        const $gridItems = $(`${parentClass} [data-load-more--grid-item]`);
        const thumbnails = $(data).find($gridItems);

        $(`${parentClass} > ${parentClass} .thumbnail`).unwrap(parentClass);

        // Convert currencies
        if (window.PXUTheme.currency.show_multiple_currencies) {
          window.currencyConverter.convertCurrencies();
        }

        // Initialize the product page and run option selectors
        window.productPage.init();
        window.productPage.runOptionSelector(thumbnails);

        // Initialize shopify payment buttons
        if (Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        // Initialize the quick shop
        if (window.PXUTheme.theme_settings.quick_shop_enabled) {
          window.quickShop.init();
        }

        // Hide <noscript> elements
        window.hideNoScript();

        // Initialize video players
        window.videoFeature.init();

        // Initialize the show secondary media on hover feature
        if (window.PXUTheme.theme_settings.collection_secondary_image) {
          window.imageFunctions.showSecondaryImage();
        }

        // Refresh waypoints
        Waypoint.refreshAll();
      }
    })
  }
}

window.hideNoScript = function(){
  // Used to ensure noscript elements are hidden when JS is present.
  $('.image__container .noscript').addClass('hidden');
}

/*============================================================================
  Filter Products with AJAX
==============================================================================*/

Shopify.queryParams = {};
if (location.search.length) {
 for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
    aKeyValue = aCouples[i].split('=');
    if (aKeyValue.length > 1) {
     Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
    }
  }
}

var quickFilter = {
  init() {
    var selectedOptions = [],
        query = '',
        currentTags = '';

    //Handle dropdowns if they exist
    if ($('#sort-by').length){
      query = $('#sort-by').val();
    } else {
      query = url('?sort_by');
    }

    if ($('#tag_filter').length){
      var $tagFilterValue = $('#tag_filter').val();

      if ($('#tag_filter').data('default-collection') != $tagFilterValue){
        urlTag = $tagFilterValue.substr($tagFilterValue.lastIndexOf('/') + 1);
        var tagFilterUrl = $tagFilterValue.substr($tagFilterValue)

        // apply the selected attribute to the proper option value in tag filter dropdown
        $('#tag_filter option').removeAttr('selected');
        $('#tag_filter option[value="' + tagFilterUrl + '"]').attr('selected', 'selected')

        if (urlTag != 'all'){
          if ($.inArray( urlTag, selectedOptions ) > -1){
            //Do nothing
          } else {
            selectedOptions.unshift(urlTag);
          }
        }
      }
    }

    //Add all checkbox values to array
    $('[data-option-filter] input:checked').each(function (){
      selectedOptions.push($(this).val());
    });
    selectedOptions = $.makeArray(selectedOptions);

    //Loop through tags to create string to update page url
    $.each(selectedOptions, function(i, value){

      if (i != selectedOptions.length - 1) {
        currentTags += selectedOptions[i] + '+';
      } else {
        currentTags += selectedOptions[i];
      }

    });

    Shopify.queryParams.sort_by = query;
    query = '?' + $.param(Shopify.queryParams).replaceAll('%2B', '+');

    quickFilter.processUrl(currentTags, query);
  },
  updateView(filterURL) {

    $.ajax({
      type: 'GET',
      url: filterURL,
      beforeSend: function() {
        $('.product-list--collection').addClass('fadeOut animated loading-in-progress filter-loading');
        Waypoint.destroyAll();
      },
      success: function(data) {
        const $gridItems = $('.product-list--collection [data-load-more--grid-item');
        const thumbnails = $(data).find($gridItems);

        $('.product-list--collection').removeClass('loading-in-progress');
        $(".product-list--collection").removeClass('filter-loading');
        var filteredBreadcrumb = $(data).find('.breadcrumb_text').html();
        $('.breadcrumb_text').html(filteredBreadcrumb);

        var filteredPagination = $(data).find('.paginate').html();
        $('.paginate').html(filteredPagination);

        var filteredSidebar = $(data).find('.sidebar').html();
        $('.sidebar').html(filteredSidebar);

        var filteredPageLinks = $(data).find('.paginate').html();
        $('.paginate').empty();
        $('.paginate').html(filteredPageLinks);

        var filteredData = $(data).find('.product-list--collection');
        $('.product-list--collection').remove();
        filteredData.insertBefore( $('.load-more__icon') );

        window.history && window.history.pushState && window.history.pushState("", "", filterURL);

        if ($('.sidebar__collection-filter').length){
          window.collectionSidebarFilter.init();
        }

        // Reload recently viewed products
        window.recentlyViewed.init();

        // Convert currencies
        if (window.PXUTheme.currency.show_multiple_currencies) {
          window.currencyConverter.convertCurrencies();
        }

        // Initialize the product page and run option selectors
        window.productPage.init();
        window.productPage.runOptionSelector(thumbnails);

        // Initialize shopify payment buttons
        if (Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        // Prevent event bubbling
        $('body').off('click', '.swatch-element');

        // Reload product swatches
        window.productPage.productSwatches();

        // Initialize swatch toggler
        $('.swatch_options label').on('click', function() {
          window.quickShop.toggleSwatchImages($(this));
        });

          // Load more / infinite load

        if (window.PXUTheme.theme_settings.pagination_type === 'load_more') {
          window.enableLoadMoreProducts();
        }

        if (window.PXUTheme.theme_settings.pagination_type === 'load_more_button') {
          window.enableLoadMoreButton('.product-list');
        }

        if (window.PXUTheme.theme_settings.pagination_type === 'infinite_scroll') {
          window.enableInfiniteScroll('.product-list');
        }
      },
      error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
        location.replace(location.protocol + '//' + location.host + filterURL);

      },
      dataType: "html"
    });
  },
  processUrl(tags, query) {
    const currentPath = window.location.pathname.split('/');

    const newQuery = query.replace(/\page=(\w+)&/, '');

    const endIndex = currentPath.indexOf('collections') + 1;
    const newPath = currentPath.slice(0, endIndex + 1).join('/') + '/';

    const urlString = newPath + tags + newQuery;

    quickFilter.updateView(urlString);

  }
}


/*============================================================================
  Search autocomplete
==============================================================================*/

window.searchAutocomplete = {
  vars: {
    term: '',
    searchPath: window.PXUTheme.routes.search_url,
    displayTimer: ''
  },
  init: function(){

    this.unload();

    // Focus state to display search results
    $('[data-autocomplete-true]').on('focus', function() {
      $(this).parents('[data-autocomplete-true]').find('.search__results-wrapper').show();
    });

    // Clicking outside makes the results disappear.
    $(document).on('click focusout', function(e) {
      if (window.PXUTheme.media_queries.large.matches) {
        var searchForm = $(e.target).parents('.search__form');

        if (searchForm.length === 0) {
          $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
        }
      }
    });

    $('[data-dropdown-rel="search"]').on('click', function(e) {
      if (window.PXUTheme.theme_settings.enable_autocomplete && window.PXUTheme.media_queries.medium.matches) {
        e.preventDefault();
        var formType = $(this).closest('form').find('[name="type"]').val();
        var position = $(document).scrollTop();
        window.searchAutocomplete.showMobileSearch(formType, position);
      }
    });

    $('.search-close').on('click touchstart', function() {
      $('body').removeClass('is-active');
      $('.dropdown_link').removeClass('active_link');
      $('.dropdown_container').hide();
      $('.mobile_nav').find('div').removeClass('open');
      $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
    })

    // Submit wildcard searches
    $("[data-autocomplete-true] form").on("submit", function(e) {
      e.preventDefault();
      var formValue = $(this).find('input[name="q"]').val();
      var cleanFormValue = encodeURI(formValue);

      if ($(this).find('[name="type"]').length > 0) {
        var searchType = $(this).find('[name="type"]').val();
      } else {
        var searchType = window.PXUTheme.theme_settings.search_option;
      }

      if (cleanFormValue == null) {
        window.location.href = window.PXUTheme.routes.search_url + '?type=' + searchType;
      } else {
        window.location.href = window.searchAutocomplete.vars.searchPath + '?type=' + searchType + '&q=' + cleanFormValue + '*';
      }
    });

    $('[data-autocomplete-true] form').each(function() {
      var $this = $(this);
      var input = $this.find('input[name="q"]');

      // Adding a list for showing search results.
      $('<div class="search__results-wrapper"><ul class="search__results"></ul></div>').appendTo($this);

      input.attr('autocomplete', 'off').on('input', function() {
        clearTimeout(window.searchAutocomplete.vars.displayTimer);
        if ($(this).val().length > 3) {
          window.searchAutocomplete.vars.term = $(this).val();
          window.searchAutocomplete.getResults(window.searchAutocomplete.vars.term, $this);
        } else {
          $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
        }
      });
    });
  },
  getResults: function(term, $this) {

    if ($this.find('[name="type"]').length > 0) {
      var searchType = $this.find('[name="type"]').val();
    } else {
      var searchType = window.PXUTheme.theme_settings.search_option;
    }

    jQuery.getJSON("/search/suggest.json", {
      "q": term,
      "resources": {
        "type": searchType,
        "limit": window.PXUTheme.theme_settings.search_items_to_display,
        "options": {
          "unavailable_products": "last",
          "fields": "title,body,variants.title,vendor,product_type,tag"
        }
      }
    }).done(function(response) {

      var suggestions = [
        response.resources.results.products,
        response.resources.results.pages,
        response.resources.results.articles
      ];

      var filteredResults = [];

      // Store results in array
      $.each(suggestions, function(index, suggestion) {
        if (suggestion !== undefined && suggestion.length > 0) { // Ensure suggestion exists
          filteredResults.push(suggestion)
        }
      })

      // Display results
      window.searchAutocomplete.vars.displayTimer = setTimeout(function() {
        window.searchAutocomplete.displayResults(filteredResults[0], $this);
      }, 500)
    });
  },
  displayResults: function(results, $this) {

    var $resultsWrapper = $this.find('.search__results-wrapper');
    var $resultsList = $this.find('.search__results');
    $resultsWrapper.show();
    $resultsList.empty();

    if ($this.find('[name="type"]').length > 0) {
      var searchType = $this.find('[name="type"]').val();
    } else {
      var searchType = window.PXUTheme.theme_settings.search_option;
    }

    if (results && results.length > 0) {
      $.each(results, function(index, result) {

        var link = $('<a tabindex="0"></a>').attr('href', result.url);
        if (window.PXUTheme.routes.root_url !== '/') {
          link = $('<a tabindex="0"></a>').attr('href', window.PXUTheme.routes.root_url + result.url);
        }

        // If result is a product
        if (result['price']) {
          function formatPrice(price) {
            if (window.PXUTheme.currency.display_format === 'money_with_currency_format') {
              return `<span class="money">${window.PXUTheme.currency.symbol}${price} ${window.PXUTheme.currency.iso_code}</span>`;
            } else {
              return `<span class="money">${window.PXUTheme.currency.symbol}${price}</span>`;
            }
          }

          if (result.available === true) {
            const maxComparePrice = parseFloat(result.compare_at_price_max);
            const minComparePrice = parseFloat(result.compare_at_price_min);
            const minPrice = parseFloat(result.price_min);
            const maxPrice = parseFloat(result.price_max);
            const resultPrice = parseFloat(result.price);

            if (maxComparePrice > maxPrice || minComparePrice > minPrice ) {
              var itemPrice = formatPrice(result.price) + ' <span class="was_price">' + formatPrice(result.compare_at_price_min) + '</span>';
            } else {
            if (resultPrice > 0) {
                if (minPrice != maxPrice) {
                  var itemPrice = window.PXUTheme.translation.from_text + ' ' + formatPrice(result.price);
                } else {
                  var itemPrice = formatPrice(result.price);
                }
              } else {
                var itemPrice = window.PXUTheme.theme_settings.free_text;
              }
            }
          } else {
            var itemPrice = window.PXUTheme.translation.sold_out_text;
          }

          // If result has an image
          if (result['image']) {
            link.append('<div class="thumbnail"><img class="lazyload transition--' + window.PXUTheme.theme_settings.image_loading_style + '" src="' + window.utils.addImageDimension(result['image'], '_300x') + '" /></div>');
          }

          link.append('<div class="search-title">' + result.title + '<br><span class="item-pricing price">'+ itemPrice +'</span></div>');

          // If result is an article
        } else if(result['summary_html']) {
          if(result.image != 'NULL') {
            link.append('<div class="thumbnail"><img class="lazyload transition--' +  window.PXUTheme.theme_settings.image_loading_style + '" src="' + window.utils.addImageDimension(result['image'], '_300x') + '" /></div>');
          }
          link.append('<div class="search-title">' + result.title + '<br><span class="item-description">'+ result.summary_html.replace(/(<([^>]+)>)/ig,"").slice(0, 25) +' </span></div>');

          // If result is a page
        } else if(result['published_at']) {
          link.append('<div class="search-title">' + result.title + '<br><span class="item-description">'+ result.body.replace(/(<([^>]+)>)/ig,"").slice(0, 25) +' </span></div>');

        }

        // Wrap link and append to list
        link.wrap('<li class="item-result"></li>');
        $resultsList.append(link.parent());
      });

      $resultsList.prepend('<li class="all-results"><span class="search-title see-all"><a href="' + this.vars.searchPath + '?type=' + searchType + '&q=' + this.vars.term + '*"><span>' + window.PXUTheme.translation.all_results + '</span><span class="icon-right-arrow"></span></a></span></li>');

      if (window.PXUTheme.currency.show_multiple_currencies || window.PXUTheme.currency.native_multi_currency) {
        window.currencyConverter.init();
      }

      $resultsList.parents('.search__results-wrapper').addClass('results-found');

    } else {
      // if no results
      var noResults = '<li class="item-result"><span class="no-results search-title">' + window.PXUTheme.translation.no_results + '</span></li>';
      $resultsList.append(noResults);
      $resultsList.parents('.search__results-wrapper').removeClass('results-found');
    }

    $resultsList.show();
  },
  showMobileSearch: function(formType, position) {
    $('body').css('max-height', window.innerHeight);

    $('.mobile-search').fadeIn(200);

    if(/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      $('.mobile-search input#q').focus();
    } else {
      //Set delay to ensure focus triggers on android
      setTimeout(function() {
        $('.mobile-search input#q').focus();
      }, 205);
    }

    document.body.style.position = 'fixed';
    document.body.style.top = '-' + position + 'px';
    $('.mobile-search').css('top', position)

    var searchHeight = window.innerHeight - 60; //Full screen height - form height
    $('.mobile-search .search__results-wrapper').css('max-height', searchHeight)

    if (formType) {
      $('.mobile-search [name="type"]').val(formType);
    } else {
      $('.mobile-search [name="type"]').val(window.PXUTheme.theme_settings.search_option);
    }

    $('.search-form .close-search').on('click touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.searchAutocomplete.hideMobileSearch(position);
      $('[data-autocomplete-true] .search__results-wrapper').hide().removeClass('results-found');
    });

    $('.search-form .submit-search').on('click touchstart', function(e) {
      $(this).parents('form').submit();
    });
  },
  hideMobileSearch: function(position) {
    $('body').css('max-height', 'none');

    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, position);

    $('.mobile-search').fadeOut(200);
    $('.mobile-search [name="q"]').val('');

    $('body').off('focus', '.search-form .close-search');
    $('body').off('focus', '.search-form .submit-search');
  },
  unload: function() {
    $('body').off('focus', '[data-autocomplete-true] input');
    $('input[name="q"]').off();
    $('[data-dropdown-rel="search"], [data-autocomplete-true] input').off();
    $('.search__results-wrapper').remove();
  }
}

/*============================================================================
  Sidebar filter on collection pages
==============================================================================*/

window.collectionSidebarFilter = {
  init: function(){

    $('.filter-active-tag input:checked').parents('.filter-active-tag').siblings('.filter-all-tags').hide();

    const openActiveFilters = () => {
      const sidebar = document.querySelector('[data-sidebar]');

      if (!sidebar) return;

      const sidebarBlocks = sidebar.querySelectorAll('[data-sidebar-block]');

      if (!window.PXUTheme.media_queries.medium.matches) {
        sidebarBlocks.forEach(block => {
          if (block.querySelector('[data-active-legacy-filter]')) {
            block.open = true;
          }
        });
      }
    }

    openActiveFilters();

    //Hide filters if types or vendors is in URL (can't be combined)
    if ($.url(2) === 'types' || $.url(2) === 'vendors'){
      $('.sidebar__collection-filter').remove();
    }

    $('.sidebar-block:empty').prev().css('border-bottom', 'none');

    //Will reload recently viewed if present
    window.recentlyViewed.init();
  },
  clearAllFilters: function(){
    $('[data-option-filter] input').prop('checked', false);
    $('[data-option-filter] input').trigger('change');

    //Will reload recently viewed if present
    window.recentlyViewed.init();
  },
  clearSelectedFilter: function(optionFilter){
    // if the sidebar tag that is being cleared matched the tag inside of the tag filter dropdown, reset the dropdown value to it's default value
    if ($('#tag_filter').length) {
      if (optionFilter.find('[data-option-filter] input').val() === $('#tag_filter option:selected ').val().substr($('#tag_filter option:selected ').val().lastIndexOf('/') + 1)) {
        $('#tag_filter').val($('#tag_filter option:first').val())
      }
    }

    optionFilter.find('[data-option-filter] input').prop('checked', false);
    optionFilter.find('[data-option-filter] input').trigger('change');

    //Will reload recently viewed if present
    window.recentlyViewed.init();
  }
}

window.sidebarAccordions = {
  init: function() {
    const sidebar = document.querySelector('[data-sidebar]');

    if (!sidebar) return;

    const sidebarBlocks = sidebar.querySelectorAll('[data-sidebar-block]');
    const facetedFilterForm = sidebar.querySelector('[data-faceted-filter-form]');

    const allowToggleOnDesktop = sidebar.dataset.sidebarAllowToggle === 'true';

    const closeAll = () => sidebarBlocks.forEach(block => { block.open = false; });
    const openAll = () => sidebarBlocks.forEach(block => { block.open = true; });

    let wasMobileLastResize = false;

    const setState = () => {
      if (window.PXUTheme.media_queries.medium.matches) {
        if (!wasMobileLastResize) {
          closeAll();
        }
        wasMobileLastResize = true;
      } else {
        if (!allowToggleOnDesktop) {
          openAll();
        }
        wasMobileLastResize = false;
      }
    };

    setState();

    window.addEventListener('resize', setState);

    // Faceted filtering

    if (facetedFilterForm) {
      // Submit the faceted filtering form when selecting a checkbox
      facetedFilterForm.addEventListener('keypress', e => {
        if (e.target.classList.contains('faceted-filter-group-display__list-item-input')) {
          if (event.keyCode == 13) {
            if (e.target.checked) {
              e.target.checked = false;
            } else {
              e.target.checked = true;
            }
          }
        }
      });

      const sortByEl = document.querySelector('[data-sort-by]');

      facetedFilterForm.addEventListener('change', e => {
        if (e.target.type == 'number') return;
        if (sortByEl) {
          const sortValue = sortByEl.value;
          // Create new formData, set the query string, and redirect
          const formData = new FormData(facetedFilterForm);
          const queryString = new URLSearchParams(formData);
          queryString.set('sort_by', sortValue);
          window.location.search = queryString;
        } else {
          // Submit the faceted filtering form
          facetedFilterForm.submit();
        }
      });
    }

    const setOpenHeight = el => {
      el.style.setProperty('--open-height', `${el.scrollHeight}px`);
    };

    sidebarBlocks.forEach(block => {
      const summary = block.querySelector('summary');
      if (!summary) return;

      const transition = window.animations.transition({
        el: block,
        state: block.open ? 'open' : 'closed',
        stateAttribute: 'data-sidebar-block-state',
        stateChangeAttribute: 'data-sidebar-block-animation'
      });

      summary.addEventListener('click', e => {
        e.preventDefault();

        if (!window.PXUTheme.media_queries.medium.matches && !allowToggleOnDesktop) return;

        const { height: closedHeight } = summary.getBoundingClientRect();
        block.style.setProperty('--closed-height', `${closedHeight}px`);

        if (block.open) {
          block.style.setProperty('--open-height', `${block.scrollHeight}px`);
          transition.animateTo('closed').then(() => { block.open = false; });
        } else {
          block.open = true;
          transition.animateTo('open', {
            onStart: () => {
              block.style.setProperty('--open-height', `${block.scrollHeight}px`)
            }
          });
        }
      })
    })
  },
}

/*============================================================================
  Misc
==============================================================================*/
if (window.PXUTheme.theme_settings.slideshow_arrow_size == 'bold'){
  window.arrowSize = {
    x0: 10,
    x1: 40, y1: 50,
    x2: 80, y2: 50,
    x3: 50
  }
  window.svgArrowSizeLeft = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 40,100 L 80,100 L 50,50  L 80,0 L 40,0 Z" class="arrow"></path></svg>'
  window.svgArrowSizeRight = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 40,100 L 80,100 L 50,50  L 80,0 L 40,0 Z" class="arrow" transform="translate(100, 100) rotate(180) "></path></svg>'
} else if (window.PXUTheme.theme_settings.slideshow_arrow_size == 'light'){
  window.arrowSize = {
    x0: 10,
    x1: 60, y1: 50,
    x2: 62, y2: 40,
    x3: 22
  }
  window.svgArrowSizeLeft = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 62,90 L 22,50  L 62,10 L 60,0 Z" class="arrow"></path></svg>'
  window.svgArrowSizeRight = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 62,90 L 22,50  L 62,10 L 60,0 Z" class="arrow" transform="translate(100, 100) rotate(180) "></path></svg>'
} else if (window.PXUTheme.theme_settings.slideshow_arrow_size == 'regular'){
  window.arrowSize = {
    x0: 10,
    x1: 60, y1: 50,
    x2: 70, y2: 40,
    x3: 30
  }
  window.svgArrowSizeLeft = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow"></path></svg>'
  window.svgArrowSizeRight = '<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow" transform="translate(100, 100) rotate(180) "></path></svg>'
}

window.isScreenSizeLarge = function isScreenSizeLarge() {
  if (window.matchMedia( "(min-width: 1024px)" ).matches) {
    return true;
  }
}

window.utils = {
  createAccordion: function(container, tab, content){
    var $container = $(container);
    var $tab = $(container).find(tab);
    var $content = $(container).find(content);
    var specificTab = container + ' ' + tab;

    //Check to see if need to rearrange product tabs to create accordion (backwards compatible)
    if (container.indexOf(".accordion-tabs") >= 0){
      var rearrangedTabs = $.map($tab, function(v, i) { return [v, $content[i]]; });
      $container.empty();

      $.each(rearrangedTabs, function (index, value) {
        $container.append(this);
      });

      $content.removeClass('active');
      $container.find('.active').next().slideToggle();

      tab = container + '> a';
    }

    $(container).children('a').each(function(i, tab) {
      var tab = $(this);
      var tabValue = tab.attr('href'); //get tab id
      tab.attr('data-tab-value', tabValue); //set tab id in data attribute
      tab.removeAttr("href"); //remove href (to prevent url hash update)
    });

    $(container).find(tab + '.active').next().slideToggle();
    $('body').on('click', specificTab, function(e){
      e.preventDefault();
      $(this).toggleClass('active');
      $(this).next().slideToggle();
    });
  },
  mobileAccordion: function(container, tab, content){
    $container = $(container);
    $tab = $(container).find(tab);
    $content = $(container).find(content);

    $(tab + '.active').next().slideToggle();

    $('body').on('click', tab, function(e){
      e.preventDefault();
      $(this).toggleClass('active');
      $(this).next().slideToggle();
    });
  },
  mobileParentActiveAccordion: function(container, tab, content){
    $container = $(container);
    $tab = $(container).find(tab);
    $content = $(container).find(content);

    $(tab + '.active').parent().next().slideToggle();

    $('body').on('click', tab, function(e){
      e.preventDefault();
      $(this).toggleClass('active');
      $(this).parent().next().slideToggle();
    });
  },
  initializeTabs: function(){
    $('ul.tabs > li > a').attr('data-no-instant', true);
    $('body').on('click', 'ul.tabs > li > a', function(e) {
      e.preventDefault();
      var contentLocation = $(this).attr('href');
      if(contentLocation.charAt(0)=="#") {
        $('ul.tabs > li > a.active').removeClass('active');
        $(this).addClass('active');
        $(this).parents('ul.tabs').next().find(contentLocation).show().css({'display': 'block'}).addClass('active').siblings().hide().removeClass('active');
      }
    });
  },
  scrollToTop: function(element, height){
    // Check if height argument is present
    if(height != undefined) {
      $('html, body').animate({
        scrollTop: $(element).offset().top - height
      }, 1000);
    } else {
      $('html, body').animate({
        scrollTop: $(element).offset().top
      }, 1000);
    }
  },
  initializeSectionWrapper: function(){
    const firstSection = document.querySelector('.section-wrapper .shopify-section');

    if (!firstSection) return;

    window.navigationDesktopManager.initAll();

    if (firstSection.classList.contains('under-menu') && firstSection.querySelector('.full-width--true')) {
      if (!$('.header').hasClass('header-background--solid')) {
        $('.header').parent().addClass('feature_image');
        $('.header').addClass('is-absolute');
      }
      // Show the secondary logo
      if ($('.feature_image').hasClass('secondary_logo--true')){
        $('.secondary_logo--true').find('.secondary_logo').show();
        $('.secondary_logo--true').find('.primary_logo').hide();
      }
      window.headerFader.updateShouldFade(true);
    } else {
      $('.feature_image').removeClass('feature_image');
      $('.header.is-absolute').removeClass('is-absolute');
      // Hide the secondary logo
      if (!$('header.feature_image').hasClass('secondary_logo--true')){
        $('.secondary_logo--true').find('.secondary_logo').hide();
        $('.secondary_logo--true').find('.primary_logo').show();
      }
      window.headerFader.updateShouldFade(false);
    }
  },
  enableDisclosure: function() {

    var $disclosure = $('[data-disclosure]');
    var $toggle = $('[data-disclosure-toggle]');
    var $disclosureWrap = $('.disclosure__list-wrap');

    //Check if current opened menu is offscreen
    function checkOffScreen($openedToggle) {
      if($openedToggle.siblings('.disclosure__list-wrap').is(':off-right')) {
        $openedToggle.siblings('.disclosure__list-wrap').addClass('disclosure--left');
      }
    }

    function closeDisclosures(ignoreTarget, currentTarget) {
      if(ignoreTarget === true) {
        $toggle.not(currentTarget).removeClass('is-clicked');
        $toggle.not(currentTarget).attr('aria-expanded', 'false');
      } else {
        $toggle.removeClass('is-clicked');
        $toggle.attr('aria-expanded', 'false');
      }

      $disclosureWrap.removeClass('disclosure--left');
    }

    //Close menus on ESC
    $('body').on('keyup', function(e) {
      if(e.which == '27') {
        closeDisclosures();
      }
    });

    //Close menus on hoverout
    $disclosure.on('mouseleave', function(e) {
      closeDisclosures();
    });

    //On click/focus event for toggling options
    $toggle.on('mouseenter focus', function(e) {
      //Close all other menus
      closeDisclosures(true, this);

      var $target = $(e.currentTarget);
      $target.attr('aria-expanded', 'true').addClass('is-clicked');
      checkOffScreen($target);
    });

    //When tabbing through, close dropdown when tabbing out of dropdown
    $('.disclosure__button').on('focusout', function(e) {
      //Close all other menus
      if(!$(e.relatedTarget).hasClass('disclosure__button') || $(e.relatedTarget).hasClass('disclosure__toggle')) {
        closeDisclosures();
      }
    });

    //Mobile toggle logic
    $toggle.on('touchstart', function(e) {
      if (window.PXUTheme.media_queries.medium.matches || !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var $target = $(e.currentTarget);

        closeDisclosures(true, this);

        if(!$target.hasClass('is-clicked')) {
          $target.attr('aria-expanded', 'true').addClass('is-clicked');
          checkOffScreen($target);
        } else {
          $target.attr('aria-expanded', 'false').removeClass('is-clicked');
          $disclosureWrap.removeClass('disclosure--left');
        }
      }
    })

  },
  addImageDimension: function(imageUrl, size) {
    var insertPosition = imageUrl.lastIndexOf(".");
    return imageUrl.substring(0, insertPosition) + size + imageUrl.substring(insertPosition);
  },
  unload: function($target){
    $('[data-disclosure]').off();
    $('[data-disclosure-toggle]').off();
  }
}

window.sliderBlock = {
  select: function(blockId, $parentSection){
    var $blocks = $parentSection.find('.gallery-cell');
    var blockIdsArray = $blocks.map(function() {
      return String($(this).data('block-id'));
    });

    var $slider = $parentSection.find('[data-slider-id]');
    var settings = {
      slideshowTextAnimation: $slider.data('slideshow-text-animation')
    }
    var flkty = $slider.data('flickity');

    $slider.flickity('pausePlayer');

    for(var i = 0; i < blockIdsArray.length; i++){
      if(blockIdsArray[i] === blockId){
        var currentSlide = i;
        if (currentSlide !== flkty.selectedIndex){
          $slider.flickity( 'select', parseInt(currentSlide), false, true);
        }
      }
    }
  },
  deselect: function($parentSection){
    var $slider = $parentSection.find('.flexslider').data('flexslider');
    if($slider) {
      $slider.flickity('unpausePlayer');
    }
  }
}

/*============================================================================
  Quick shop
==============================================================================*/

var globalQuickShopProduct;

window.quickShop = {
  init: function(){

    //EVENT - click on quick-shop
    $('body').on('click', '.js-quick-shop-link', e => {
      e.preventDefault();

      const $currentTarget = $(e.currentTarget);

      window.productPage
        .loadQuickshop($currentTarget.data('url'))
        .then(data => {
          if (!data) { return; }
          const html = data.html;
          $('.js-quick-shop').html(html.content);

          if (!$('.fancybox-active').length) {
            $.fancybox.open($('.js-quick-shop'), {
              baseClass: `quick-shop__lightbox product-${$currentTarget.data('id')}`,
              hash: false,
              infobar : false,
              toolbar: false,
              loop: false,
              smallBtn : true,
              video: {
                autoStart: false
              },
              touch: false,
              mobile: {
                preventCaptionOverlap: false,
                toolbar: true,
                buttons: [
                  "close"
                ]
              },
              beforeLoad: () => {
                window.productPage.init();
                window.productPage.runOptionSelector($('.js-quick-shop'));
                window.accordion.init();
                videoFeature.setupVideoPlayer();
                productMedia.setupMedia();
                utils.initializeTabs();
                productPage.productSwatches();

                if (Shopify.PaymentButton) {
                  Shopify.PaymentButton.init();
                }
              },
              afterShow: (_e, instance) => {
                // Use unique identifier for the product gallery
                const { src } = instance;
                const $quickshop = $(src).find('.quick-shop');

                $quickshop.addClass('quick-shop--loaded');
                $quickshop.addClass('content-loaded');
              },
              beforeClose: (_e, instance) => {
                // Use unique identifier for the product gallery
                const { src } = instance;
                const $quickshop = $(src).find('.quick-shop');

                $quickshop.removeClass('quick-shop--loaded');
                $quickshop.removeClass('content-loaded');
              }
            });
          }
        }).catch(error => console.error(error))
    });

    $('.swatch_options label').on('click', function() {
      window.quickShop.toggleSwatchImages($(this));
    });
  },
  toggleSwatchImages: function(swatchInput) {
    var swatchImageID = $(swatchInput).data('image');
    var $quickShopElement = $(swatchInput).parents('.thumbnail').find('.image__container img');

    $quickShopElement.attr('src', swatchImageID);
    $quickShopElement.attr('srcset', swatchImageID);
  }
}

/*============================================================================
  Newsletter Popup
==============================================================================*/

window.newsletter_popup = {
  init: function(){
    var popup = window.Cookies.get('popup');
    var newsletter_popup_days = parseInt(window.PXUTheme.theme_settings.newsletter_popup_days);
    var cookie_enabled = newsletter_popup_days != 0 ? true : false;
    if (cookie_enabled && popup == 'open') {
      return false;
    } else {
      window.newsletter_popup.open();
    }
    if (cookie_enabled) {
      window.Cookies.set('popup', 'open', { expires: newsletter_popup_days, path: '', domain: '', sameSite: 'None', secure: true });
    }
  },
  open: function(){
    var newsletter_popup_seconds = parseInt(window.PXUTheme.theme_settings.newsletter_popup_seconds);

    if (window.PXUTheme.theme_settings.newsletter_popup_mobile || window.PXUTheme.media_queries.large.matches) {
      setTimeout( function() {
        $.fancybox.open($('.js-newsletter-popup'), {
          baseClass: 'newsletter__lightbox',
          hash: false,
          infobar : false,
          toolbar: false,
          loop: true,
          smallBtn : true,
          mobile: {
            preventCaptionOverlap: false,
            toolbar: true,
            buttons: [
              "close"
            ]
          }
        });
      },
      newsletter_popup_seconds * 1000);
    }
  }
}

/*============================================================================
Product media controls
==============================================================================*/

window.productMedia = {
  models: [],
  setupMedia: function() {
    var config = {
      // Default control list
      controls: [
        'zoom-in',
        'zoom-out',
        'fullscreen'
      ],
      focusOnPlay: false
    }

    $($('model-viewer', $('.js-product-gallery, .js-gallery-modal'))).each(function(index, model) {
      model = new Shopify.ModelViewerUI(model, config);
      window.productMedia.models.push(model)
    })

    $('.product-gallery__model model-viewer').on('mousedown',function(){
      window.productMedia.hideModelIcon(this);
    })
  },
  showModelIcon: function(slide) {
    $(slide).find('.button--poster, .model-icon-button-control').show();
  },
  hideModelIcon: function(slide) {
    $(slide).find('.button--poster, .model-icon-button-control').hide();
  }
}

/*============================================================================
Plyr setup
==============================================================================*/

window.videoEl = {
  playButtonIcon:'<button type="button" class="plyr__control plyr__control--overlaid" aria-label="Play, {title}" data-plyr="play"><svg class="play-icon-button-control" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M23 20V40L39 29.4248L23 20Z" fill="#323232"/></svg><span class="plyr__sr-only">Play</span></button>',
  playButton: '<button type="button" class="plyr__controls__item plyr__control" aria-label="Play, {title}" data-plyr="play"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Pause</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span></button>',
  muteButton: '<button type="button" class="plyr__controls__item plyr__control" aria-label="Mute" data-plyr="mute"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span></button>',
  progressInput: '<div class="plyr__controls__item plyr__progress__container"><div class="plyr__progress"><input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek"><progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress><span role="tooltip" class="plyr__tooltip">00:00</span></div></div>',
  volume: '<div class="plyr__controls__item plyr__volume"><input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume"></div>',
  fullscreen: '<button type="button" class="plyr__controls__item plyr__control" data-plyr="fullscreen"><svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span></button>'
}

window.videoControls = window.videoEl.playButtonIcon + '<div class="plyr__controls">' + window.videoEl.playButton + window.videoEl.progressInput + window.videoEl.muteButton + videoEl.volume + window.videoEl.fullscreen + '</div>';
window.globalVideoPlayers = [];
window.videoPlayers = [];
window.videosInRecommendedProductsPlayer;

window.videoFeature = {
  init: function() {

    this.setupVideoPlayer();
    this.setupRecommendedVideoPlayer();

  },
  setupVideoPlayer: function() {
    var productVideos = document.querySelectorAll('[data-html5-video] video, [data-youtube-video]');

    var setupVideoPlayers = Plyr.setup(productVideos, {
      controls: window.videoControls,
      ratio: this.aspect_ratio,
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: true
      },
      storage: {
        enabled: false
      }
    });

    // Moves players into global array so that we can target them for play/pause on global level
    if (window.globalVideoPlayers) {
      $.each(setupVideoPlayers, function(index, player) {
        window.globalVideoPlayers.push(player);
      })
    }

    var videoLooping = $('[data-video-loop]').data('video-loop') || false;
    $.each(setupVideoPlayers, function(index, player) {
      player.loop = videoLooping;
      window.videoPlayers.push(player);
    });

    this.setupListeners();
  },
  setupPlayerForRecentlyViewedProducts: function(video) {

    if (video) {
      var recentlyViewedProductPlayer = new Plyr(video, {
        controls: window.videoControls,
        ratio: this.aspect_ratio,
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: true
        },
        storage: {
          enabled: false
        }
      });

      if (window.videoPlayers !== null) {
        window.videoPlayers.push(recentlyViewedProductPlayer);
        this.setupListeners();
      }

    }
  },
  setupRecommendedVideoPlayer: function() {
    var videosInRecommendedProducts = document.querySelectorAll('.product-recommendations [data-html5-video] video, .product-recommendations [data-youtube-video]');

    // Only run Plyr.setup if videosInRecommendedProducts exists
    if (videosInRecommendedProducts.length > 0) {
      window.videosInRecommendedProductsPlayer = Plyr.setup(videosInRecommendedProducts, {
        controls: window.videoControls,
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: true
        },
        storage: {
          enabled: false
        }
      });
      if (window.videoPlayers !== null) {
        var combinedArray = window.videoPlayers.concat(window.videosInRecommendedProductsPlayer);
        window.videoPlayers = combinedArray;
      } else {
        window.videoPlayers = videosInRecommendedProductsPlayer;
      }
    }

    this.setupListeners();
  },
  setupListeners: function() {
    // Adds plyr video id to video wrapper
    $.each(window.videoPlayers, function(index, player) {
      var id = player.id || player.media.dataset.plyrVideoId;
      var $video;

      if (player.isHTML5) {
        $video = $(player.elements.wrapper).find('video');
        $video.attr('data-plyr-video-id', id);
      }
    })

    // When a video is playing, pause any other instances
    $.each(window.globalVideoPlayers, function(index, player) {
      player.on('play', function(event) {
        var instance = event.detail.plyr;
        $.each(window.globalVideoPlayers, function(index, player) {
          if (instance.id != player.id ) {
            player.pause();
          }
        })
      })
    })
  },
  enableVideoOnHover: function($thumbnail) {

    var $html5Video = $thumbnail.find('[data-html5-video]');
    var $youtubeVideo = $thumbnail.find('[data-youtube-video]');
    var videoID;

    if ($html5Video.length > 0) {
      videoID = $html5Video.find('[data-plyr-video-id]').data('plyr-video-id');
    } else if ($youtubeVideo.length > 0) {
      videoID = $youtubeVideo.find('iframe').attr('id');
    }

    if (videoID) {
      $.each(window.videoPlayers, function(index, player) {

        if (player.id == videoID || player.media.id == videoID) {
          player.toggleControls(false);
          player.muted = true;
          player.play();
        }
      })
    }
  },
  disableVideoOnHover: function($thumbnail) {
    var $html5Video = $thumbnail.find('[data-html5-video]');
    var $youtubeVideo = $thumbnail.find('[data-youtube-video]');
    var videoID;

    if ($html5Video.length > 0) {
      videoID = $html5Video.find('[data-plyr-video-id]').data('plyr-video-id');
    } else if ($youtubeVideo.length > 0) {
      videoID = $youtubeVideo.find('iframe').attr('id');
    }

    if (videoID) {
      $.each(window.videoPlayers, function(index, player) {
        if (player.id == videoID || player.media.id == videoID) {
          if (player.playing) {
            player.pause();
          }
        }
      })
    }
  }
}
