import { Component, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import * as PNotify from 'pnotify';
declare var jQuery: any;
@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
})
export class LayoutComponent implements AfterViewInit, AfterViewChecked {
    public constructor() {}

    public ngAfterViewInit() {
        jQuery(document).ready(function() {

            console.log('jQuery ready');
            var CURRENT_PATH = window.location.protocol + "//" + window.location.host + window.location.pathname;
            var setContentHeight = function() {
                // jQuery('#app_content').css('height', jQuery('#app_content_inner').outerHeight());
                // jQuery('.left_col').css('height', jQuery('.left_col_content').outerHeight());
                // var leftColHeight = jQuery('.left_col').outerHeight();
                // var rightColHeight = jQuery('#app_content').outerHeight() + jQuery('.top_nav').outerHeight() + jQuery('#footer').outerHeight() + 10;
                // if (leftColHeight < rightColHeight) {
                //     jQuery('.left_col').css('height', rightColHeight);
                // } else {
                //     jQuery('#app_content').css('height', leftColHeight - jQuery('.top_nav').outerHeight() - jQuery('#footer').outerHeight() - 10);
                // }
            };

            jQuery('#sidebar-menu').find('a').on('click', function(ev) {
                console.log('clicked - sidebar_menu');
                var jQueryli = jQuery(this).parent();


                jQuery('#sidebar-menu').find('li').removeClass('current-page');
                jQuery('#sidebar-menu').find('.child_menu').find('li').removeClass('active');

                if (jQueryli.is('.active')) {
                    jQueryli.removeClass('active active-sm');
                    jQuery('ul:first', jQueryli).slideUp(function() {
                        setContentHeight();
                    });
                } else {
                    // prevent closing menu if we are on child menu
                    if (!jQueryli.parent().is('.child_menu')) {
                        jQuery('#sidebar-menu').find('li').removeClass('active active-sm');
                        jQuery('#sidebar-menu').find('li ul').slideUp();
                    } else {
                        if (jQuery('body').is(".nav-sm")) {
                            jQuery('#sidebar-menu').find("li").removeClass("active active-sm");
                            jQuery('#sidebar-menu').find("li ul").slideUp();
                        }
                    }
                    jQueryli.addClass('active').addClass('current-page');

                    jQuery('ul:first', jQueryli).slideDown(function() {
                        setContentHeight();
                    });
                }
            });
            // toggle small or large menu 
            jQuery('#menu_toggle').on('click', function() {
                console.log('clicked - menu toggle');

                if (jQuery('body').hasClass('nav-md')) {
                    jQuery('#sidebar-menu').find('li.active ul').hide();
                    jQuery('#sidebar-menu').find('li.active').addClass('active-sm').removeClass('active');
                } else {
                    jQuery('#sidebar-menu').find('li.active-sm ul').show();
                    jQuery('#sidebar-menu').find('li.active-sm').addClass('active').removeClass('active-sm');
                }

                jQuery('body').toggleClass('nav-md nav-sm');

                setContentHeight();
            });

            // check active menu
            jQuery('#sidebar-menu').find('a[href="' + CURRENT_PATH + '"]').parent('li').addClass('current-page');

            jQuery('#sidebar-menu').find('a').filter(function() {
                return this.href == CURRENT_PATH;
            }).parent('li').addClass('current-page').parents('ul').slideDown(function() {
                setContentHeight();
            }).parent().addClass('active');

            setContentHeight();

            // fixed sidebar
            if (jQuery.fn.mCustomScrollbar) {
                jQuery('.menu_fixed').mCustomScrollbar({
                    autoHideScrollbar: true,
                    theme: 'minimal',
                    mouseWheel: { preventDefault: true, scrollAmount: 150 }
                });
            }
        });
    }

    public ngAfterViewChecked() {
        jQuery('.right_col').css('min-height', jQuery(window).height());

        var bodyHeight = jQuery('body').outerHeight(),
            footerHeight = jQuery('body').hasClass('footer_fixed') ? -10 : jQuery('footer').height(),
            leftColHeight = jQuery('.left_col').eq(1).height() + jQuery('.sidebar-footer').height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= jQuery('.nav_menu').height() + footerHeight;
        jQuery('.right_col').css('min-height', contentHeight);
    }
}
