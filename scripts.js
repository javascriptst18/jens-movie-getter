// set up empty array for posts
let postArray = [];
// initial length of the array
let arrayLength = 0;
// prepare to count posts
let postCounter = 0;
// where to append the posts
let postsContainer = document.querySelector('#postsContainer');
// container for the load button
let buttonContainer = document.querySelector('#buttonContainer');
// create the load button
let loadButton = `<button id="loadButton" class="load-button">Ladda fler filmer</button>`;
// select the search form
let form = document.querySelector("#searchForm");
// select the field for displaying search errors
let errorField = document.querySelector("#errorMessage");
// set up array for keeping track of favorites
let favoriteArray = [];
// Check if favorites are set in local storage
if (localStorage.getItem("favorites")) {
    favoriteArray = JSON.parse(localStorage.getItem("favorites"));
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
    if (postArray[i].alsoLiked.length > 0) { // if related posts exist...
        for (let likedItem of postArray[i].alsoLiked) {
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
    let checkFavorite = favoriteArray.indexOf(postArray[i].id);
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
    let rating = Math.round(postArray[i].rating); // Get the rating integer
    for (j = 2; j <= rating; j += 2) {
        constructedHTML += `<i class="fas fa-star"></i>`;
    }
    if (rating % 2 != 0) {
        constructedHTML += `<i class="fas fa-star-half-alt"></i>`;
    }
    let remainingStars = 10 - rating;
    if (remainingStars >= 2) {
        for (k = 2; k <= 10 - rating; k += 2) {
            constructedHTML += `<i class="far fa-star"></i>`;
        }
    }
    constructedHTML += '</div>';
    return constructedHTML;
}

// Function for creating the posts
function createPosts() {
    if (arrayLength < 1) { // check if no posts was found
        let errorMessage = `Hoppsan, vi hittade ingen film som matchade din sökning. Försök gärna igen!`;
        errorField.insertAdjacentHTML('beforeend', errorMessage);
    } else {
        if ((postCounter + 10) >= arrayLength) { // if less than 10 posts left...
            addCount = arrayLength;
            document.querySelector("#loadButton").disabled = "true";
        } else {
            addCount = postCounter + 10; // ...else set the counter to 10
        }
        for (let i = postCounter; i < addCount; i += 1) { // loop the posts

            // Call function for creating related posts
            let alsoLiked = createRelatedPosts(i);

            // Set up the favorite heart
            let favoriteHeart = createFavoriteHeart(i);

            // Create the star rating
            let fiveStars = createStarRating(i);

            // Create the post object
            let postObject = `
            <div class="movie-container" data-id="${postArray[i].id}">
            <div class="movie">
            <img src="${postArray[i].poster}">
            ${favoriteHeart}
            <h2>${postArray[i].title}</h2>
            ${fiveStars}
            <p>${postArray[i].summary}</p>
            </div>
            <div class="also-liked" id="alsoLiked"><h5>Gillade du den här filmen? Då måste du kolla in dessa:</h5>
            ${alsoLiked.slice(0,2).join(' | ')}
            </div>
            </div>`;
            postsContainer.insertAdjacentHTML('beforeend', postObject); // append the post object to the DOM
        }
        postCounter = postCounter + 10; // add to counter for pagination
    }
}

// Function for fetching the posts from the API
async function fetchPosts(searchTerm) {
    const trendingMovies = await fetch(`https://javascriptst18.herokuapp.com/trending${searchTerm ? '?q=' + searchTerm : ""}`);
    const response = await trendingMovies.json();
    postArray = response;
    buttonContainer.innerHTML = "";
    arrayLength = response.length;
    if (arrayLength > 0) {
        buttonContainer.innerHTML = loadButton;
    }
    createPosts(); // run function for creating posts
}

// Function checking if post is a favorite or not
function checkFavorite(favoriteId) {
    let checkFavorite = favoriteArray.indexOf(favoriteId); // check if id exists in the array of favorites
    if (checkFavorite !== -1) { // if it does...
        favoriteArray.splice(checkFavorite, 1); // ...remove it from the array
    } else {
        favoriteArray.push(favoriteId); // else add it to the array
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
        checkFavorite(favoriteId);
        localStorage.setItem("favorites", JSON.stringify(favoriteArray)); // add the array to local storage as a string
    }
});

// listening for submit events on the form
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMessage.innerHTML = '';
    postCounter = 0;
    let inputValue = this.querySelector("#searchTerm").value;
    if (inputValue) {
        postsContainer.innerHTML = '';
        fetchPosts(inputValue);
    } else {
        postsContainer.innerHTML = '';
        fetchPosts();
    }
    this.querySelector("#searchTerm").value = "";
});


fetchPosts();