import generateDice from "./generateDice.js";
import { Player_Piece } from "./PlayerPiece.js";
import { pathArray, boarddetails, safePaths } from "../../Constants.js";

export class GameManager {
  constructor(io, room) {
    this.io = io;
    this.room = room;
    this.roomcode = room.code;

    // players: [socketId, color, socket]
    this.players = room.player.map(p => [p.socket.id, p.color, p.socket]);
    this.maxPlayers = room.maxPlayer;
    this.originalPlayer = room.player.map(p => [p.socket.id, p.color, p.socket]);

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
            `${color}-home-${i}`,             
            `${color}-home-${i}`,                 
            boarddetails[color].homePathEntry,  
            `${color}${i}`,                       
            boarddetails[color].gameEntry,        
            0                                     
          )
        );
      }
    });
  }

  async sendGameStart() {
    await new Promise(r => setTimeout(r, 1000));
    this.io.to(this.roomcode).emit("game-start", `Game started in ${this.roomcode}`, this.pieceObj);

    // listen for quit/disconnect
    this.players.forEach(([socketId, color, socket]) => {
      socket.on("quit-game", () => this.handlePlayerQuit(socketId));
      socket.on("disconnect", () => {
        console.log(`Player ${color} disconnected`);
        this.handlePlayerQuit(socketId);
      });
    });

    this.setTurn();
    this.setupListeners();
  }


  setupListeners() {
    if (!this.gameOn || this.turnArray.length === 0) return;

    this.players.forEach(([, , sock]) => {
      sock.removeAllListeners("dice-clicked");
      sock.removeAllListeners("piece-selected");
    });

    const currentCol = this.turnArray[this.currentIndexTurn];
    const entry = this.players.find(p => p[1] === currentCol);
    if (!entry) return; 
    const [socketId, color, socket] = entry;

    socket.once("dice-clicked", async () => {
      console.log("dice clicked by the user =>", color);
      if (!this.gameOn) return;
      if (this.turnTaken) return;

      this.turnTaken = true;
      this.rollDice();

      await new Promise(r => setTimeout(r, 1000));

      const actives = this.getActivePieces();
      this.io.to(this.roomcode).emit("active-pieces", actives);

      if (this.sixCount[1] >= 3 || actives.length === 0) {
        this.callNextTurn(true); // 
        this.setupListeners();
        return;
      }

      if (actives.length === 1) {
        await this.MovePieces(actives[0].id);
        if (this.gameOn) this.setupListeners();
        return;
      }

      socket.once("piece-selected", async pieceId => {
        if (!this.gameOn) return;
        if (!this.isPlayerTurn(socketId)) return;
        if (!this.turnTaken) return;

        await this.MovePieces(pieceId);
        if (this.gameOn) this.setupListeners();
      });
    });
  }

  isPlayerTurn(socketId) {
    if (!this.players[this.currentIndexTurn]) return false;
    return socketId === this.players[this.currentIndexTurn][0];
  }

  setTurn() {
    if (!this.gameOn || this.turnArray.length === 0) return;

    if (this.prevIndexTurn !== null && this.players[this.prevIndexTurn]) {
      const prevId = this.players[this.prevIndexTurn][0];
      if (prevId) this.io.to(prevId).emit("your-turn-ended");
    }

    const currentCol = this.turnArray[this.currentIndexTurn];
    const found = this.players.find(p => p[1] === currentCol);
    if (!found) return;
    const [currentId] = found;

    this.io.to(currentId).emit("your-turn");
    this.io.to(this.roomcode).emit("player-turn", currentCol);

    this.turnTaken = false;
    this.bonus = false;
  }


  rollDice() {
    this.diceResult = generateDice();
    this.io.to(this.roomcode).emit("dice-value", this.diceResult);

    const color = this.turnArray[this.currentIndexTurn];
    if (this.diceResult === 6) {
      if (this.sixCount[0] === color) {
        this.sixCount[1]++;
      } else {
        this.sixCount = [color, 1];
      }
    } else {
      this.sixCount = [color, 0];
    }
  }

  getActivePieces() {
    const color = this.turnArray[this.currentIndexTurn];
    const pieces = this.pieceObj[color];
    const path = pathArray[color];

    return pieces.filter(p => {
      const idx = path.indexOf(p.position);
      return (
        (p.status === 0 && (this.diceResult === 6 || this.diceResult === 1)) || 
        (p.status === 1 && idx !== -1 && path.length - idx - 1 >= this.diceResult) 
      );
    });
  }

  async MovePieces(pieceId) {
    const color = pieceId.slice(0, -1);
    const piece = this.pieceObj[color]?.find(p => p.id === pieceId);
    if (!piece) return;

    if (piece.status === 0) {
      piece.unlock();
      this.broadcastPieces();
      this.checkGameOver(); 
      return;
    }

    const path = pathArray[color];

    for (let i = 0; i < this.diceResult; i++) {
      const idx = path.indexOf(piece.position);
      if (idx + 1 < path.length) piece.position = path[idx + 1];

      if (i === this.diceResult - 1) {
        if (piece.position === "home") {
          this.bonus = true;
          this.io.to(this.roomcode).emit("piece-inside");
        }

        for (const opp of this.turnArray) {
          if (opp === color) continue;
          this.pieceObj[opp]?.forEach(p => {
            if (p.position === piece.position && !safePaths.includes(p.position)) {
              p.sentMeToBoard();
              this.io.to(this.roomcode).emit("piece-killed");
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
    const winnersToRemove = [];

    for (const color in this.pieceObj) {
      const done = this.pieceObj[color].every(p => p.position === "home");
      if (done && !this.winnerArr.includes(color)) {
        this.winnerArr.push(color);
        winnersToRemove.push(color);

        const [winnerId] = this.players.find(p => p[1] === color) || [];
        this.io.to(this.roomcode).emit("winner", `${color} has completed the game`, color, winnerId);
      }
    }

    if (winnersToRemove.length === 0) {
      this.callNextTurn(false);
      return;
    }

    const currentColorBefore = this.turnArray[this.currentIndexTurn];

    const removedIndexes = winnersToRemove
      .map(c => this.turnArray.indexOf(c))
      .filter(i => i !== -1)
      .sort((a, b) => a - b);

    winnersToRemove.forEach(winnerColor => {
      const idx = this.turnArray.indexOf(winnerColor);
      if (idx !== -1) this.turnArray.splice(idx, 1);
      this.players = this.players.filter(p => p[1] !== winnerColor);
      delete this.pieceObj[winnerColor];
    });

    if (this.turnArray.length <= 1) {
      if (this.turnArray.length === 1 && !this.winnerArr.includes(this.turnArray[0])) {
        this.winnerArr.push(this.turnArray[0]); // last place auto
      }
      this.gameOn = false;
      this.io.to(this.roomcode).emit("game-over", this.winnerArr);
      return;
    }

 
    const removedCurrent = winnersToRemove.includes(currentColorBefore);

    if (removedCurrent) {
      if (this.currentIndexTurn >= this.turnArray.length) this.currentIndexTurn = 0;
      this.turnTaken = false;
      this.bonus = false;
      this.sixCount = [null, 0];
      this.setTurn();
      return;
    }

    const shift = removedIndexes.filter(i => i < this.currentIndexTurn).length;
    if (shift) this.currentIndexTurn -= shift;
    if (this.currentIndexTurn >= this.turnArray.length) this.currentIndexTurn = 0;

    this.callNextTurn(true);
  }

  /**
   * Advance to next player.
   * @param {boolean} force - if true, ignore six/bonus extra turn.
   */
  callNextTurn(force = false) {
    if (!force && (this.diceResult === 6 || this.bonus)) {
      this.turnTaken = false;
      this.bonus = false;
      return;
    }

    if (this.turnArray.length === 0) return;

    this.prevIndexTurn = this.currentIndexTurn;
    this.currentIndexTurn = (this.currentIndexTurn + 1) % this.turnArray.length;

    this.sixCount = [null, 0];
    this.turnTaken = false;
    this.bonus = false;

    this.setTurn();
  }

  broadcastPieces() {
    this.io.to(this.roomcode).emit("set-piece", this.pieceObj);
  }


  handlePlayerQuit(socketId) {
    const playerIndex = this.players.findIndex(p => p[0] === socketId);
    if (playerIndex === -1) return;

    const [, color] = this.players[playerIndex];
    console.log(`Player quitting:`, color);

    this.turnArray = this.turnArray.filter(c => c !== color);
    delete this.pieceObj[color];

    this.room.removePlayer(socketId);
    this.players.splice(playerIndex, 1);

    this.maxPlayers = Math.max(0, this.maxPlayers - 1);

    const updatedLobby = this.room.getPlayerList();
    this.io.to(this.roomcode).emit("update-lobby", updatedLobby);

    const remaining = this.players.length;
    console.log(`Remaining players count:`, remaining);

    if (remaining === 1) {
      const lastColor = this.players[0][1];
      console.log(`Only one left (${lastColor}), ending game.`);

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

    if (playerIndex === this.currentIndexTurn) {
      console.log("Current player quit, moving to next player...");
      this.turnTaken = false;
      this.prevIndexTurn = null;

      if (this.currentIndexTurn >= this.players.length) {
        this.currentIndexTurn = 0;
      }
      this.callNextTurn(true); // 
    } else if (playerIndex < this.currentIndexTurn) {
      this.currentIndexTurn -= 1;
      if (this.currentIndexTurn < 0) this.currentIndexTurn = 0;
    }

    this.players.forEach(([, , sock]) => {
      sock.removeAllListeners("dice-clicked");
      sock.removeAllListeners("piece-selected");
    });

    this.setupListeners();
    this.broadcastPieces();
  }
}

// import generateDice from "./generateDice.js";
// import { Player_Piece } from "./PlayerPiece.js";
// import { pathArray, boarddetails, safePaths } from "../../Constants.js";

// export class GameManager {
//   constructor(io, room) {
//     this.io = io;
//     this.room = room;
//     this.roomcode = room.code;
//     this.players = room.player.map(p => [p.socket.id, p.color, p.socket]);
//     this.maxPlayers = room.maxPlayer;
//     this.originalPlayer =  room.player.map(p => [p.socket.id, p.color, p.socket]);
//     this.diceResult = 0;
//     this.currentIndexTurn = 0;
//     this.prevIndexTurn = null;
//     this.turnArray = this.players.map(p => p[1]);
//     this.turnTaken = false;
//     this.gameOn = true;
//     this.winnerArr = [];
//     this.sixCount = [null, 0];
//     this.bonus = false;
//     this.pieceObj = {};
//     this.initPieces();
//     this.sendGameStart();
//   }

//   initPieces() {
//     this.turnArray.forEach(color => {
//       this.pieceObj[color] = [];
//       for (let i = 1; i <= 4; i++) {
//         this.pieceObj[color].push(
//           new Player_Piece(
//             color,
//             `${color}-home-${i}`,          
//             `${color}-home-${i}`,     
//             boarddetails[color].homePathEntry,
//             `${color}${i}`,                
//             boarddetails[color].gameEntry,  
//             0                         
//           )
//         );
//       }
//     });
//   }


  

//   async sendGameStart() {
//     // console.log(this.players)
//     await new Promise(r => setTimeout(r, 1000));
//     this.io.to(this.roomcode).emit(
//       "game-start",
//       `Game started in ${this.roomcode}`,
//       this.pieceObj
//     );
//       this.setTurn();
//       this.setupListeners();
//       this.players.forEach(([socketId, color, socket]) => {
//   socket.on("quit-game", () => {
//     this.handlePlayerQuit(socketId);
//   });
//   socket.on("disconnect", () => {
//     console.log(`Player ${color} disconnected`);
//     this.handlePlayerQuit(socketId);
//   });

// });

//   }



//   setupListeners() {
//     let currentCol = this.turnArray[this.currentIndexTurn];
//     const [socketId, color, socket] = this.players.find((p)=>p[1] === currentCol);
//     this.players.forEach(([, , sock]) => {
//     sock.removeAllListeners("dice-clicked");
//     sock.removeAllListeners("piece-selected");
//     });
//       socket.once("dice-clicked", async () => {
//         console.log("dice clicked by the user =>",color);
//         if (!this.gameOn) return;
//         if (this.turnTaken) return;                       
//         this.turnTaken = true;
//         this.rollDice();

//         await new Promise(r => setTimeout(r, 1000));

//         const actives = this.getActivePieces();
//         this.io.to(this.roomcode).emit("active-pieces", actives);

//         if (this.sixCount[1] >= 3 || actives.length === 0) {
//           this.callNextTurn(true);
//           this.setupListeners();
//         }
      
//         if(actives.length ===1){
//           await this.MovePieces(actives[0].id);
//           if (this.gameOn) {
//           // this.callNextTurn();
//           console.log("setting another round");
//           console.log(this.players[this.currentIndexTurn]);
//           this.setupListeners();
//           }
//           return;
//         }    
//       socket.on("piece-selected", async pieceId => {
//         if (!this.gameOn) return;
//         if (!this.isPlayerTurn(socketId)) return;        
//         if (!this.turnTaken) return;                      

//         await this.MovePieces(pieceId);

//         if (this.gameOn) {
//           console.log("setting another round");
//           this.setupListeners();
//         }
//       });
//     });
//   }

//   isPlayerTurn(socketId) {
//     return socketId === this.players[this.currentIndexTurn][0];
//   }

//   setTurn() {
//     if (this.prevIndexTurn !== null) {
//       const prevId = this.players[this.prevIndexTurn][0];
//       this.io.to(prevId).emit("your-turn-ended");
//     }
//     const currentCol = this.turnArray[this.currentIndexTurn];
//     const [currentId] = this.players.find((p)=>(p[1]===currentCol)).filter((p)=>(p[0]));
//     this.io.to(currentId).emit("your-turn");
//     this.io
//       .to(this.roomcode)
//       .emit("player-turn", this.turnArray[this.currentIndexTurn]);
//     this.turnTaken = false;
//     this.bonus = false;
//   }

//   rollDice() {
//     this.diceResult = generateDice();
//     this.io.to(this.roomcode).emit("dice-value", this.diceResult);

//     const color = this.turnArray[this.currentIndexTurn];
//     if (this.sixCount[0] === color && this.diceResult === 6) {
//       this.sixCount[1]++;
//     } else {
//       this.sixCount = [color, 1];
//     }
//   }

//   getActivePieces() {
//     const color = this.turnArray[this.currentIndexTurn];
//     const pieces = this.pieceObj[color];
//     const path = pathArray[color];
//     return pieces.filter(p => {
//       return (
//         (p.status === 0 && (this.diceResult === 6 || this.diceResult === 1)) ||
//         (p.status === 1 &&
//           path.length - path.indexOf(p.position) - 1 >= this.diceResult)
//       );
//     });
//   }

//   async MovePieces(pieceId) {
//     console.log("piece id = ",pieceId);
//     const color = pieceId.slice(0, -1);
//     const piece = this.pieceObj[color].find(p => p.id === pieceId);
//     if (!piece) return;

//     if (piece.status === 0) {
//       piece.unlock();
//       this.broadcastPieces();
//       this.callNextTurn() //
//       return;
//     }

//     const path = pathArray[color];
//     for (let i = 0; i < this.diceResult; i++) {
//       const idx = path.indexOf(piece.position);
//       if (idx + 1 < path.length) piece.position = path[idx + 1];
//       if (i === this.diceResult - 1) {
//         if(piece.position === 'home'){
//           this.bonus = true;
//           this.io.to(this.roomcode).emit("piece-inside");
//         }
//         for (const opp of this.turnArray) {
//           if (opp === color) continue;
//           this.pieceObj[opp].forEach(p => {
//             if (
//               p.position === piece.position &&
//               !safePaths.includes(p.position)
//             ) {
//               p.sentMeToBoard();
//               this.io.to(this.roomcode).emit("piece-killed");
//               this.bonus = true;
//             }
//           });
//         }
//       }
//       await new Promise(r => setTimeout(r, 500));
//       this.broadcastPieces();
//     }

//     this.checkGameOver();
//   }

// checkGameOver() {
//   let completed = 0;
//   const winnersToRemove = [];

//   for (const color in this.pieceObj) {
//     const done = this.pieceObj[color].every(p => p.position === "home");
//     if (done && !this.winnerArr.includes(color)) {
//       this.winnerArr.push(color);
//       winnersToRemove.push(color);

//       const [winnerId] = this.players.find(p => p[1] === color);
//       this.io.to(this.roomcode).emit(
//         "winner",
//         `${color} has completed the game`,
//         color,
//         winnerId
//       );
//     }
//     if (done) completed++;
//   }

//   winnersToRemove.forEach(winnerColor => {
//     const index = this.turnArray.indexOf(winnerColor);
//     if (index !== -1) {
//       this.turnArray.splice(index, 1);
//       this.players = this.players.filter(p => p[1] !== winnerColor);
//     }
//   });

//   if (this.currentIndexTurn >= this.turnArray.length) {
//     this.currentIndexTurn = 0;
//   }

//   if (this.turnArray.length <= 1) {
//     if (this.turnArray.length === 1 && !this.winnerArr.includes(this.turnArray[0])) {
//       this.winnerArr.push(this.turnArray[0]);
//     }
//     this.gameOn = false;
//     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
//     return;
//   }

//   this.callNextTurn();
// }

// //   checkGameOver() {
// //   let completed = 0;
// //   const winnersToRemove = [];

// //   for (const color in this.pieceObj) {
// //     const done = this.pieceObj[color].every(p => p.position === "home");
// //     if (done && !this.winnerArr.includes(color)) {
// //       this.winnerArr.push(color);
// //       winnersToRemove.push(color); 

// //       const [winnerId] = this.players.find(p => p[1] === color);
// //       this.io.to(this.roomcode).emit("winner", `${color} has completed the game`, color, winnerId);
// //     }
// //     if (done) completed++;
// //   }

// //   for (const winnerColor of winnersToRemove) {
// //     const index = this.turnArray.indexOf(winnerColor);
// //     if (index !== -1) {
// //       this.turnArray.splice(index, 1);

// //       if (this.currentTurnIndex >= this.turnArray.length) {
// //         this.currentTurnIndex = 0;
// //       }
// //     }
// //   }

// //   console.log("Updated turnArray =>", this.turnArray);

// //   if (completed === this.maxPlayers - 1) {
// //     this.gameOn = false;
// //     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
// //   } else {
// //     this.callNextTurn();
// //   }
// // }


//   // checkGameOver() {
//   //   let completed = 0;
//   //   for (const color in this.pieceObj) {
//   //     const done = this.pieceObj[color].every(p => p.position === "home");
//   //     if (done && !this.winnerArr.includes(color)) {
//   //       this.winnerArr.push(color);
//   //       const [winnerId] = this.players.find(p => p[1] === color);
//   //       this.io
//   //         .to(this.roomcode)
//   //         .emit("winner", `${color} has completed the game`, color,winnerId);
//   //         this.turnArray = this.turnArray.filter((p)=>p!==color);
//   //         console.log("turn array after this =>",this.turnArray);

//   //     }
//   //     if (done) completed++;
//   //   }

//   //   if (completed === this.maxPlayers-1) {
//   //     this.gameOn = false;
//   //     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
//   //   }
//   //   else{
//   //     this.callNextTurn();
//   //   }
//   // }

//   callNextTurn(skipSixCheck = false) {
//     if ((this.diceResult === 6 && !skipSixCheck) || (this.bonus)) 
//         {   this.turnTaken = false;
//             this.bonus = false;
//             return
//         };
//     this.prevIndexTurn = this.currentIndexTurn;
//     this.currentIndexTurn =
//       this.currentIndexTurn>this.turnArray.length? 0:(this.currentIndexTurn + 1) % this.turnArray.length;
//     this.sixCount = [null, 0];
//     this.turnTaken = false;
//     this.bonus = false;
//     this.setTurn();
//   }

//   broadcastPieces() {
//     this.io.to(this.roomcode).emit("set-piece", this.pieceObj);
//   }

// handlePlayerQuit(socketId) {
//   const playerIndex = this.players.findIndex(p => p[0] === socketId);
//   if (playerIndex === -1) return;

//   const [ , color ] = this.players[playerIndex];
//   console.log(`Player quitting:`, color);

//   this.turnArray = this.turnArray.filter(c => c !== color);
//   delete this.pieceObj[color];

//   this.room.removePlayer(socketId);
//   this.players.splice(playerIndex, 1);

//   this.maxPlayers = Math.max(0, this.maxPlayers - 1);

//   const updatedLobby = this.room.getPlayerList();
//   this.io.to(this.roomcode).emit("update-lobby", updatedLobby);

//   const remaining = this.players.length;
//   console.log(`Remaining players count:`, remaining);

//   if (remaining === 1) {
//     const lastColor = this.players[0][1];
//     console.log(`Only one left (${lastColor}), ending game.`);

//     if (!this.winnerArr.includes(lastColor)) {
//       this.winnerArr.push(lastColor);
//     }

//     this.gameOn = false;
//     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
//     return;
//   }

//   if (remaining === 0) {
//     console.log(`No players left—forcing game-over.`);
//     this.io.to(this.roomcode).emit("game-over", this.winnerArr);
//     return;
//   }

//   if (playerIndex === this.currentIndexTurn) {
//     console.log("Current player quit, moving to next player...");
//     this.turnTaken = false;
//     this.prevIndexTurn = null;

//     if (this.currentIndexTurn >= this.players.length) {
//       this.currentIndexTurn = 0; // reset if out of bounds
//     }
//     this.callNextTurn(true);
//   } else if (playerIndex < this.currentIndexTurn) {
//     this.currentIndexTurn -= 1;
//   }

//   this.players.forEach(([, , sock]) => {
//     sock.removeAllListeners("dice-clicked");
//     sock.removeAllListeners("piece-selected");
//   });

//   this.setupListeners();     
//   this.broadcastPieces();
// }
// }
