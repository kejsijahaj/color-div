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
const undoArray = [];
const redoArray = []; 

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
    div.className = "colorElement";
    div.setAttribute("id", "colorElement");
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.draggable = true;
    return div;
};

// drag and drop

const dragAndDrop = () => {
    const draggableEl = document.querySelector("#colorElement");

    draggableEl.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain",draggableEl.id);
    });

    for (const dropZone of document.querySelector("#dropZone")){
        dropZone.addEventListener("dragover", e => {
            e.preventDefault();
            dropZone.classList.add("dropZoneOver");
        });

        dropZone.addEventListener("dragleave", e => {
            dropZone.classList.remove("dropZoneOver");
        });

        dropZone.addEventListener("drop", e => {
            e.preventDefault();
            const droppedElId = e.dataTransfer.getData("text/plain");
            const droppedEl = document.querySelector(droppedElId);

            dropZone.appendChild(droppedEl);
            dropZone.classList.remove("dropZoneOver");
        })
    }
}

// display array items

const displayArray = () => {
    clearHolders(undoHolder);
    clearHolders(redoHolder);
    const limitedUndo = undoArray.slice(0,5); // limited to
    const limitedRedo = redoArray.slice(0,5); // 5 elements
    limitedUndo.forEach(element => {
        undoHolder.appendChild(makeDivs(element));
    });
    limitedRedo.forEach(element => {
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
    redoArray.length = 0;
    count++;
    counter.textContent = count;
    applyColor(newColor);
    currentColor = newColor;
    displayArray();
    // dragAndDrop();
    });

// undo function

const undo = () => {
    if (undoArray.length === 0) return;
    redoArray.unshift(currentColor);
    currentColor = undoArray.shift();
    applyColor(currentColor);
    displayArray();
    // dragAndDrop();
}

// redo function

const redo = () => {
    if (redoArray.length === 0) return;
    undoArray.unshift(currentColor);
    currentColor = redoArray.shift();
    applyColor(currentColor);
    // redoBox.style.backgroundColor = redoArray[0];
    // undoBox.style.backgroundColor = undoArray[0];
    displayArray();
    // dragAndDrop();
}

// undo button functionality

undoButton.addEventListener("click", () => {
    undo();
});

// redo button functionality

redoButton.addEventListener("click", () => {
    redo();
});
