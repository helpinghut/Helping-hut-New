const left = document.querySelector('.left');
const right = document.querySelector('.right');
const slider = document.querySelector('.slider');
const images = document.querySelectorAll('.image');

let slideNumber = 0;
let slideInterval;

// Function to calculate the current width of the frame
function updateSlideWidth() {
    return document.querySelector('.frame').clientWidth;
}

function moveToSlide(slideIndex) {
    const slideWidth = updateSlideWidth();
    slider.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
}

// Function to move to the next slide
function nextSlide() {
    if (slideNumber < images.length - 1) {
        slideNumber++;
    } else {
        slideNumber = 0;
    }
    moveToSlide(slideNumber);
}

// Start the automatic sliding
function startSlideInterval() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 2000); // Adjust interval duration as needed (in milliseconds)
}

// Stop the automatic sliding
function stopSlideInterval() {
    clearInterval(slideInterval);
}

// Event listeners for manual slide navigation
right.addEventListener('click', () => {
    nextSlide();
});

left.addEventListener('click', () => {
    if (slideNumber > 0) {
        slideNumber--;
    } else {
        slideNumber = images.length - 1;
    }
    moveToSlide(slideNumber);
});

// Update the slide position when the window is resized
window.addEventListener('resize', () => {
    moveToSlide(slideNumber);
});

// Start automatic sliding when the page loads
startSlideInterval();

// Optionally, stop automatic sliding when the user interacts with navigation
right.addEventListener('mouseover', stopSlideInterval);
right.addEventListener('mouseout', startSlideInterval);
left.addEventListener('mouseover', stopSlideInterval);
left.addEventListener('mouseout', startSlideInterval);
