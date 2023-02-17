//enables the toggle button for the advanced filters in the discover view
window.addEventListener('load', () => {
    const searchToggleFilterBtn = document.getElementById('search-filter-toggle-btn');
    const searchToggleCloseBtn = document.getElementById('search-cancel-toggle-btn');
    const advancedSearchMainContainer = document.getElementsByClassName('advanced-search-main-container');

    searchToggleFilterBtn.addEventListener('click', () => {
    if (advancedSearchMainContainer[0].classList.contains('hidden')) {
      advancedSearchMainContainer[0].classList.remove('hidden')
    } else {
    advancedSearchMainContainer[0].classList.add('hidden');
    }
  })
  searchToggleCloseBtn.addEventListener('click', () => {
    if (advancedSearchMainContainer[0].classList.contains('hidden')) {
      advancedSearchMainContainer[0].classList.remove('hidden')
    } else {
    advancedSearchMainContainer[0].classList.add('hidden');
    }
  })
  })