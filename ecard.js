var winningScore = 10000;
var totalWinnings = 0;
var startingComputerHand = ["S","C","C","C","C"];
var startingHumanHand =    ["K","C","C","C","C"];
var finalChoiceNodes = {};
var computerRole = "Slave";
var canPlay = true;
var computerCards = [];
var viableComputerCards = [0,1,2,3,4];
document.addEventListener('DOMContentLoaded', function () {   
    computerCards = document.getElementsByClassName("cardback");
});

async function playTurn(element){
    if(!canPlay) // The animations are busy playing
    {
        return;
    }
    canPlay = false;
    let playerChoice = element.id;
    let computerChoice = "";
    winningScore = parseInt(document.getElementById("bet-amount").value.replace(',',''));
    finalChoiceNodes = {};
    if(computerRole == "Slave")
    {
        var startingNode = new Node(startingComputerHand, startingHumanHand, null, "Human", 0, null);
        slaveMinMax(startingNode, true);
        if(!finalChoiceNodes.hasOwnProperty("C"))
        {
            computerChoice = "slave";
        }else
        // The path difference is significant, otherwise it will just get lost by decimals and the real choice is arbitrary
        if(Math.abs(finalChoiceNodes["C"] - finalChoiceNodes["S"]) > .01)
        {
            if(finalChoiceNodes["C"] > finalChoiceNodes["S"])
            {
                computerChoice = "citizen";
            }else{
                computerChoice = "slave";
            }
        }else{
            if(getRandomInt(2) == 0)
            {
                computerChoice = "citizen";
            }else{
                computerChoice = "slave";
            }
        }
    }else{ // Emperor role
        var startingNode = new Node(startingComputerHand, startingHumanHand, null, "Human", 0);
        emperorMinMax(startingNode, true);
        if(!finalChoiceNodes.hasOwnProperty("C"))
        {
            computerChoice = "emperor";
        }else
        if(Math.abs(finalChoiceNodes["C"] - finalChoiceNodes["K"]) > .01)
        {
            if(finalChoiceNodes["C"] > finalChoiceNodes["K"])
            {
                computerChoice = "citizen";
            }else{
                computerChoice = "emperor";
            }
        }else{
            if(getRandomInt(2) == 0)
            {
                computerChoice = "citizen";
            }else{
                computerChoice = "emperor";
            }
        }
    }
    var chosenComputerCardIndex = getRandomInt(viableComputerCards.length);
    var selectedComputerCard = computerCards[viableComputerCards[chosenComputerCardIndex]];
    flipCards(element, selectedComputerCard , computerChoice);
    viableComputerCards.splice(viableComputerCards.indexOf(viableComputerCards[chosenComputerCardIndex]),1);
    await sleep(2000);
    if(playerChoice == "emperor"){
        startingHumanHand.splice(startingHumanHand.indexOf("K"), 1);
    }
    if(playerChoice == "citizen"){
        startingHumanHand.splice(startingHumanHand.indexOf("C"), 1);
    }
    if(playerChoice == "slave"){
        startingHumanHand.splice(startingHumanHand.indexOf("S"), 1);
    }
    if(computerChoice == "emperor"){
        startingComputerHand.splice(startingComputerHand.indexOf("K"), 1);
    }
    if(computerChoice == "citizen"){
        startingComputerHand.splice(startingComputerHand.indexOf("C"), 1);
    }
    if(computerChoice == "slave"){
        startingComputerHand.splice(startingComputerHand.indexOf("S"), 1);
    }
    let startRound = false;
    if(playerChoice != "citizen" || computerChoice != "citizen") // Winning or losing round
    {
        if((playerChoice == "citizen" && computerChoice == "emperor") || (playerChoice == "slave" && computerChoice == "citizen")) // User loses vs emperor or vs citizen
        {
            document.getElementById("lose").style.display = "inherit";
            totalWinnings += -winningScore;
        }
        if(playerChoice == "emperor" && computerChoice == "slave") // User loses vs slave
        {
            document.getElementById("lose").style.display = "inherit";
            totalWinnings = totalWinnings - (5 * winningScore);
        }
        if(playerChoice == "slave" && computerChoice == "emperor") // User wins vs emperor
        {
            document.getElementById("win").style.display = "inherit";
            totalWinnings = totalWinnings + (5 * winningScore);
        }
        if(playerChoice == "emperor" && computerChoice == "citizen" || playerChoice == "citizen" && computerChoice == "slave")
        {
            document.getElementById("win").style.display = "inherit";
            totalWinnings += winningScore;
        }
        await sleep(2000);
        document.getElementById("lose").style.display = "none";
        document.getElementById("win").style.display = "none";
        startRound = true;
    }
    document.getElementById("score-value").innerText = (totalWinnings + "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    element.style.minWidth = "190px";
    element.style.minHeight = "250px";
    selectedComputerCard.style.animation = "none";
    element.style.display = "none";
    selectedComputerCard.style.display = "none";
    if(startRound)
    {
        startNextRound();
    }
    canPlay = true;
    // Uncomment this to see the considered paths!
    //console.log(finalChoiceNodes);
}
function startNextRound(){
    let playerCards = document.getElementsByClassName("card");
    for(var x = 0; x < computerCards.length; x++)
    {
        playerCards[x].style.display = "inherit";
        computerCards[x].style.display = "inherit";
    }
    viableComputerCards = [0,1,2,3,4];
    if(computerRole == "Slave") // Computer WAS playing as slave
    {
        computerRole = "Emperor";
        document.getElementById("emperor").id = "slave";
        startingComputerHand = ["K","C","C","C","C"];
        startingHumanHand = ["S","C","C","C","C"];
    }else{ // Computer WAS playing as emperor
        computerRole = "Slave";
        document.getElementById("slave").id = "emperor";
        startingComputerHand = ["S","C","C","C","C"];
        startingHumanHand = ["K","C","C","C","C"];
    }
}
function flipCards(element, selectedComputerCard, choice){
    element.style.minWidth = "220px";
    element.style.minHeight = "290px";
    element.style.boxShadow = "0px 10px 10px -6px rgba(0,0,0,0.75)";
    selectedComputerCard.style.animation = "reveal-card-" + choice + " 2s forwards"; 
}
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function slaveMinMax(node, maximizingPlayer){
    if(checkTerminalNodeSlave(node)){
        // Heuristic values
        if(!node.computerHand.includes("S") && node.humanHand.includes("K"))
        {
            return -winningScore;
        }
        if(node.computerHand.includes("S") && node.humanHand.includes("K"))
        {
            return winningScore * 5;
        }
        if(node.computerHand.includes("S") && !node.humanHand.includes("K"))
        {
            return -winningScore;
        }
        if(node.choice.includes("K") && !node.computerHand.includes("S"))
        {
            return winningScore * 5;
        }
        if(node.choice.includes("S") && !node.humanHand.includes("K"))
        {
            return -winningScore;
        }
        if(node.choice == "C" && !node.computerHand.includes("S"))
        {
            return -winningScore;
        }
        if(node.choice == "C" && !node.humanHand.includes("K"))
        {
            return -winningScore;
        }
        else{
            return 0;
        }
    }
    if(maximizingPlayer){
        var value = -10000;
        var result = 0;
        node.children.forEach(child => {
            result = slaveMinMax(child, false);
            if(node.computerHand.length == startingComputerHand.length)
            {
                finalChoiceNodes[child.choice] = result;
            }
            if(result > value)
            {
                value = result;
            }
        });
        return value;
    }else{
        var result = 0;
        node.children.forEach(child => {
            var prob = child.probability * slaveMinMax(child, true); 
            result += prob; 
        });
        return result;
    }
}

function emperorMinMax(node, maximizingPlayer){
    if(checkTerminalNodeEmperor(node)){
        // Heuristic values
        if(!node.computerHand.includes("K") && node.humanHand.includes("S"))
        {
            return winningScore;
        }
        if(node.computerHand.includes("K") && node.humanHand.includes("S"))
        {
            return winningScore * -5;
        }
        if(node.computerHand.includes("K") && !node.humanHand.includes("S"))
        {
            return winningScore;
        }
        if(node.choice.includes("S") && !node.computerHand.includes("K"))
        {
            return winningScore * -5;
        }
        if(node.choice.includes("K") && !node.humanHand.includes("S"))
        {
            return winningScore;
        }
        if(node.choice == "C" && !node.computerHand.includes("K"))
        {
            return winningScore;
        }
        if(node.choice == "C" && !node.humanHand.includes("S"))
        {
            return winningScore;
        }
    }
    if(maximizingPlayer){
        var value = Number.NEGATIVE_INFINITY;
        var result = 0;
        node.children.forEach(child => {
            result = emperorMinMax(child, false);
            if(node.computerHand.length == startingComputerHand.length)
            {
                finalChoiceNodes[child.choice] = result;
            }
            if(result > value)
            {
                value = result;
            }
        });
        return value;
    }else{
        var result = 0;
        node.children.forEach(child => {
            var prob = child.probability * emperorMinMax(child, true); 
            result += prob; 
        });
        return result;
    }
}

function checkTerminalNodeEmperor(node){
    if(node.children.length == 0)
    {
        return true;
    }
    return false;
}

function checkTerminalNodeSlave(node){
    if(node.children.length == 0){
        return true;
    }
    return false;
}

function addCommas(){
    var val = document.getElementById("bet-amount").value.replace(",","").replace(/[A-Za-z!@#$%^&*()]/g, '');
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("bet-amount").value = val;
}

class Node {
    constructor(computerHand, humanHand, choice, player, level, parent) {
        this.computerHand = computerHand;
        this.probability = 0;
        this.humanHand = humanHand;
        this.choice = choice;
        this.player = player;
        this.level = level;
        this.parent = parent;
        if(this.player.includes("Computer"))
        {
            if(this.choice == "K")
            {
                this.computerHand.splice(this.computerHand.indexOf("K"), 1);
            }
            if(this.choice == "S")
            {
                this.computerHand.splice(this.computerHand.indexOf("S"), 1);
            }
            if(this.choice == "C")
            {
                this.computerHand.splice(this.computerHand.indexOf("C"), 1);
            }
        }else{ // Human turn
            if(this.choice == "S")
            {
                this.probability = 1 / this.humanHand.length;
                this.humanHand.splice(this.humanHand.indexOf("S"), 1);
            }
            if(this.choice == "K")
            {
                this.probability = 1 / this.humanHand.length;
                this.humanHand.splice(this.humanHand.indexOf("K"), 1);
            }
            if(this.choice == "C")
            {
                this.probability = this.frequency(this.humanHand, "C") / this.humanHand.length;
                this.humanHand.splice(this.humanHand.indexOf("C"), 1);
            }
                    
        }
        this.children = [];
        this.buildChildren();
    }
    frequency(arr, val)
    {
        var freq = 0;
        arr.forEach(el => {
            if(el.includes(val))
            {
                freq++;
            }
        });
        return freq;
    }
    buildChildren(){
        if(this.humanHand.length == 0 && this.computerHand.length == 0)
        {
            return;
        }
        if(this.player.includes("Computer"))
        {
            if(this.humanHand.includes("S"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "S", "Human", this.level + 1, this));
            }
            if(this.humanHand.includes("K"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "K", "Human", this.level + 1, this));
            }
            if(this.humanHand.includes("C"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "C", "Human", this.level + 1, this));
            }
        }else{
            if(this.parent != null && !this.parent.computerHand.includes("K") && !this.parent.computerHand.includes("S"))
            {
                return;
            }
            if(this.choice == "S" || this.choice == "K")
            {
                return;
            }
            if(this.computerHand.includes("K"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "K", "Computer", this.level + 1, this));
            }
            if(this.computerHand.includes("S"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "S", "Computer", this.level + 1, this));
            }
            if(this.computerHand.includes("C"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "C", "Computer", this.level + 1, this));
            }
        }
    }
}