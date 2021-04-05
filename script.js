const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = `${BASE_URL}api/v1/users/`

// DOMs
const navbar = document.querySelector('.navbar')
const panel = document.querySelector('#panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('.form-inline')

// global constants & variables
const USERS_PER_PAGE = 12
const users = []
const favorites = JSON.parse(localStorage.getItem('favorite_user')) || []
let searchResults = []
let isFavoritePage = false
let currentPage = 1

// EventListeners
panel.addEventListener('click', onPanelClicked)
navbar.addEventListener('click', onNavbarClicked)
paginator.addEventListener('click', onPaginatorClicked)
searchForm.addEventListener('submit', onSearchSubmitted)

// Init: get data
axios.get(INDEX_URL)
  .then(res => {
    users.push(...res.data.results)
    renderPaginator(users)
    renderUsersCard(getUsersByPage(currentPage))
  })
  .catch(err => console.log(err))

// Functions
function renderUsersCard(users) {
  const rawContent = users.map(user => `
  <div class="col-md-3">
    <div class="mb-3">
      <div class="card">
        <h3 class="text-right mr-2 mt-2 mb-0 text-danger"><i class="${isFavorite(user.id)}" id="btn-favorite" data-id="${user.id}"></i></h3>
        <div class="m-0 d-flex flex-column align-items-center">
          <a class="mb-2" role="button" data-toggle="modal" data-target="#user-modal">
            <img src="${user.avatar}" class="user-avatar  rounded-circle" alt="" data-id="${user.id}">
          </a>
          <h4 class="user-name p-2">${user.name}</h4>
        </div>
      </div>
    </div>
  </div>
  `
  )

  panel.innerHTML = rawContent.join('\n')
  if (!isFavoritePage) showCurrentPage()
}

function renderPaginator(data) {
  let rowContent = ''
  const pageNum = Math.ceil(data.length / USERS_PER_PAGE)
  if (pageNum > 1 && !isFavoritePage) {
    for (let i = 1; i <= pageNum; i++) {
      rowContent += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
    }
  }

  paginator.innerHTML = rowContent
}

function renderUserModal(target) {
  const modal = {
    img: document.querySelector('#modal-img'),
    title: document.querySelector('.modal-title'),
    email: document.querySelector('#modal-gender'),
    age: document.querySelector('#modal-age'),
    region: document.querySelector('#modal-region'),
    birthday: document.querySelector('#modal-birthday')
  }
  const user = users.find((user) => user.id === Number(target.dataset.id))
  modal.img.src = user.avatar
  modal.title.textContent = `${user.name} ${user.surname}`
  modal.age.textContent = `Age: ${user.age}`
  modal.region.textContent = `Region: ${user.region}`
  modal.birthday.textContent = `Birthday: ${user.birthday}`
  modal.email.textContent = `Email: ${user.email}`
}

/*
Event listeners' function
*/
function onPanelClicked(event) {
  const target = event.target
  // Click on the avatar to show the information
  if (target.matches('.user-avatar')) {
    renderUserModal(target)
  }

  // Click on the heart-icon, add this user to favorite
  if (target.matches('#btn-favorite')) {
    toggleFavorite(target)
    // addToFavorite(target.dataset.id)
  }
}

function onNavbarClicked(event) {
  const target = event.target
  const favoritePage = document.querySelector('#favorite-page')

  searchResults = []

  if (target.matches('#home-page')) {
    isFavoritePage = false
    pageChanged(users)
    favoritePage.classList.remove('active')
    searchForm.classList.remove('d-none')
  }

  if (target.matches('#favorite-page')) {
    isFavoritePage = true
    pageChanged(favorites)
    favoritePage.classList.add('active')
    searchForm.classList.add('d-none')
  }
}

function onSearchSubmitted(event) {
  event.preventDefault()

  const searchValue = event.target[0].value.trim().toLowerCase()
  // If the searchValue is '', then return.
  if (!searchValue) return
  searchResults = users.filter(user => user.name.toLowerCase().includes(searchValue))
  pageChanged(searchResults)
  renderUsersCard(getUsersByPage(currentPage))
  // Clear the value
  event.target[0].value = ''
}

function onPaginatorClicked(event) {
  const target = event.target
  // Make sure that clicking the <a> tag to do something
  if (target.tagName !== 'A') return

  currentPage = Number(target.dataset.page)
  renderUsersCard(getUsersByPage(currentPage))
}
/*
Some functions about favorites
*/
function toggleFavorite(target) {
  if (target.matches('.far')) {
    target.classList = 'fas fa-heart'
    addToFavorite(target.dataset.id)
  } else if (target.matches('.fas')) {
    target.classList = 'far fa-heart'
    removeFromFavorite(target.dataset.id)
  }
}

function addToFavorite(id) {
  const addedUser = users.find((user) => user.id === Number(id))
  favorites.push(addedUser)
  localStorage.setItem('favorite_user',JSON.stringify(favorites))
}

function removeFromFavorite(id) {
  const removedIdx = favorites.findIndex((user) => user.id === Number(id))
  if (removedIdx === -1) return
  favorites.splice(removedIdx, 1)
  if (isFavoritePage) renderUsersCard(favorites)
  localStorage.setItem('favorite_user', JSON.stringify(favorites))
}

/*
Other functions
*/

// This function is triggered when changing between Home-page, search-result-page, and favorite-page
function pageChanged(targetPage) {
  currentPage = 1
  renderPaginator(targetPage)
  renderUsersCard(getUsersByPage(currentPage))
}

function getUsersByPage(page) {
  if (isFavoritePage) return favorites
  const startIndex = (page - 1) * USERS_PER_PAGE
  const view = searchResults.length ? searchResults : users
  return view.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function isFavorite(id) {
  if (favorites.some((user) => user.id === id)) {
    return 'fas fa-heart'
  }
  return 'far fa-heart'
}

function showCurrentPage() {
  // To use forEach method, use '...' to change HTMLCollection into an array.
  [...paginator.children].forEach((page, index) => {
    if (index + 1 === currentPage) {
      page.classList.add('active')
    } else {
      page.classList.remove('active')
    }
  })
}