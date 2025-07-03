const colorBox = document.querySelector("#mainBox");
const colorButton = document.querySelector("#changeColor");
const counter = document.querySelector("#counter")
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const undoBox = document.querySelector("#undoBox");
const redoBox = document.querySelector("#redoBox");
const undoHolder = document.querySelector(".undoHolder");
const redoHolder = document.querySelector(".redoHolder");

let count = 0; 
let currentColor = '';
let undoArray = [];
let redoArray = []; 

// generate color

const randomColor = () => {
    const hue = Math.floor(Math.random() * 360); // range 0-359 degrees
    const saturation = Math.floor(Math.random() * 50 + 40); // range 40 - 89
    const lightness = Math.floor(Math.random() * 50 + 30); // range 30 - 79
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

// counter contrast

const counterContrast = (color) => {
    const hsl = color.split(' ');
    let lightness = parseInt(hsl[2].replace('%)',''));
    let textLightness;
    if(lightness > 50){
        textLightness = Math.max(0, lightness - 40); // darken text
    }
    else {
        textLightness = Math.min(100, lightness + 40); // lighten text
    }
    const hue = parseInt(hsl[0].replace('hsl(',''));
    const saturation = parseInt(hsl[1].replace('%',''));
    return `hsl(${hue} ${saturation}% ${textLightness}%)`;
};

// apply colors

const applyColor = (currentColor) => {
    colorBox.style.backgroundColor = currentColor;
    counter.style.color = counterContrast(currentColor);
};

// clear holders

const clearHolders = (holder) => {
    while (holder.firstChild){
        holder.removeChild(holder.firstChild);
    }
};

// make div elements

const makeDivs = (color) => {
    const div = document.createElement('div');
    div.className = "colorCircle";
    div.style.backgroundColor = color;
    div.dataset.color = color;
    return div;
};

// display array items

const displayArray = () => {
    clearHolders(undoHolder);
    clearHolders(redoHolder);
    undoArray.forEach(element => {
        undoHolder.appendChild(makeDivs(element));
    });
    redoArray.forEach(element => {
        redoHolder.appendChild(makeDivs(element));
    });

    // undoButton.disabled = !undoArray.length;
    // redoButton.disabled = !redoArray.length;
};

// change color button functionality

colorButton.addEventListener("click", () =>{
    const newColor = randomColor();
    if(currentColor){
        undoArray.unshift(currentColor);
    }
    count++;
    counter.textContent = count;
    applyColor(newColor);
    redoBox.style.backgroundColor = redoArray[0];
    undoBox.style.backgroundColor = undoArray[0];
    currentColor = newColor;
    displayArray();
    });

// undo function

const undo = () => {
    if (undoArray.length === 0) return;
    redoArray.unshift(currentColor);
    currentColor = undoArray.shift();
    applyColor(currentColor);
    undoBox.style.backgroundColor = undoArray[0];
    redoBox.style.backgroundColor = redoArray[0];
    displayArray();
}

// redo function

const redo = () => {
    if (redoArray.length === 0) return;
    undoArray.unshift(currentColor);
    currentColor = redoArray.shift();
    applyColor(currentColor);
    redoBox.style.backgroundColor = redoArray[0];
    undoBox.style.backgroundColor = undoArray[0];
    displayArray();
}

// undo button functionality

undoButton.addEventListener("click", () => {
    undo();
});

// redo button functionality

redoButton.addEventListener("click", () => {
    redo();
});

// drag and drop within lists

// drag and drop between lists

