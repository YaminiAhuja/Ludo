import generateDice from "./generateDice.js";
import { Player_Piece } from "./PlayerPiece.js";
import { pathArray, boarddetails, safePaths } from "../../Constants.js";

export class GameManager {
  constructor(io, room) {
    this.io = io;
    this.room = room;
    this.roomcode = room.code;
    // [ socketId, color, socket ]
    this.players = room.player.map(p => [p.socket.id, p.color, p.socket]);
    this.maxPlayers = room.maxPlayer;

    this.diceResult = 0;
    this.currentIndexTurn = 0;
    this.prevIndexTurn = null;
    this.turnArray = this.players.map(p => p[1]);
    this.turnTaken = false;
    this.gameOn = true;
    this.winnerArr = [];
    this.sixCount = [null, 0];
    this.bonus = false;
    this.pieceObj = {};
    this.initPieces();
    this.sendGameStart();
  }

  initPieces() {
    this.turnArray.forEach(color => {
      this.pieceObj[color] = [];
      for (let i = 1; i <= 4; i++) {
        this.pieceObj[color].push(
          new Player_Piece(
            color,
            `${color}-home-${i}`,           // initial position = home slot
            `${color}-home-${i}`,           // homePosition
            boarddetails[color].homePathEntry,
            `${color}${i}`,                 // id
            boarddetails[color].gameEntry,  // game entry square
            0                                // status locked
          )
        );
      }
    });
  }


  

  async sendGameStart() {
    console.log(this.players)
    await new Promise(r => setTimeout(r, 1000));
    this.io.to(this.roomcode).emit(
      "game-start",
      `Game started in ${this.roomcode}`,
      this.pieceObj
    );
      this.setTurn();
      this.setupListeners();
      this.players.forEach(([socketId, color, socket]) => {
  socket.on("quit-game", () => {
    this.handlePlayerQuit(socketId);
  });
  socket.on("disconnect", () => {
    console.log(`Player ${color} disconnected`);
    this.handlePlayerQuit(socketId);
  });

});

  }



  setupListeners() {
    const [socketId, color, socket] = this.players[this.currentIndexTurn];
      socket.removeAllListeners("dice-clicked");
      socket.once("dice-clicked", async () => {
        console.log("dice clicked by the user =>",color);
        if (!this.gameOn) return;
        if (this.turnTaken) return;                       // already rolled
        this.turnTaken = true;
        this.rollDice();

        await new Promise(r => setTimeout(r, 1000));

        const actives = this.getActivePieces();
        this.io.to(this.roomcode).emit("active-pieces", actives);

        if (this.sixCount[1] >= 3 || actives.length === 0) {
          this.callNextTurn(true);
          this.setupListeners();
        }
      
        if(actives.length ===1){
          await this.MovePieces(actives[0].id);
          if (this.gameOn) {
          // this.callNextTurn();
          console.log("setting another round");
          console.log(this.players[this.currentIndexTurn]);
          this.setupListeners();
          }
          return;
        }
    
      socket.removeAllListeners("piece-selected");
      socket.on("piece-selected", async pieceId => {
        if (!this.gameOn) return;
        if (!this.isPlayerTurn(socketId)) return;        
        if (!this.turnTaken) return;                      

        await this.MovePieces(pieceId);

        if (this.gameOn) {
          // this.callNextTurn();
          console.log("setting another round");
          console.log(this.players[this.currentIndexTurn]);
          this.setupListeners();
        }
      });
    });
  }

  isPlayerTurn(socketId) {
    return socketId === this.players[this.currentIndexTurn][0];
  }

  setTurn() {
    if (this.prevIndexTurn !== null) {
      const prevId = this.players[this.prevIndexTurn][0];
      this.io.to(prevId).emit("your-turn-ended");
    }
    const [currentId] = this.players[this.currentIndexTurn];
    this.io.to(currentId).emit("your-turn");
    this.io
      .to(this.roomcode)
      .emit("player-turn", this.turnArray[this.currentIndexTurn]);
    this.turnTaken = false;
    this.bonus = false;
  }

  rollDice() {
    this.diceResult = generateDice();
    this.io.to(this.roomcode).emit("dice-value", this.diceResult);

    const color = this.turnArray[this.currentIndexTurn];
    if (this.sixCount[0] === color && this.diceResult === 6) {
      this.sixCount[1]++;
    } else {
      this.sixCount = [color, 1];
    }
  }

  getActivePieces() {
    const color = this.turnArray[this.currentIndexTurn];
    const pieces = this.pieceObj[color];
    const path = pathArray[color];
    return pieces.filter(p => {
      return (
        (p.status === 0 && (this.diceResult === 6 || this.diceResult === 1)) ||
        (p.status === 1 &&
          path.length - path.indexOf(p.position) - 1 >= this.diceResult)
      );
    });
  }

  async MovePieces(pieceId) {
    const color = pieceId.slice(0, -1);
    const piece = this.pieceObj[color].find(p => p.id === pieceId);
    if (!piece) return;

    if (piece.status === 0) {
      piece.unlock();
      this.broadcastPieces();
      this.callNextTurn() //
      return;
    }

    const path = pathArray[color];
    for (let i = 0; i < this.diceResult; i++) {
      const idx = path.indexOf(piece.position);
      if (idx + 1 < path.length) piece.position = path[idx + 1];
      if (i === this.diceResult - 1) {
        if(piece.position === 'home'){
          this.bonus = true;
        }
        for (const opp of this.turnArray) {
          if (opp === color) continue;
          this.pieceObj[opp].forEach(p => {
            if (
              p.position === piece.position &&
              !safePaths.includes(p.position)
            ) {
              p.sentMeToBoard();
              this.bonus = true;
            }
          });
        }
      }
      await new Promise(r => setTimeout(r, 500));
      this.broadcastPieces();
    }

    this.checkGameOver();
  }

  checkGameOver() {
    let completed = 0;
    for (const color in this.pieceObj) {
      const done = this.pieceObj[color].every(p => p.position === "home");
      if (done && !this.winnerArr.includes(color)) {
        this.winnerArr.push(color);
        const [winnerId] = this.players.find(p => p[1] === color);
        this.io
          .to(this.roomcode)
          .emit("winner", `${color} has completed the game`, color,winnerId);
          this.turnArray = this.turnArray.filter((p)=>p[1]!==color)
      }
      if (done) completed++;
    }

    if (completed === this.maxPlayers-1) {
      this.gameOn = false;
      this.io.to(this.roomcode).emit("game-over", this.winnerArr);
    }
    else{
      this.callNextTurn();
    }
  }

  callNextTurn(skipSixCheck = false) {
    if (this.diceResult === 6 && !skipSixCheck || (this.bonus)) 
        {   this.turnTaken = false;
            this.bonus = false;
            return
        };
    this.prevIndexTurn = this.currentIndexTurn;
    this.currentIndexTurn =
      (this.currentIndexTurn + 1) % this.maxPlayers;
    this.sixCount = [null, 0];
    this.turnTaken = false;
    this.setTurn();
  }

  broadcastPieces() {
    this.io.to(this.roomcode).emit("set-piece", this.pieceObj);
  }

  // handlePlayerQuit(socketId) {
  // const playerIndex = this.players.findIndex(p => p[0] === socketId);
  // if (playerIndex === -1) return;

  // const [_, color, socket] = this.players[playerIndex];

  // console.log(`${color} has quit the game`);

  // this.players.splice(playerIndex, 1);
  // this.turnArray = this.turnArray.filter(c => c !== color);
  // delete this.pieceObj[color];

  // this.room.removePlayer(socketId);

  // this.maxPlayers--;

  // const updatedPlayerList = this.room.getPlayerList();
  // this.io.to(this.roomcode).emit("update-lobby", updatedPlayerList);
  // if (this.currentIndexTurn >= this.players.length) {
  //   this.currentIndexTurn = 0;
  // }

  // if (this.players.length <= 1) {
  //   this.gameOn = false;
  //   if (this.players.length === 1) {
  //     const remainingColor = this.players[0][1];
  //     if(!this.winnerArr.includes(remainingColor))
  //     this.winnerArr.push(remainingColor);

  //   }

  //   this.io.to(this.roomcode).emit("game-over", this.winnerArr);
  //   this.io.to(this.roomcode).emit("room-destroyed", this.roomcode);
  //   return;
  // }

  // // If quitting player had current turn, pass turn to next
  // if (playerIndex === this.currentIndexTurn) {
  //   this.turnTaken = false;
  //   this.callNextTurn(true); // skipSixCheck = true
  // }
// }

handlePlayerQuit(socketId) {
  // 1) Find the quitting player
  const playerIndex = this.players.findIndex(p => p[0] === socketId);
  if (playerIndex === -1) return;
  const [ , color ] = this.players[playerIndex];
  console.log(`Player quitting:`, color);

  // 2) Remove them from the turn order and piece map
  this.players.splice(playerIndex, 1);
  this.turnArray = this.turnArray.filter(c => c !== color);
  delete this.pieceObj[color];

  // 3) Also update the Room’s own list
  this.room.removePlayer(socketId);


  this.maxPlayers = Math.max(0, this.maxPlayers - 1);

  const updatedLobby = this.room.getPlayerList();
  console.log(` Lobby now:`, updatedLobby);
  this.io.to(this.roomcode).emit("update-lobby", updatedLobby);

  const remaining = this.players.length;
  console.log(`Remaining players count:`, remaining);

  if (remaining === 1) {
    const lastColor = this.players[0][1];
    console.log(`🏆 Only one left (${lastColor}), ending game.`);

    if (!this.winnerArr.includes(lastColor)) {
      this.winnerArr.push(lastColor);
    }

    this.gameOn = false;
    this.io.to(this.roomcode).emit("game-over", this.winnerArr);
    return;
  }

  if (remaining === 0) {
    console.log(`No players left—forcing game-over.`);
    this.io.to(this.roomcode).emit("game-over", this.winnerArr);
    return;
  }

  if (this.currentIndexTurn >= remaining) {
    this.currentIndexTurn = 0;
  }

  if (playerIndex === this.currentIndexTurn) {
    this.turnTaken = false;
    this.callNextTurn(true);
  }
    this.players.forEach(([, , sock]) => {
    sock.removeAllListeners("dice-clicked");
    sock.removeAllListeners("piece-selected");
  });
  this.setupListeners();     

  this.broadcastPieces();
}


// handlePlayerQuit(socketId) {
//   const playerIndex = this.players.findIndex(p => p[0] === socketId);
//   if (playerIndex === -1) return;

//   const [_, color, socket] = this.players[playerIndex];
//   console.log(`${color} has quit the game`);

//   // Remove player from game structures
//   this.players.splice(playerIndex, 1);
//   this.turnArray = this.turnArray.filter(c => c !== color);
//   delete this.pieceObj[color];
//   this.room.removePlayer(socketId);

//   this.maxPlayers--;

//   const updatedPlayerList = this.room.getPlayerList();
//   this.io.to(this.roomcode).emit("update-lobby", updatedPlayerList);

//   if (this.players.length <= 1) {
//     this.gameOn = false;

//     if (this.players.length === 1) {
//       const remainingColor = this.players[0][1];
//       if (!this.winnerArr.includes(remainingColor)) {
//         this.winnerArr.push(remainingColor);
//       }
//     }

//     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
//     return;
//   }

//   if (this.currentIndexTurn >= this.players.length) {
//     this.currentIndexTurn = 0;
//   }

//   if (playerIndex === this.currentIndexTurn) {
//     this.turnTaken = false;
//     this.callNextTurn(true); 
//   }

//   this.broadcastPieces();
// }
}

// import generateDice from "./generateDice.js";
// import { Player_Piece } from "./PlayerPiece.js";
// import { pathArray,boarddetails,homePathEntries,safePaths } from "../../Constants.js";
// import { RoomManager } from "../Rooms/RoomManager.js";
// export class GameManager{
//     constructor(io,room){
//         this.io = io;
//         this.roomcode = room.code;
//         this.players = room.player.map(p => [p.socket.id, p.color, p.socket]);
//         this.maxPlayers = room.maxPlayer;

//         this.diceResult = 0;
//         this.currentIndexTurn = 0;
//         this.prevIndexTurn = null;
//         this.turnArray = this.players.map(p=>p[1]);
//         this.turnTaken = false;
//         this.gameOn = true;
//         this.winnerArr = [];
//         this.sixCount = 0;

//         this.pieceObj = {};
//         this.start();
//     }
//     start(){
//         this.initPieces();
//         this.io.to(this.roomcode).emit("game-start",`Game started in ${this.room}`, this.pieceObj);
//         this.setTurn();
//         this.listenLoop();
//     }
//     initPieces(){
//         console.log(this.turnArray);
//         this.turnArray.forEach((color,idx) => {
//             this.pieceObj[color] = [];
//             for(let i=1;i<=4;i++){
//                 this.pieceObj[color].push(
//                     new Player_Piece(
//                     color,
//                     `${color}-home-${i}`,
//                     `${color}-home-${i}`,
//                     boarddetails[color].homePathEntry,
//                     `${color}${i}`,
//                     boarddetails[color].gameEntry,
//                     0
//                     )
//                 );
//             }
//         });
//     };

//     setTurn(){
//         if(this.prevIndexTurn!==null){
//             const prevSocketId = this.players[this.prevIndexTurn][0];
//             this.io.to(prevSocketId).emit("your-turn-ended");
//         }
//         const currentSocketId = this.players[this.currentIndexTurn][0];
//         this.io.to(currentSocketId).emit("your-turn");
//         this.io.to(this.roomcode).emit("player-turn",this.turnArray[this.currentIndexTurn]);
//     }
//     rollDice(){
//         this.diceResult = generateDice();
//         this.io.to(this.roomcode).emit("dice-value",this.diceResult);
//         this.turnTaken = true;
//         const currColor = this.turnArray[this.currentIndexTurn];
//         if(currColor === this.sixCount[0]){
//             this.sixCount[1]++;
//         }else{
//             this.sixCount = [currColor,1];
//         }
//     }
//     getActivePieces(){
//         const color = this.turnArray[this.currentIndexTurn];
//         const pieces = this.pieceObj[color];
//         const path = pathArray[color];
//         return pieces.filter(p=>{
//             return((p.status === 0 && (this.diceResult === 6 || this.diceResult === 1))||
//             (p.status === 1 && path.length - path.indexOf(p.position) - 1 >= this.diceResult));
//         });
//     }
//     async MovePieces(pieceId){
//         const color = pieceId.slice(0,-1);
//         let piece = this.pieceObj[color].find(p=>p.id === pieceId);
//         if(!piece) return;
        
//         if(piece.status ===0){
//             piece.unlock();
//             this.broadcastPieces();
//             this.callNextTurn();
//             return;
//         }
//         const path = pathArray[color];
//         for(let i=0;i<this.diceResult;i++){
//             let currentIndex = path.indexOf(piece.position);
//             if(currentIndex+1<path.length){
//                 piece.position = path[currentIndex+1];
//             }else{
//                 break;
//             }
//             if(i===this.diceResult-1){
//                 for(let oppColor of this.turnArray){
//                     if(oppColor === color)
//                         return;
//                     this.pieceObj[oppColor].forEach(p=>{
//                         if(p.position===piece.position && !safePaths.includes(p.position)){
//                             p.sentMeToBoard();
//                         }
//                     });
//                 };
//             }
//             await new Promise(resolve=>setTimeout(resolve,500));
//             this.broadcastPieces();
//         };
//         this.checkGameOver();
//     }

//     checkGameOver(){
//         let completed = 0;
//         for(const color in this.pieceObj){
//             const done = this.pieceObj[color].every(p => p.position === 'home');
//             if(done && !this.winnerArr.includes(color)){
//                 this.winnerArr.push(color);
//                 const player = this.players.find(p=>p[1] ===color);
//                 this.io.to(this.room).emit("winner",`${player[0]} has completed the game`,player[0]);
//             }
//             if(done) completed++;
//         }
//         if(completed===this.maxPlayers){
//             this.io.to(this.roomcode).emit("game-over",this.winnerArr);
//             this.gameOn = false;
//         }
//         else{
//             this.callNextTurn();
//         }
//     }

//     callNextTurn(skipSixCheck = false){
//         if(this.diceResult === 6 && !skipSixCheck) return;
//         this.prevIndexTurn = this.currentIndexTurn;
//         this.currentIndexTurn = (this.currentIndexTurn+1)%this.maxPlayers;
//         this.sixCount = ['',0];
//         this.turnTaken = false;
//         this.setTurn();
//     }
//     broadcastPieces(){
//         this.io.to(this.roomcode).emit("set-piece",this.pieceObj);
//     }
//     listenLoop(){
//         const currentSocket = this.players[this.currentIndexTurn][2];
        
//         currentSocket.removeAllListeners("dice-clicked");
//         currentSocket.on("dice-clicked",async()=>{
//             this.rollDice();
//             await new Promise(res=>setTimeout(res,1000));
//             const actives = this.getActivePieces();
//             this.io.to(this.roomcode).emit("active-pieces",actives);
            
//             if(this.sixCount[1]>=3 || actives.length ===0){
//                 this.callNextTurn(true);
//                 return this.listenLoop();
//             }
//             currentSocket.removeAllListeners("piece-selected");
//             currentSocket.once("piece-selected", async(pieceId)=>{
//                 await this.MovePieces(pieceId);
//                 if(this.gameOn) this.listenLoop();
//             });
//         });   
//     }
// }