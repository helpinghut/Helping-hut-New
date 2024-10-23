//swiper
document.addEventListener('DOMContentLoaded', () => {
  const left = document.querySelector('.lef');
  const right = document.querySelector('.righ');
  const slider = document.querySelector('.aboutcards');
  const swiper = document.querySelectorAll('.swipe');

  if (!left || !right || !slider || swiper.length === 0) {
      console.error("One or more DOM elements were not found.");
      return;
  }

  let slideNumber = 0;

  // Function to calculate the current width of the frame
  function updateSlideWidth() {
      const frame = document.querySelector('.frame');
      return frame ? frame.clientWidth : 0;
  }

  function moveToSlide(slideIndex) {
      const slideWidth = updateSlideWidth();
      if (slideWidth > 0) {
          slider.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
      } else {
          console.error("Slide width is zero.");
      }
  }

  right.addEventListener('click', () => {
      if (slideNumber < swiper.length - 1) {
          slideNumber++;
      } else {
          slideNumber = 0;
      }
      moveToSlide(slideNumber);
  });

  left.addEventListener('click', () => {
      if (slideNumber > 0) {
          slideNumber--;
      } else {
          slideNumber = swiper.length - 1;
      }
      moveToSlide(slideNumber);
  });

  // Update the slide position when the window is resized
  window.addEventListener('resize', () => {
      moveToSlide(slideNumber);
  });
});






//another
document.addEventListener('DOMContentLoaded', function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slidercommon');
    const totalSlides = slides.length;
  
    function showSlide(n) {
      slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === n) {
          slide.classList.add('active');
         
        }
      });
    }
  
    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }
  
    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    }
  
    // Automatic slide change interval
    const slideInterval = setInterval(nextSlide, 5000);
  
    // Add event listeners for navigation buttons
    document.getElementById('nextBtn').addEventListener('click', function() {
      clearInterval(slideInterval); // Clear the interval to prevent overlap
      nextSlide();
    });
    document.getElementById('prevBtn').addEventListener('click', function() {
      clearInterval(slideInterval); // Clear the interval to prevent overlap
      prevSlide();
    });
  
    // Initial display
    showSlide(currentSlide);
  });

