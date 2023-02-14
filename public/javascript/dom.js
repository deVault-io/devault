

const navBar = document.getElementById('nav-menu');
window.onscroll = function(){
  if (window.scrollY >22){
    navBar.classList.add('scrolled')
  }else{
    navBar.classList.remove('scrolled')
  }
}

const btn = document.querySelector(".btn-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

const currentTheme = localStorage.getItem("theme");
if (currentTheme == "dark") {
document.body.classList.toggle("dark-theme");
} else if (currentTheme == "light") {
document.body.classList.toggle("light-theme");
}

btn.addEventListener("click", function () {
if (prefersDarkScheme.matches) {
document.body.classList.toggle("light-theme");
var theme = document.body.classList.contains("light-theme")
? "light"
: "dark";
} else {
document.body.classList.toggle("dark-theme");
var theme = document.body.classList.contains("dark-theme")
? "dark"
: "light";
}

document.querySelectorAll(".nav, .btn, .card-container").forEach(function (el) {
el.classList.remove("light-theme");
el.classList.remove("dark-theme");
el.classList.add(theme + "-theme");
});
localStorage.setItem("theme", theme);
});
$('option').mousedown(function(e) {
e.preventDefault();
var originalScrollTop = $(this).parent().scrollTop();
console.log(originalScrollTop);
$(this).prop('selected', $(this).prop('selected') ? false : true);
var self = this;
$(this).parent().focus();
setTimeout(function() {
  $(self).parent().scrollTop(originalScrollTop);
}, 0);

return false;
}); 

// const input = document.getElementById("file-upload")
// const output = document.querySelector("file-upload")
// let imagesArray = []
// input.addEventListener("change", () => {
//   const file = input.files
//   imagesArray.push(file[0])
//   displayImages()
// })
// function displayImages() {
//   let images = ""
//   imagesArray.forEach((image, index) => {
//     images += `<div class="image">
//                 <img src="${URL.createObjectURL(image)}" alt="image">
//                 <span onclick="deleteImage(${index})">&times;</span>
//               </div>`
//   })
//   output.innerHTML = images
// }
// function deleteImage(index) {
//   imagesArray.splice(index, 1)
//   displayImages()
// }

window.addEventListener('load', () => {
  const searchToggleFilterBtn = document.getElementById('search-filter-toggle-btn');
  const searchToggleFilterBtn2 = document.getElementById('search-filter-toggle-btn2');
  const searchToggleApplyBtn = document.getElementById('search-apply-toggle-btn');
  const searchToggleApplyBtn2 = document.getElementById('search-apply-toggle-btn2');
  const advancedSearchMainContainer = document.getElementsByClassName('advanced-search-main-container');
  const advancedSearchContainer = document.getElementsByClassName('advanced-search-container');
  
  searchToggleFilterBtn.addEventListener('click', () => {
  console.log('im being clicked')
  if (advancedSearchMainContainer[0].classList.contains('hidden')) {
    advancedSearchMainContainer[0].classList.remove('hidden')
  } else {
  advancedSearchMainContainer[0].classList.add('hidden');
  }
})
searchToggleFilterBtn2.addEventListener('click', () => {
  console.log('im being clicked')
  if (advancedSearchMainContainer[0].classList.contains('hidden')) {
    advancedSearchMainContainer[0].classList.remove('hidden')
  } else {
  advancedSearchMainContainer[0].classList.add('hidden');
  }
})
searchToggleApplyBtn.addEventListener('click', () => {
  console.log('im being clicked apply')
  if (advancedSearchMainContainer[0].classList.contains('hidden')) {
    advancedSearchMainContainer[0].classList.remove('hidden')
  } else {
  advancedSearchMainContainer[0].classList.add('hidden');
  }
})
searchToggleApplyBtn2.addEventListener('click', () => {
  console.log('im being clicked')
  if (advancedSearchMainContainer[0].classList.contains('hidden')) {
    advancedSearchMainContainer[0].classList.remove('hidden')
  } else {
  advancedSearchMainContainer[0].classList.add('hidden');
  }
})
})