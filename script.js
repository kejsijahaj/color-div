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
let dragState = {
  sourceIndex: null,
  sourceList: null,
  draggedColor: null
};

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
    return div;
};

// drag and drop

const dragAndDrop = () => {
    const items = document.querySelectorAll(".colorElement");
    
    items.forEach(item => {
           
        // track elements being dragged

        items.addEventListener("dragstart", e => {
            const dragged = e.target;
            dragState.draggedColor = dragged.dataset.color;
            dragState.sourceList = dragged.dataset.list;
            const container = dragged.dataset.list === "undo" ? undoHolder : redoHolder;
            dragState.sourceIndex = [...container.children].indexOf(dragged);

            setTimeout(() => {
                dragged.classList.add("dragging");        
            }, 0);
        });

        item.addEventListener("dragend", () => {
            document.querySelector(".dragging")?.classList.remove("dragging");
        });
    });

    const containers = [undoHolder,redoHolder];

    // drag and drop between "lists"

    containers.forEach( container => {
        container.addEventListener("dragover", e => {
            e.preventDefault();
            const draggable = document.querySelector(".dragging");
            const siblings = [...container.querySelectorAll(".colorElement:not(.dragging)")];
            const nextSibling = siblings.find( sibling => {
            const rect = sibling.getBoundingClientRect();
            return e.clientY <= y.top + y.height / 2;
        });
            container.insertBefore(draggable, nextSibling);
        });

        container.addEventListener("drop", e => {
            const targetList = container === undoHolder ? "undo" : "redo";
            const newIndex = [...container.children].indexOf(document.querySelector(".dragging"));
            updateArrays (dragState.sourceList, targetList, dragState.sourceIndex,newIndex);
            displayArray();
            dragAndDrop();
        })
    })
};

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
    dragAndDrop();
    });

// undo function

const undo = () => {
    if (undoArray.length === 0) return;
    redoArray.unshift(currentColor);
    currentColor = undoArray.shift();
    applyColor(currentColor);
    displayArray();
    dragAndDrop();
    // console.log("undo array on undo: ", undoArray)
    // console.log("redo array on undo:", redoArray)
}

// redo function

const redo = () => {
    if (redoArray.length === 0) return;
    undoArray.unshift(currentColor);
    currentColor = redoArray.shift();
    applyColor(currentColor);
    displayArray();
    dragAndDrop();
    // console.log("undo array on redo: ", undoArray)
    // console.log("redo array on redo:", redoArray)
}

// undo button functionality

undoButton.addEventListener("click", () => {
    undo();
});

// redo button functionality

redoButton.addEventListener("click", () => {
    redo();
});
