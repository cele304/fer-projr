let username, password;
let loginFlag = false, gameInProgress = false;
let mainGame;
let url = "https://nim-projekt.onrender.com/";
let divsArray = ["homePageDiv", "gameFormDiv", "gameDiv", "restartGameDiv", "leaveGameDiv", "rankingDiv", "rulesDiv"];


let homePageDiv = document.getElementById("homePageDiv");
let leaveGameDiv = document.getElementById("leaveGameDiv");
let gameDiv = document.getElementById("gameDiv");
let userInputForm = document.getElementById("userInputForm");
let playFirstForm = document.getElementById("playFirstForm");
let boardSizeForm = document.getElementById("boardSizeForm");
let gameFormDiv = document.getElementById("gameFormDiv");
let loginDiv = document.getElementById("loginDiv");
let optionsDiv = document.getElementById("optionsDiv");
let wrongPasswordText = document.getElementById("wrongPasswordText");
let wrongBoardSizeText = document.getElementById("wrongBoardSizeText");
let userInput = document.getElementById("userInput");
let passwordInput = document.getElementById("passwordInput");
let tableRankingDiv = document.getElementById("tableRankingDiv");
let rankingDiv = document.getElementById("rankingDiv");
let rulesDiv = document.getElementById("rulesDiv");
let showLoginDiv = document.getElementById("showLoginDiv");
let showLoginText = document.getElementById("showLoginText");
let restartGameDiv = document.getElementById("restartGameDiv");


function showFrontPage(){
    for(let i=0; i<divsArray.length; i++)
        document.getElementById(divsArray[i]).style.display = "none";
    homePageDiv.style.display = "block";
}

function showGameForm(goodPassword, goodBoardSize){
    for(let i=0; i<divsArray.length; i++)
        document.getElementById(divsArray[i]).style.display = "none";

    if(gameInProgress){
        gameDiv.style.display = "block";
        leaveGameDiv.style.display = "block";
    }

    userInputForm.reset();
    playFirstForm.reset();
    boardSizeForm.reset();
    gameFormDiv.style.display = "block";

    if(loginFlag===false){
        loginDiv.style.display = "block";
        optionsDiv.style.display = "none";
    } else {
        loginDiv.style.display = "none";
        optionsDiv.style.display = "block";
    }

    if(goodPassword)
        wrongPasswordText.style.display = "none";
    else
        wrongPasswordText.style.display = "block";

    if(goodBoardSize)
        wrongBoardSizeText.style.display = "none";
    else
        wrongBoardSizeText.style.display = "block";
}

function showRanks(){
    for(let i=0; i<divsArray.length; i++)
        document.getElementById(divsArray[i]).style.display = "none";
    rankingDiv.style.display = "block";

    let finalText =
        "<div class='rankings'>" +
        "<table>" +
        "<tr>" +
        "<th>Igrač</th>" +
        "<th>Ukupno</th>" +
        "<th>Pobjeda</th>" +
        "<th>Poraz</th>" +
        "<th>Omjer</th>" +
        "</tr>";

    for(let i=0; i<localStorage.length; i++){
        let jsonUsername = localStorage.key(i);
        let json = JSON.parse(localStorage.getItem(localStorage.key(i)));
        finalText +=
            "<tr>" +
            "<td>" + jsonUsername + "</td>" +
            "<td>" + json.games + "</td>" +
            "<td>" + json.victories + "</td>" +
            "<td>" + (json.games - json.victories) + "</td>" +
            "<td>" + ((json.victories / json.games)*100).toFixed(2) + "%" + "</td>";
        finalText += "</tr>";
    }

    finalText +=
        "</table>" +
        "</div>";

    tableRankingDiv.innerHTML = finalText;
}

function showRules(){
    for(let i=0; i<divsArray.length; i++)
        document.getElementById(divsArray[i]).style.display = "none";
    rulesDiv.style.display = "block";
}

function showGameDiv(){
    for(let i=0; i<divsArray.length; i++)
        document.getElementById(divsArray[i]).style.display = "none";
    gameDiv.style.display = "block";
}

function resetGameDiv(){
     while (gameDiv.firstChild)
        gameDiv.removeChild(gameDiv.firstChild);
}

function playGame(){
    let firstPlayer = playFirstForm.elements["playFirstButton"].value;
    let boardSize = boardSizeForm.elements["boardSizeInput"].value;

    if(boardSize%1!==0.0 || boardSize<=1 || boardSize>=7){
        showGameForm(true, false);
        return;
    }

    mainGame = new NimGame(firstPlayer, boardSize);
    mainGame.initiateGame();
}

function restartGame(){
    playGame();
}

function login(){
    username = userInput.value;
    password = passwordInput.value;

    let js_obj = {"nick": username, "pass": password};
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url+"register", true);

    xhr.onreadystatechange = function() {
        if(this.status === 200){
            showLoginDiv.style.display = "block";
            showLoginText.innerHTML = "Bok, " + username + "!";
            loginFlag=true;

            if(localStorage[username] == null)
                localStorage[username] = JSON.stringify({"victories": 0, "games": 0});
            showGameForm(true, true);
        } else if(this.status === 400)
            showGameForm(false, true);
    }
    xhr.send(JSON.stringify(js_obj));
}

function logout(){
    if(gameInProgress){
        showLoginText.innerHTML = "Igra još traje!";
        setTimeout(function(){ showLoginText.innerHTML = "Bok, " + username + "!"; }, 4000);
        return;
    }

    showLoginDiv.style.display = "none";
    loginFlag=false;
    showFrontPage();
}

function leaveGame(){
    mainGame.leave();
}

function Board(x, y){
    this.boardQuantityArray = [];
    this.xMax = x;
    this.yMax = y;

    this.createBoard = function(){
        this.boardDiv = Object.assign(document.createElement('div'),{id:"boardDiv"});
        this.boardDiv.className = "boardDiv";
        this.boardDiv.style.width = "" + (90 * this.xMax) + "px";
        gameDiv.appendChild(this.boardDiv);

        for(let i=0; i<this.yMax; i++){
            this.boardQuantityArray.push(i+1);
            let tempDiv = document.createElement("div");
            tempDiv.id  = "cellDiv" + i;
            tempDiv.className = "cellDiv";
            for(let j=i; j>=0; j--){
                let piece = new Piece(i, j);
                tempDiv.appendChild(piece.html);
            }
            this.boardDiv.appendChild(tempDiv);
        }
    }
}

function NimGame(firstPlayer, boardSize){
    this.firstPlayer = firstPlayer;
    this.boardSize = boardSize;

    this.initiateGame = function(){
        this.board = new Board(this.boardSize, this.boardSize);
        this.pc = new PC();
        this.moves = 0;

        gameInProgress = true;
        resetGameDiv();

        let messageH = document.createElement("h1");
        messageH.id = "messageH1";
        document.getElementById("gameDiv").appendChild(messageH);

        this.board.createBoard();
        showGameDiv();
        leaveGameDiv.style.display = "block";
        this.updateMessageDiv();

        let _this = this;
        if(this.firstPlayer==="pc")
            setTimeout(function() {_this.pc.move(); }, 1500);
    }

    this.updateMessageDiv = function(){
        if((this.moves%2===0 && this.firstPlayer==="player") || (this.moves%2!==0 && this.firstPlayer!=="player"))
            document.getElementById("messageH1").innerHTML = username;
        else
            document.getElementById("messageH1").innerHTML = "Računalo";
    }

    this.deletePiece = function(x, y){
        for(let i=y; i<this.board.boardQuantityArray[x]; i++)
            document.getElementById("piece" + x + "|" + i).className = "pieceDeleted";
        this.board.boardQuantityArray[x]=y;

        if(this.checkGameOver()===true){
            this.endGame();
            return;
        }

        this.moves++;
        if(gameInProgress===true)
            this.updateMessageDiv();

        let _this = this;
        if((this.moves%2===0 && this.firstPlayer==="pc") || (this.moves%2!==0 && this.firstPlayer!=="pc"))
            setTimeout(function() {_this.pc.move(); }, 1500);
    }

    this.checkGameOver = function(){
        for(let i=0; i<this.board.boardQuantityArray.length; i++){
            if(this.board.boardQuantityArray[i]>0)
                return false;
        }
        return true;
    }

    this.endGame = function(){
        let json = JSON.parse(localStorage[username]);
        if ((this.moves%2===0 && this.firstPlayer==="player") || (this.moves%2!==0 && this.firstPlayer!=="player")){
            json["games"]++;
            json["victories"]++;
            localStorage[username] = JSON.stringify(json);
            document.getElementById("messageH1").innerHTML = "Pobjeda!";
        } else {
            json["games"]++;
            localStorage[username] = JSON.stringify(json);
            document.getElementById("messageH1").innerHTML = "Poraz";
        }

        gameInProgress = false;
        restartGameDiv.style.display = "block";
        document.getElementById("boardDiv").style.display = "none";
        leaveGameDiv.style.display = "none";
    }

    this.leave = function(){
        let json = JSON.parse(localStorage[username]);
        json["games"]++;
        localStorage[username] = JSON.stringify(json);
        document.getElementById("messageH1").innerHTML = "Poraz";

        gameInProgress = false;
        restartGameDiv.style.display = "block";
        document.getElementById("boardDiv").style.display = "none";
        leaveGameDiv.style.display = "none";
    }
}

function PC() {
    this.move = function(){
        for(let i=0; i<mainGame.board.boardQuantityArray.length; i++){
            for(let j=0; j<mainGame.board.boardQuantityArray[i]; j++){
                let oldValue = mainGame.board.boardQuantityArray[i];
                mainGame.board.boardQuantityArray[i] = j;
                if(this.xor() !== 0)
                    mainGame.board.boardQuantityArray[i] = oldValue;
                else {
                    mainGame.board.boardQuantityArray[i] = oldValue;
                    mainGame.deletePiece(i, j);
                    return;
                }
            }
        }
        let x = Math.floor(Math.random() * mainGame.board.boardQuantityArray.length);
        while(mainGame.board.boardQuantityArray[x]===0)
            x = Math.floor(Math.random() * mainGame.board.boardQuantityArray.length);
        mainGame.deletePiece(x, mainGame.board.boardQuantityArray[x]-1);
    }

    this.xor = function(){
        let value = 0;
        for(let i=0; i<mainGame.board.boardQuantityArray.length; i++)
            value ^= mainGame.board.boardQuantityArray[i];
        return value;
    }
}

function Piece(x, y){
    this.html = document.createElement("img");
    this.html.className = "piece";
    this.html.id = "piece" + x + "|" + y;
    this.html.src = "piece.png";

    this.html.onmouseover = function(){
        if(this.className!=="pieceDeleted" && ((mainGame.moves%2===0 && mainGame.firstPlayer==="player") || (mainGame.moves%2!==0 && mainGame.firstPlayer!=="player"))){
            this.className = "pieceHovered";
            let length = this.id.length;
            let temp = this.id.indexOf("|");
            let x = parseInt(this.id.slice(5, temp));
            let y = parseInt(this.id.slice(temp+1, length));
            for(; y<mainGame.board.boardQuantityArray[x]; y++)
                document.getElementById("piece" + x + "|" + y).className = "pieceHovered";
        }
    }

    this.html.onmouseleave = function(){
        if(this.className!=="pieceDeleted" && ((mainGame.moves%2===0 && mainGame.firstPlayer==="player") || (mainGame.moves%2!==0 && mainGame.firstPlayer!=="player"))){
            this.className = "piece";
            let length = this.id.length;
            let temp = this.id.indexOf("|");
            let x = parseInt(this.id.slice(5, temp));
            let y = parseInt(this.id.slice(temp+1, length));
            for(; y<mainGame.board.boardQuantityArray[x]; y++)
                document.getElementById("piece" + x + "|" + y).className = "piece";
        }
    }

    this.html.onclick = function(){
        if(this.className!=="pieceDeleted" && ((mainGame.moves%2===0 && mainGame.firstPlayer==="player") || (mainGame.moves%2!==0 && mainGame.firstPlayer!=="player"))){
            this.deletePiece();
        }
    }

    this.html.deletePiece = function(){
        let length = this.id.length;
        let temp = this.id.indexOf("|");
        let x = parseInt(this.id.slice(5, temp));
        let y = parseInt(this.id.slice(temp + 1, length));
        mainGame.deletePiece(x, y);
    }
}