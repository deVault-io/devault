const navBar = document.getElementById('nav-menu');
window.onscroll = function(){
  if (window.scrollY >22){
    navBar.classList.add('scrolled')
  }else{
    navBar.classList.remove('scrolled')
  }
}

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

