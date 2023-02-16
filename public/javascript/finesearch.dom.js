window.addEventListener('load', () => {
    const searchToggleFilterBtn2 = document.getElementById('search-filter-toggle-btn2');
    const searchToggleApplyBtn2 = document.getElementById('search-apply-toggle-btn2');
    const advancedSearchMainContainer = document.getElementsByClassName('advanced-search-main-container');
 
  searchToggleFilterBtn2.addEventListener('click', () => {
    if (advancedSearchMainContainer[0].classList.contains('hidden')) {
      advancedSearchMainContainer[0].classList.remove('hidden')
    } else {
    advancedSearchMainContainer[0].classList.add('hidden');
    }
  })

  searchToggleApplyBtn2.addEventListener('click', () => {
    if (advancedSearchMainContainer[0].classList.contains('hidden')) {
      advancedSearchMainContainer[0].classList.remove('hidden')
    } else {
    advancedSearchMainContainer[0].classList.add('hidden');
    }
  })
  })