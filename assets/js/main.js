document.addEventListener("scroll", (event) => {
    const backToTopElement = document.querySelector('.back-to-top-link');
    if (window.scrollY <= 200) backToTopElement.classList.add('back-to-top-link-moved');
    else backToTopElement.classList.remove('back-to-top-link-moved');
});