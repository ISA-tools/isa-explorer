/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */

var Transition = {};

var bodyEl = document.body,
    docElem = window.document.documentElement,
    support = {transitions: Modernizr.csstransitions},
// transition end event name
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    },
    transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
    onEndTransition = function (el, callback) {
        var onEndCallbackFn = function (ev) {
            if (support.transitions) {
                if (ev.target != this) return;
                this.removeEventListener(transEndEventName, onEndCallbackFn);
            }
            if (callback && typeof callback === 'function') {
                callback.call(this);
            }
        };
        if (support.transitions) {
            el.addEventListener(transEndEventName, onEndCallbackFn);
        }
        else {
            onEndCallbackFn();
        }
    },
    gridEl = document.getElementById('isatab_list'),
    sidebarEl = document.getElementById('sidebar'),
    gridItemsContainer = gridEl.querySelector('section.grid'),
    contentItemsContainer = gridEl.querySelector('section.content'),
    gridItems = gridItemsContainer.querySelectorAll('.submission_item'),
    contentItem = contentItemsContainer.querySelectorAll('.content__item'),
    closeCtrl = contentItemsContainer.querySelector('.close-button'),
    current = -1,
    lockScroll = false, xscroll, yscroll,
    isAnimating = false,
    menuCtrl = document.getElementById('menu-toggle'),
    menuCloseCtrl = sidebarEl.querySelector('.close-button');


/**
 * gets the viewport width and height
 * based on http://responsejs.com/labs/dimensions/
 */
Transition.functions = {

    getViewport: function (axis) {
        var client, inner;
        if (axis === 'x') {
            client = docElem['clientWidth'];
            inner = window['innerWidth'];
        }
        else if (axis === 'y') {
            client = docElem['clientHeight'];
            inner = window['innerHeight'];
        }

        return client < inner ? inner : client;
    },


    scrollX: function () {
        return window.pageXOffset || docElem.scrollLeft;
    },
    scrollY: function () {
        return window.pageYOffset || docElem.scrollTop;
    },

    init: function () {
        gridEl = document.getElementById('isatab_list');
        gridItemsContainer = gridEl.querySelector('section.grid');
        contentItemsContainer = gridEl.querySelector('section.content');
        gridItems = gridItemsContainer.querySelectorAll('.submission_item');
        contentItem = contentItemsContainer.querySelectorAll('.content__item');

        Transition.functions.initEvents();
    },

    initEvents: function () {

        $(".submission_item").each(function (pos, item) {
            // grid item click event
            $(item).bind('click', function (ev) {

                ev.preventDefault();
                if (isAnimating || current === pos) {
                    return false;
                }
                isAnimating = true;
                // index of current item
                current = pos;
                // simulate loading time..
                $(item).addClass('grid__item--loading');

                var data_location = $(item).attr("data-location");

                var source = $("#content_template").html();
                var template = Handlebars.compile(source);
                var html = template({});

                $("#isa-content").html(html);


                ISATabViewer.rendering.render_isatab_from_file(data_location, "#investigation_file", function () {
                    $(item).addClass('grid__item--animate');
                    contentItem = contentItemsContainer.querySelectorAll('.content__item');
                    Transition.functions.loadContent(item);
                });

            });
        });

        closeCtrl.addEventListener('click', function () {
            // hide content
            Transition.functions.hideContent();
        });

        // keyboard esc - hide content
        document.addEventListener('keydown', function (ev) {
            if (!isAnimating && current !== -1) {
                var keyCode = ev.keyCode || ev.which;
                if (keyCode === 27) {
                    ev.preventDefault();
                    if ("activeElement" in document)
                        document.activeElement.blur();
                    Transition.functions.hideContent();
                }
            }
        });

        // hamburger menu button (mobile) and close cross
        menuCtrl.addEventListener('click', function () {
            if (!$(sidebarEl).hasClass('sidebar--open')) {
                $(sidebarEl).addClass('sidebar--open');
            }
        });

        menuCloseCtrl.addEventListener('click', function () {
            if ($(sidebarEl).hasClass('sidebar--open')) {
                $(sidebarEl).removeClass('sidebar--open');
            }
        });
    },

    loadContent: function (item) {
        // add expanding element/placeholder
        var dummy = document.createElement('div');
        dummy.className = 'placeholder';

        // set the width/height and position
        dummy.style.WebkitTransform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth / gridItemsContainer.offsetWidth + ',' + item.offsetHeight / Transition.functions.getViewport('y') + ',1)';
        dummy.style.transform = 'translate3d(' + (item.offsetLeft - 5) + 'px, ' + (item.offsetTop - 5) + 'px, 0px) scale3d(' + item.offsetWidth / gridItemsContainer.offsetWidth + ',' + item.offsetHeight / Transition.functions.getViewport('y') + ',1)';

        // add transition class
        $(dummy).addClass('placeholder--trans-in');

        // insert it after all the grid items
        gridItemsContainer.appendChild(dummy);

        // body overlay
        $(bodyEl).addClass('view-single');

        setTimeout(function () {
            // expands the placeholder
            dummy.style.WebkitTransform = 'translate3d(-5px, ' + (Transition.functions.scrollY() - 5) + 'px, 0px)';
            dummy.style.transform = 'translate3d(-5px, ' + (Transition.functions.scrollY() - 5) + 'px, 0px)';
            // disallow scroll
            window.addEventListener('scroll', Transition.functions.noscroll);
        }, 25);

        onEndTransition(dummy, function () {
            // add transition class
            $(dummy).removeClass('placeholder--trans-in');
            $(dummy).addClass('placeholder--trans-out');

            // position the content container
            contentItemsContainer.style.top = Transition.functions.scrollY() + 'px';
            // show the main content container
            $(contentItemsContainer).addClass('content--show');
            // show content item:

            $(contentItem).addClass('content__item--show');
            // show close control
            $(closeCtrl).addClass('close-button--show');

            // sets overflow hidden to the body and allows the switch to the content scroll
            $(bodyEl).addClass('noscroll');
            isAnimating = false;
        });
    },

    hideContent: function () {
        var gridItem = gridItems[current];

        $(contentItem).removeClass('content__item--show');
        $(contentItemsContainer).removeClass('content--show');
        $(closeCtrl).removeClass('close-button--show');
        $(bodyEl).removeClass('view-single');


        setTimeout(function () {
            var dummy = gridItemsContainer.querySelector('.placeholder');

            $(bodyEl).removeClass('noscroll');

            dummy.style.WebkitTransform = 'translate3d(' + gridItem.offsetLeft + 'px, ' + gridItem.offsetTop + 'px, 0px) scale3d(' + gridItem.offsetWidth / gridItemsContainer.offsetWidth + ',' + gridItem.offsetHeight / Transition.functions.getViewport('y') + ',1)';
            dummy.style.transform = 'translate3d(' + gridItem.offsetLeft + 'px, ' + gridItem.offsetTop + 'px, 0px) scale3d(' + gridItem.offsetWidth / gridItemsContainer.offsetWidth + ',' + gridItem.offsetHeight / Transition.functions.getViewport('y') + ',1)';

            onEndTransition(dummy, function () {
                // reset content scroll..
                $(contentItem).parent().scrollTop = 0;
                gridItemsContainer.removeChild(dummy);
                $(gridItem).removeClass('grid__item--loading');
                $(gridItem).removeClass('grid__item--animate');

                lockScroll = false;
                window.removeEventListener('scroll', Transition.functions.noscroll);
            });

            // reset current
            current = -1;
        }, 25);
    },

    noscroll: function () {
        if (!lockScroll) {
            lockScroll = true;
            xscroll = Transition.functions.scrollX();
            yscroll = Transition.functions.scrollY();
        }
        window.scrollTo(xscroll, yscroll);
    }

}