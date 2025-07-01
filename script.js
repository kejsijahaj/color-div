const counter = document.getElementById("counter");
const colorButton = document.getElementById("colorButton");
const urButtons = document.getElementById("urButtons");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const secondaryBoxes = document.getElementById("secondaryBoxes");
const undoBox = document.getElementById("undoBox");
const redoBox = document.getElementById("redoBox");

const randomColor = () => {
    const hue = Math.floor(Math.random() * 360); // range 0-359 degrees
    const saturation = Math.floor(Math.random * 50 + 40); // range 40 - 89
    const lightness = Math.floor(Math.random * 50 + 30); // range 30 - 79
    return hue, saturation, lightness;
}

const generatedColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
const colorBox = document.getElementById("mainBox");

