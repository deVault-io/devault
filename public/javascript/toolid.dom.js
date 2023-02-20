function paintStars() {
  const ratingFormContainers = document.querySelectorAll('.rating-form');
  ratingFormContainers.forEach(ratingFormContainer => {
    const userVote = parseFloat(ratingFormContainer.getAttribute('data-user-vote')) +0.5;
    const stars = ratingFormContainer.querySelectorAll('.rating input[type="radio"]');
    stars.forEach(star => {
      const starValue = parseFloat(star.value);
      if (starValue <= userVote) {
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
    });
  });
}



window.addEventListener('load', paintStars);
