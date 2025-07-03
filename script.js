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
let sourceIndex = null;
let sourceList = null;
let draggedColor = null;

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

// make color elements

const makeDivs = (color,listName) => {
    const div = document.createElement('div');
    div.className = "colorElement";
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.dataset.list = listName;
    div.draggable = true;

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);

    return div;
};

// drag and drop

const handleDragStart = (e) => {
    dragged = e.target;
    sourceList = dragged.dataset.list;
    sourceIndex = [...dragged.parentElement.children].indexOf(dragged);
    e.target.classList.add("dragging");
}

const handleDragEnd = () => {
    dragged.classList.remove("dragging");
    dragged = null;
}

const handleDragOver = (e) => {
    e.preventDefault();
    if (!dragged) return;

    const holder = e.currentTarget;
    const siblings = [...holder.querySelectorAll(".colorElement:not(.dragging)")];

    const next = siblings.find(sib => {
        const rect = sib.getBoundingClientRect();
        return e.clientY <= rect.top + rect.height / 2;
    })

    holder.insertBefore(dragged, next || null);
}

const handleDrop = (e) => {
    const holder = e.currentTarget;
    const targetList = holder === undoHolder ? "undo" : "redo";
    const targetIndex = [...holder.children].indexOf(dragged);

    updateArrays(sourceList, targetList, sourceIndex, targetIndex);
    displayArray();

    dragged = null; // clear leftovers
}

const initDragAndDrop = () => {
  [undoHolder, redoHolder].forEach(holder => {
    holder.addEventListener('dragover', handleDragOver);
    holder.addEventListener('drop',     handleDrop);
  });
}

// call it once, after the DOM is ready
initDragAndDrop();

// update arrays after drag and drop

const updateArrays = (sourceList, targetList, sourceIndex, targetIndex) => {
    const sourceArray = sourceList === "undo" ? undoArray : redoArray;
    const targetArray = targetList === "undo" ? undoArray : redoArray;

    const [movedColor] = sourceArray.splice(sourceIndex, 1);
    targetArray.splice(targetIndex, 0, movedColor);
};

// display array items

const displayArray = () => {
    clearHolders(undoHolder);
    clearHolders(redoHolder);
    const limitedUndo = undoArray.slice(0,5); // limited to
    const limitedRedo = redoArray.slice(0,5); // 5 elements
    limitedUndo.forEach(element => {
        undoHolder.appendChild(makeDivs(element,"undo"));
    });
    limitedRedo.forEach(element => {
        redoHolder.appendChild(makeDivs(element,"redo"));
    });

    undoButton.disabled = !limitedUndo.length;
    redoButton.disabled = !limitedRedo.length;
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
    });

// undo function

const undo = () => {
    if (undoArray.length === 0) return;
    redoArray.unshift(currentColor);
    currentColor = undoArray.shift();
    applyColor(currentColor);
    displayArray();
}

// redo function

const redo = () => {
    if (redoArray.length === 0) return;
    undoArray.unshift(currentColor);
    currentColor = redoArray.shift();
    applyColor(currentColor);
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

initDragAndDrop();