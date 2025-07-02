const colorBox = document.querySelector("#mainBox");
const colorButton = document.querySelector("#changeColor");
const urButtons = document.querySelector("#urButtons");
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const secondaryBoxes = document.querySelector("#secondaryBoxes");
const undoBox = document.querySelector("#undoBox");
const redoBox = document.querySelector("#redoBox");

// function that will generate random hsl color

const randomColor = () => {
    const hue = Math.floor(Math.random() * 360); // range 0-359 degrees
    const saturation = Math.floor(Math.random() * 50 + 40); // range 40 - 89
    const lightness = Math.floor(Math.random() * 50 + 30); // range 30 - 79
    const generatedColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
    return generatedColor;
}

// arrays to store the colors for undo and redo

let undoArray = [];
let redoArray = [];

let count = 0; // stores value of the color count
let currentColor; // stores the current generated color

// handle the events once change color button is clicked

colorButton.addEventListener("click", () =>{
    if (count === 0){
        currentColor = randomColor();
        colorBox.style.backgroundColor = currentColor;
        count++;
    }
    else {
        undoArray.unshift(currentColor);
        // color that was in main will be added to array
        currentColor = randomColor();
        colorBox.style.backgroundColor = currentColor;
        // main frame will show generated color
        undoBox.style.backgroundColor = undoArray[0];
        // undo frame will display that color
        redoArray = [];
        redoBox.style.backgroundColor = "transparent";
        // redo array and frame are empty
        count++;
    }
});

// undo function

const undoFunction = () => {
    if (undoArray.length > 0){
        redoArray.unshift(currentColor);
        // we added current main color to redo array 
        currentColor = undoArray.shift();
        // color is now the first color of undo array
        colorBox.style.backgroundColor = currentColor;
        undoBox.style.backgroundColor = undoArray[0];
        // undo array has first remaining color
        redoBox.style.backgroundColor = redoArray[0];
        // redo array has initial current color
    }
}

// redo function

const redoFunction = () => {
    if (redoArray.length > 0) {
        undoArray.unshift(currentColor);
        currentColor = redoArray.shift();
        // new color is first of redo array
        colorBox.style.backgroundColor = currentColor;
        // we set it to main frame
        redoBox.style.backgroundColor = redoArray[0];
        // redo will have first element of redo array
        undoBox.style.backgroundColor = undoArray[0];
        // undo first element of undo array
  }
}

// undo button functionality

undoButton.addEventListener("click", () => {
    undoFunction();
});

// redo button functionality

redoButton.addEventListener("click", () => {
    redoFunction();
});