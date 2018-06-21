let postArray = [];
let arrayLength = 0;
let postCounter = 0;
let postsContainer = document.querySelector('#postsContainer');
let buttonContainer = document.querySelector('#buttonContainer');
let loadButton = `<button id="loadButton" class="load-button">Ladda fler filmer</button>`;
let form = document.querySelector("#searchForm");
let errorField = document.querySelector("#errorMessage");

function createPosts() {
    if (arrayLength < 1) {
        let errorMessage = `Hoppsan, vi hittade ingen film som matchade din sökning. Försök gärna igen!`;
        errorField.insertAdjacentHTML('beforeend', errorMessage);
    } else {
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
}

function fetchPosts(searchTerm) {
    $.getJSON(`https://javascriptst18.herokuapp.com/trending${searchTerm ? '?q=' + searchTerm : ""}`, function (response) {
        postArray = response;
        buttonContainer.innerHTML = "";
        arrayLength = response.length;
        if (arrayLength > 0) {
            buttonContainer.innerHTML = loadButton;
        }
        createPosts();
    })
}

document.addEventListener('click', function (e) {
    if (e.target.id === "loadButton") {
        errorMessage.innerHTML = '';
        createPosts();
    }
});

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