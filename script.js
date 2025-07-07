const colorBox = document.querySelector("#mainBox");
const colorButton = document.querySelector("#changeColor");
const counter = document.querySelector("#counter")
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const undoBox = document.querySelector("#undoBox");
const redoBox = document.querySelector("#redoBox");
const undoHolder = document.querySelector(".undoHolder");
const redoHolder = document.querySelector(".redoHolder");
const undoSidebar     = document.getElementById('undoSidebar');
const redoSidebar     = document.getElementById('redoSidebar');
const undoSidebarList = document.getElementById('undoSidebarList');
const redoSidebarList = document.getElementById('redoSidebarList');
const sidebarMask     = document.getElementById('sidebarMask');
const mqMobile = window.matchMedia('(max-width: 500px)');

let count = 0; 
let currentColor = '';
const undoArray = [];
const redoArray = []; 
let sourceIndex = null;
let sourceList = null;
let dragged = null;
let tSourceList  = null; 
let tSourceIndex = null;   
let tStartX = 0, tStartY = 0;

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

    // mouse events 

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);

    // touchscreen events
    div.addEventListener('touchstart', panelTouchStart, { passive:false }); // passive false to use prevent default

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

    dragged = null; // clean up
}

const initDragAndDrop = () => {
  [undoHolder, redoHolder].forEach(holder => {
    holder.addEventListener('dragover', handleDragOver);
    holder.addEventListener('drop',     handleDrop);
  });
}

// call it once

initDragAndDrop();

// touchscreen drag and drop


function populateSidebars() {
  if (!mqMobile.matches) return;          // nothing to do on desktop

  undoSidebarList.innerHTML = '';
  redoSidebarList.innerHTML = '';

  undoArray.forEach(c => undoSidebarList.appendChild(makeDivs(c, 'undo')));
  redoArray.forEach(c => redoSidebarList.appendChild(makeDivs(c, 'redo')));
}

function openSidebar(sidebarChoice) {
  if (sidebarChoice === 'undo') {
    redoSidebar.classList.remove('active');
    undoSidebar.classList.add('active');
  } else {
    undoSidebar.classList.remove('active');
    redoSidebar.classList.add('active');
  }
  sidebarMask.classList.add('visible');
  populateSidebars();
}

function closeSidebars() {
  undoSidebar.classList.remove('active');
  redoSidebar.classList.remove('active');
  sidebarMask.classList.remove('visible');
}
sidebarMask.addEventListener('click', closeSidebars);

// swipe to open 

let touchStartX = 0, touchStartT = 0;
const LEFT_EDGE = 25, DIST = 60,   TIME = 500;

document.addEventListener('touchstart', e => {
  if (!mqMobile.matches) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartT = Date.now();
}, { passive:true });

document.addEventListener('touchend', e => {
  if (!mqMobile.matches) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dt = Date.now() - touchStartT;
  if (dt > TIME || Math.abs(dx) < DIST) return;

  RIGHT_EDGE = window.innerWidth - LEFT_EDGE

  const fromLeft  = touchStartX < LEFT_EDGE  && dx > 0;
  const fromRight = touchStartX > RIGHT_EDGE && dx < 0;

  if (fromLeft)  openSidebar('undo');
  if (fromRight) openSidebar('redo');
}, { passive:true });

function panelTouchStart(e) {
  if (!mqMobile.matches) return;

  const touch = e.touches[0];
  dragged = e.currentTarget;              
  dragged.classList.add('dragging');

  tSourceList  = dragged.dataset.list;
  tSourceIndex = [...dragged.parentElement.children].indexOf(dragged);

  dragged.style.left = dragged.offsetLeft + 'px';
  dragged.style.top  = dragged.offsetTop  + 'px';

  tStartX = touch.clientX;
  tStartY = touch.clientY;

  document.addEventListener('touchmove', panelTouchMove, { passive:false });
  document.addEventListener('touchend',  panelTouchEnd,  { passive:false });
}

function panelTouchMove(e) {
  e.preventDefault();               
  const touch = e.touches[0];

  dragged.style.left = touch.pageX - 22.5 + 'px'; // 45/2 cause 45px is my
  dragged.style.top  = touch.pageY - 22.5 + 'px'; // element size
  const holder = tSourceList === 'undo' ? undoSidebarList : redoSidebarList;
  const siblings = [...holder.querySelectorAll('.colorElement:not(.dragging)')];

  const next = siblings.find(sib => {
    const r = sib.getBoundingClientRect();
    return touch.clientY <= r.top + r.height / 2;
  });
  holder.insertBefore(dragged, next || null);
}

function panelTouchEnd(e) {
  document.removeEventListener('touchmove', panelTouchMove);
  document.removeEventListener('touchend',  panelTouchEnd);

  const touch = e.changedTouches[0];
  const undoRect = undoSidebar.getBoundingClientRect();
  const redoRect = redoSidebar.getBoundingClientRect();

  let targetList, targetIndex;

  if (touch.clientX < undoRect.left) {               
    targetList  = 'redo';
    targetIndex = redoArray.length;                    
  } else if (touch.clientX > redoRect.right) { 
    targetList  = 'undo';
    targetIndex = undoArray.length;
  } else {
    const parentIsUndo = dragged.parentElement === undoSidebarList;
    targetList  = parentIsUndo ? 'undo' : 'redo';
    targetIndex = [...dragged.parentElement.children].indexOf(dragged);
  }
  updateArrays(tSourceList, targetList, tSourceIndex, targetIndex);

  //clean up

  dragged.classList.remove('dragging');
  dragged.removeAttribute('style');      
  dragged = null;

  populateSidebars();
  displayArray();
}

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

    populateSidebars(); 
};

// "change color" button functionality

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

// "undo button" functionality

undoButton.addEventListener("click", () => {
    undo();
});

// "redo button" functionality

redoButton.addEventListener("click", () => {
    redo();
});

// call drag & drop 

initDragAndDrop();