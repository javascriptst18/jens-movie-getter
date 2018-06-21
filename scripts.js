let postArray = [];
let postCounter = 0;
let postsContainer = document.querySelector('#postsContainer');
let loadButton = `<div class="button-container"><button id="loadButton" class="load-button">Ladda fler filmer</button></div>`;

function createPosts() {
    for (let i = postCounter; i < postCounter + 10; i += 1) {
        let postObject = `
        <div class="movie">
        <img src="${postArray[i].poster}">
        <h2>${postArray[i].title}</h2>
        ${postArray[i].originalTitle ? '<h4>Originaltitel: ' + postArray[i].originalTitle + "</h4>" : ""}
        <p>${postArray[i].summary}</p>
        </div>`;
        postsContainer.insertAdjacentHTML('beforeend', postObject);
    }
    postCounter = postCounter + 10;
}

$.getJSON("https://javascriptst18.herokuapp.com/trending", function (response) {
    for (let item of response) {
        postArray.push(item);
    }
    createPosts();
    postsContainer.insertAdjacentHTML('afterend', loadButton);
});

document.addEventListener('click', function (e) {
    if (e.target.id === "loadButton") {
        createPosts();
    }
})