function paintStars() {
  const ratingFormContainers = document.querySelectorAll('.rating-form');
  ratingFormContainers.forEach(ratingFormContainer => {
    const userVote = parseFloat(ratingFormContainer.getAttribute('data-user-vote'));
    const stars = ratingFormContainer.querySelectorAll('.rating input[type="radio"]');
    stars.forEach(star => {
      const starValue = parseFloat(star.value);
      if (starValue <= userVote) {
        star.nextElementSibling.classList.add("voted");
      }
      if (starValue - userVote <= 0.5) {
        star.nextElementSibling.classList.add("voted");
      }
      star.addEventListener('click', function() {
        // Remove "voted" class from all stars with bigger value
        stars.forEach(otherStar => {
          const otherStarValue = parseFloat(otherStar.value);
          if (otherStarValue > starValue) {
            otherStar.nextElementSibling.classList.remove("voted");
          }
        });
      });
      star.addEventListener('mouseover', function() {
        // Remove "voted" class from all stars with bigger value
        stars.forEach(otherStar => {
          const otherStarValue = parseFloat(otherStar.value);
          if (otherStarValue > starValue) {
            otherStar.nextElementSibling.classList.remove("voted");
          }
        });
      });
      star.addEventListener('mouseout', function() {
        // Add "voted" class to stars with smaller value
        stars.forEach(otherStar => {
          const otherStarValue = parseFloat(otherStar.value);
          if (otherStarValue <= userVote) {
            otherStar.nextElementSibling.classList.add("voted");
          }
          if (otherStarValue - userVote <= 0.5) {
            star.nextElementSibling.classList.add("voted");
          }
        });
      });
    });
  });
  
  // Add margin-bottom to iframe with id "messenger-button"
  const messengerButton = document.getElementById("messenger-button");
  if (messengerButton) {
    messengerButton.style.marginBottom = "80px";
  }
}

window.addEventListener('load', paintStars);
