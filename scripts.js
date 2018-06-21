let postArray = [];
let arrayLength = 0;
let postCounter = 0;
let postsContainer = document.querySelector('#postsContainer');
let buttonContainer = document.querySelector('#buttonContainer');
let loadButton = `<button id="loadButton" class="load-button">Ladda fler filmer</button>`;
let form = document.querySelector("#searchForm");

function createPosts() {
    if ((postCounter + 10) >= arrayLength) {
        addCount = arrayLength;
        document.querySelector("#loadButton").disabled = "true";
    } else {
        addCount = 10;
    }
    for (let i = postCounter; i < postCounter + addCount; i += 1) {
        let postObject = `
        <div class="movie">
        <img src="${postArray[i].poster}">
        <h2>${postArray[i].title}</h2>
        ${postArray[i].originalTitle ? '<h4>Originaltitel: ' + postArray[i].originalTitle + "</h4>" : ""}
        <p>${postArray[i].summary}</p>
        </div>`;
        postsContainer.insertAdjacentHTML('beforeend', postObject);
    }
    postCounter = postCounter + addCount;
}

function fetchPosts(searchTerm) {
    $.getJSON(`https://javascriptst18.herokuapp.com/trending${searchTerm ? '?title_like=' + searchTerm : ""}`, function (response) {
        postArray = response;
        arrayLength = response.length;
        createPosts();
    })
}

document.addEventListener('click', function (e) {
    if (e.target.id === "loadButton") {
        createPosts();
    }
});

searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    postCounter = 0;
    let inputValue = this.querySelector("#searchTerm").value;
    if (inputValue) {
        postsContainer.innerHTML = '';
        fetchPosts(inputValue);
        buttonContainer.innerHTML = loadButton;
    } else {
        postsContainer.innerHTML = '';
        fetchPosts();
        buttonContainer.innerHTML = loadButton;
    }
});