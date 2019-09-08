document.addEventListener('DOMContentLoaded', function () {
    var startingComputerHand = ["K","C","C"];
    var startingHumanHand = ["S","C","C"];
    var finalChoiceNodes = {};
    var losingScore = -50;
    var winningScore = 10;
    var nodoLoco = new Node(startingComputerHand, startingHumanHand, null, "Human");
    printer(emperorMinMax(nodoLoco, true));
    console.log(finalChoiceNodes);
    function emperorMinMax(node, maximizingPlayer){
        if(checkTerminalNodeEmperor(node)){
            // Heuristic values
            if(!node.computerHand.includes("K") && node.humanHand.includes("S"))
            {
                return winningScore;
            }
            if(node.computerHand.includes("K") && node.humanHand.includes("S"))
            {
                return losingScore;
            }
            if(node.computerHand.includes("K") && !node.humanHand.includes("S"))
            {
                return winningScore;
            }
            if(node.choice.includes("S") && !node.computerHand.includes("K"))
            {
                return losingScore;
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
            else{
                return 0;
            }
        }
        if(maximizingPlayer){
            var value = -10000;
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
        if(node.choice == "S")
        {
            return true;
        }
        if(!node.computerHand.includes("K") && node.choice == "C")
        {
            return true;
        }
        if(node.choice == "S" && node.computerHand.includes("K"))
        {
            return true;
        }
        if(node.humanHand.length == 1 && node.computerHand.length == 1)
        {
            return true;
        }
        return false;
    }
    function frequency(arr, val)
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

    function slaveMinMax(node, maximizingPlayer){
        if(checkTerminalNodeEmperor(node)){
            // Heuristic values
            if(!node.computerHand.includes("K") && node.humanHand.includes("S"))
            {
                return winningScore;
            }
            if(node.computerHand.includes("K") && node.humanHand.includes("S"))
            {
                return losingScore;
            }
            if(node.computerHand.includes("K") && !node.humanHand.includes("S"))
            {
                return winningScore;
            }
            if(node.choice.includes("S") && !node.computerHand.includes("K"))
            {
                return losingScore;
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
            else{
                return 0;
            }
        }
        if(maximizingPlayer){
            var value = -10000;
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


    function printer(msg){
        document.getElementsByClassName("printer")[0].innerText = msg;
    }
});

function addCommas(){
    var val = document.getElementById("bet-amount").value.replace(",","").replace(/[A-Za-z!@#$%^&*()]/g, '');
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("bet-amount").value = val;
    console.log("VALUE: " + val);
}

class Node {
    constructor(computerHand, humanHand, choice, player) {
        this.computerHand = computerHand;
        this.probability = 0;
        this.humanHand = humanHand;
        this.choice = choice;
        this.player = player;
        if(this.player.includes("Computer"))
        {
            if(this.choice == "K")
            {
                this.computerHand.splice(this.computerHand.indexOf("K"), 1);
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
        if(this.humanHand.length == 1 && this.computerHand.length == 1)
        {
            return;
        }
        if(this.player.includes("Computer"))
        {
            if(this.humanHand.includes("S"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "S", "Human"));
            }
            if(this.humanHand.includes("C"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "C", "Human"));
            }
        }else{
            if(this.computerHand.includes("K"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "K", "Computer"));
            }
            if(this.computerHand.includes("C"))
            {
                this.children.push(new Node(this.computerHand.slice(0), this.humanHand.slice(0), "C", "Computer"));
            }
        }
    }
}