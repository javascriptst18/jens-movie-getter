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
            addCount = 10; // ...else set the counter to 10
        }
        for (let i = postCounter; i < postCounter + addCount; i += 1) { // loop the posts
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
            // create the post object
            let postObject = `
        <div class="movie-container">
        <div class="movie">
        <img src="${postArray[i].poster}">
        <h2>${postArray[i].title}</h2>
        ${postArray[i].originalTitle ? '<h4>Originaltitel: ' + postArray[i].originalTitle + "</h4>" : ""}
        <p>${postArray[i].summary}</p>
        </div>
        <div class="also-liked" id="alsoLiked"><h5>Gillade du den här filmen? Då måste du kolla in dessa:</h5>
        ${alsoLiked.slice(0,2).join(' | ')}
        </div>
        </div>`;
            postsContainer.insertAdjacentHTML('beforeend', postObject); // append the post object to the DOM
        }
        postCounter = postCounter + addCount; // add to counter for pagination
    }
}

// Function for fetching the posts from the API
function fetchPosts(searchTerm) {
    $.getJSON(`https://javascriptst18.herokuapp.com/trending${searchTerm ? '?q=' + searchTerm : ""}`, function (response) {
        postArray = response;
        buttonContainer.innerHTML = "";
        arrayLength = response.length;
        if (arrayLength > 0) {
            buttonContainer.innerHTML = loadButton;
        }
        createPosts(); // run function for creating posts
    })
}

// listener for the load more posts button
document.addEventListener('click', function (e) {
    if (e.target.id === "loadButton") {
        errorMessage.innerHTML = '';
        createPosts();
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