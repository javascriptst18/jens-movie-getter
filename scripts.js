// Namespace for DOM elements
const domElements = {
    // where to append the posts
    postsContainer: document.querySelector('#postsContainer'),
    // container for the load button
    buttonContainer: document.querySelector('#buttonContainer'),
    // select the search form
    searchForm: document.querySelector("#searchForm"),
    // select the field for displaying search errors
    errorField: document.querySelector("#errorMessage"),
    // get the header
    header: document.querySelector('header'),
    // create the load button
    loadButton: `<button id="loadButton" class="load-button">Ladda fler filmer</button>`
}

// Namespace for default values
const initialStates = {
    // set up empty array for posts
    postArray: [],
    // initial length of the array
    arrayLength: 0,
    // prepare to count posts
    postCounter: 0,
    // set up array for keeping track of favorites
    favoriteArray: []
}

// Check if favorites are set in local storage
if (localStorage.getItem("favorites")) {
    initialStates.favoriteArray = JSON.parse(localStorage.getItem("favorites"));
}

// Function for checking if local storage is available
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

// Function for creating the related posts
function createRelatedPosts(i) {
    let alsoLiked = []; // set up an empty arary for the related posts
    if (initialStates.postArray[i].alsoLiked.length > 0) { // if related posts exist...
        for (let likedItem of initialStates.postArray[i].alsoLiked) {
            let link = `<a href="${likedItem.link}" target="_blank">${likedItem.title}</a>`;
            alsoLiked.push(link);
        }
    } else { // ...else display this message
        let noLikedMessage = "Vi hittade tyvärr inga relaterade filmer.";
        alsoLiked.push(noLikedMessage);
    }
    return alsoLiked;
}

// Function for setting up the favorite hearts
function createFavoriteHeart(i) {
    let checkFavorite = initialStates.favoriteArray.indexOf(initialStates.postArray[i].id);
    if (storageAvailable('localStorage') && checkFavorite !== -1) { //If local storage is available and post is a favorite...
        favoriteHeart = `<div class="favorite"><i class="far fa-heart fas"></i></div>`;
    } else if (storageAvailable('localStorage')) { // ...else
        favoriteHeart = `<div class="favorite"><i class="far fa-heart"></i></div>`;
    }
    return favoriteHeart;
}
// Function for creating the star ratings for each movie
function createStarRating(i) {
    let constructedHTML = '<div class="stars">';
    let rating = Math.round(initialStates.postArray[i].rating); // Get the rating integer
    for (j = 2; j <= rating; j += 2) { // Get number of filled stars
        constructedHTML += `<i class="fas fa-star"></i>`;
    }
    if (rating % 2 != 0) { // If there is a half star
        constructedHTML += `<i class="fas fa-star-half-alt"></i>`;
    }
    let remainingStars = 10 - rating;
    if (remainingStars >= 2) {
        for (k = 2; k <= 10 - rating; k += 2) { // If there are empty stars
            constructedHTML += `<i class="far fa-star"></i>`;
        }
    }
    constructedHTML += '</div>';
    return constructedHTML;
}

// Function for creating the posts
function createPosts() {
    if (initialStates.arrayLength < 1) { // check if no posts was found
        let errorMessage = `Hoppsan, vi hittade ingen film som matchade din sökning. Försök gärna igen!`;
        domElements.errorField.insertAdjacentHTML('beforeend', errorMessage);
    } else {
        if ((initialStates.postCounter + 10) >= initialStates.arrayLength) { // if less than 10 posts left...
            addCount = initialStates.arrayLength;
            document.querySelector("#loadButton").disabled = "true";
        } else {
            addCount = initialStates.postCounter + 10; // ...else set the counter to 10
        }
        for (let i = initialStates.postCounter; i < addCount; i += 1) { // loop the posts

            // Call function for creating related posts
            let alsoLiked = createRelatedPosts(i);

            // Set up the favorite heart
            let favoriteHeart = createFavoriteHeart(i);

            // Create the star rating
            let fiveStars = createStarRating(i);

            // Create the post object
            let postObject = `
            <div class="movie-container" data-id="${initialStates.postArray[i].id}">
            <div class="movie">
            <img src="${initialStates.postArray[i].poster}">
            ${favoriteHeart}
            <h2>${initialStates.postArray[i].title}</h2>
            ${fiveStars}
            <p>${initialStates.postArray[i].summary}</p>
            </div>
            <div class="also-liked" id="alsoLiked"><h5>Gillade du den här filmen? Då måste du kolla in dessa:</h5>
            ${alsoLiked.slice(0,2).join(' | ')}
            </div>
            </div>`;
            domElements.postsContainer.insertAdjacentHTML('beforeend', postObject); // append the post object to the DOM
        }
        initialStates.postCounter = initialStates.postCounter + 10; // add to counter for pagination
    }
}

// Function for fetching the posts from the API
async function fetchPosts(searchTerm) {
    const trendingMovies = await fetch(`https://javascriptst18.herokuapp.com/trending${searchTerm ? '?q=' + searchTerm : ""}`);
    const response = await trendingMovies.json();
    initialStates.postArray = response;
    domElements.buttonContainer.innerHTML = "";
    initialStates.arrayLength = response.length;
    if (initialStates.arrayLength > 0) {
        domElements.buttonContainer.innerHTML = domElements.loadButton;
    }
    createPosts(); // run function for creating posts
}

// Function checking if post is a favorite or not
function checkFavorite(favoriteId) {
    let checkFavorite = initialStates.favoriteArray.indexOf(favoriteId); // check if id exists in the array of favorites
    if (checkFavorite !== -1) { // if it does...
        initialStates.favoriteArray.splice(checkFavorite, 1); // ...remove it from the array
    } else {
        initialStates.favoriteArray.push(favoriteId); // else add it to the array
    }
}

// document listener
document.addEventListener('click', function (e) {
    // listener for the load more posts button
    if (e.target.id === "loadButton") {
        errorMessage.innerHTML = '';
        createPosts();
    }
    // listener for the favorite hearts
    if (e.target.classList.contains("fa-heart")) {
        e.target.classList.toggle("fas"); // toggle between filled and unfilled heart
        let favoriteId = e.target.parentElement.parentElement.parentElement.dataset.id; // get the id of the post
        // check if the post is a favorite
        checkFavorite(favoriteId);
        localStorage.setItem("favorites", JSON.stringify(initialStates.favoriteArray)); // add the array to local storage as a string
    }
});

// listening for submit events on the form
domElements.searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMessage.innerHTML = '';
    initialStates.postCounter = 0;
    let inputValue = this.querySelector("#searchTerm").value;
    if (inputValue) {
        domElements.postsContainer.innerHTML = '';
        fetchPosts(inputValue);
    } else {
        domElements.postsContainer.innerHTML = '';
        fetchPosts();
    }
    this.querySelector("#searchTerm").value = "";
});

// Function for fetching favorite posts from the API
async function fetchPostsById(ids) {
    let idString = ids.join('&id=');
    const trendingMovies = await fetch(`https://javascriptst18.herokuapp.com/trending/?id=${idString}`);
    const response = await trendingMovies.json();
    initialStates.postArray = response;
    domElements.buttonContainer.innerHTML = "";
    initialStates.arrayLength = response.length;
    if (initialStates.arrayLength > 0) {
        domElements.buttonContainer.innerHTML = domElements.loadButton;
    }
    createPosts(); // run function for creating posts
}

let favoriteLink = document.querySelector('#favoriteLink');
favoriteLink.addEventListener('click', function (e) {
    e.preventDefault();
    initialStates.postCounter = 0;
    if (localStorage.getItem("favorites")) {
        initialStates.favoriteArray = JSON.parse(localStorage.getItem("favorites"));
        if (initialStates.favoriteArray.length > 0) {
            domElements.postsContainer.innerHTML = '';
            fetchPostsById(initialStates.favoriteArray);
        } else {

            domElements.header.insertAdjacentHTML('afterend', '<div class="header-error-message">Hoppsan, du har inte valt några favoriter! Klicka på lite hjärtan så kommer du igång!</div>');
        }
    }
});


fetchPosts();