/*!
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('body').on('click', '.page-scroll a', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Floating label headings for the contact form
$(function () {
    $("body").on("input propertychange", ".floating-label-form-group", function (e) {
        $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function () {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function () {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function () {
    $('.navbar-toggle:visible').click();
});

//reset colors
function resetColor() {
    var cols = document.getElementsByClassName('portfolio-skill-text');
    for (i = 0; i < cols.length; i++) {
        cols[i].style.color = 'white';
    }
}
//show/hide on filter click

$('#web').click(function () {
    resetColor();
    this.style.color = "#18bc9c";
    $('.ml').hide();
    $('.concept-design').hide();
    $('.intd').hide();
    $('.webd').show();

});
$('#machine').click(function () {
    resetColor();
    this.style.color = "#18bc9c";
    $('.webd').hide();
    $('.intd').hide();
    $('.concept-design').hide();
    $('.ml').show();

});
$('#concept').click(function () {
    resetColor();
    this.style.color = "#18bc9c";
    $('.ml').hide();
    $('.webd').hide();
    $('.intd').hide();
    $('.concept-design').show();


});
$('#interaction').click(function () {
    resetColor();
    this.style.color = "#18bc9c";
    $('.concept-design').hide();
    $('.ml').hide();
    $('.webd').hide();
    $('.intd').show();
});
$('#all-pro').click(function () {
    resetColor();
    this.style.color = "#18bc9c";
    $('.concept-design').show();
    $('.ml').show();
    $('.webd').show();
    $('.intd').show();
});
$('.close-modal').on('click', function () {
    //$('#video').stopVideo();
    $('.youvid')[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
});