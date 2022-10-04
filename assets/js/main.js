$(async function() {
    const backToTopElement = $('.back-to-top-link');
    $(window).scroll(async () => {
    if ($(document).scrollTop() <= 200){
        backToTopElement.addClass('back-to-top-link-moved');
    } else {
        backToTopElement.removeClass('back-to-top-link-moved');
    }
    });
})