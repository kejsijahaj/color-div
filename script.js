let randomColor;
let colorOptions;
let undoList;
let redoList;
let counter;

colorOptions = [1,2,3,4,5,6,7,8,9,0,'a','b','c','d','e','f']; //all possibilities of rgb colors

function generateColor (colorOptions){
    let choice;
    let choiceArr = [];
    let loopCount = 0;
    // loop will pick out 6 items from my option array
    while (loopCount < 6){
        choice = colorOptions[Math.floor(Math.random()*colorOptions.length)];
        choiceArr.push(choice);
        loopCount++;
    }
    // turn to string to join the selected items
    let choiceStr = choiceArr.join("");
    // adding the # in front
    let hash = '#';
    let result = hash + choiceStr;
    return result;
}