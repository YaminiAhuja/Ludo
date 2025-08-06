// import { Player_Piece } from "./classes/PlayerPiece.js";
// import generateDice from "./Functions/generateDice.js";

// let pathArray =
// {
//     red: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9',
//         'r10', 'r11', 'r12', 'r13', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9',
//         'g10', 'g11', 'g12', 'g13', 'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9',
//         'y10', 'y11', 'y12', 'y13', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9',
//         'b10', 'b11', 'b12', 'rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'home'],

//     blue: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'r1',
//         'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13',
//         'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13',
//         'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12',
//         'bh1', 'bh2', 'bh3', 'bh4',
//         'bh5', 'home'
//     ],
//     green: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13',
//         'y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12', 'y13',
//         'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'r1',
//         'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'gh1', 'gh2', 'gh3', 'gh4',
//         'gh5', 'home']
//     ,
//     yellow: ['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9', 'y10', 'y11', 'y12', 'y13',
//         'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13',
//         'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13',
//         'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'yh1', 'yh2', 'yh3', 'yh4',
//         'yh5', 'home'
//     ]
// }




// let homePathEntries = {
//     blue: ['bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'home'],
//     green: ['gh1', 'gh2', 'gh3', 'gh4', 'gh5', 'home'],
//     yellow: ['yh1', 'yh2', 'yh3', 'yh4', 'yh5', 'home'],
//     red: ['rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'home']
// }

// let safePaths = [
//     'r1', 'r9', 'b1', 'b9', 'g1', 'g9', 'y1', 'y9',
//     ...homePathEntries.blue,
//     ...homePathEntries.red,
//     ...homePathEntries.yellow,
//     ...homePathEntries.green
// ];


// let boarddetails = [
//     { boardColor: 'blue', homePathEntry: 'y12', gameEntry: 'b1' }
//     , { boardColor: 'red', homePathEntry: 'b12', gameEntry: 'r1' }
//     , { boardColor: 'green', homePathEntry: 'r12', gameEntry: 'g1' }
//     , { boardColor: 'yellow', homePathEntry: 'g12', gameEntry: 'y1' }
// ]

// //change that later

// export function Ludo(io, userArray, room){
// let players = 4;
// let turnArray = ['blue', 'red', 'green', 'yellow'];
// let diceResult = 0;
// let currentTurnIndex = 0;
// let prevTurnIndex = undefined;
// let turnTaken = false;
// let gameOn = true;
// let playerPieces = [];
// const winnerArr = [];
// let sixCount = ['',0];


// function setTurn(io, userArray, room) {
//     console.log("in set turn");
//     // console.log(userArray[currentTurnIndex][2].id);
//     if (prevTurnIndex != undefined) {
//         const prevSocket = userArray[prevTurnIndex][0];
//         io.to(prevSocket).emit("your-turn-ended");
//     }
//     const currentSocket = userArray[currentTurnIndex][0];
//     io.to(currentSocket).emit("your-turn");
//     io.to(room).emit("player-turn", turnArray[currentTurnIndex]);
//     turnTaken = false;
// }

// function setPiece(io, pieceObj, room) {
//     io.to(room).emit("set-piece", pieceObj);
// }

// async function MovePiece(piece_id,pieceObj,userArray,io,room){
//     console.log("moving piece");
//     const teamName = piece_id.substr(0,piece_id.length-1);
//     console.log(teamName);
//     let piece = pieceObj[teamName].filter(function(p){
//         return p.id === piece_id;
//     })
//     piece = piece[0];
//     if(piece.status === 0){
//         //we have to unlock
//         piece.unlock();
//         setPiece(io,pieceObj,room);
//         callNextTurn(io,userArray,room);
//         return;
//     }
//     else{
//     let path = pathArray[teamName];
//     //all i have to do is move piece and handle deletion
//     for(let i=0;i<diceResult;i++){
//         console.log(i);
//         let currentIndex = path.indexOf(piece.position);
//         if (currentIndex + 1 < path.length) {
//     piece.position = path[currentIndex + 1];
// } else {
//     break;
// }
//         if(i==diceResult-1){
//             //delete the piece
//             const deletePiece = [];
//             for(let i=0;i<players;i++){
//                 pieceObj[turnArray[i]].forEach((p)=>{
//                     if(p.position === piece.position && p.id!==piece.id && !safePaths.includes(piece.position) && p.team!=piece.team){
//                         deletePiece.push(p);
//                     }
//                 })
//             }
//             deletePiece.forEach((p)=>{
//                 p.sentMeToBoard();
//             })
//         }
//        await new Promise(resolve => setTimeout(resolve, 500));
//         setPiece(io,pieceObj,room);
//     }
//    gameOff(io,pieceObj,room,userArray)
//     }
// }

// function gameOff(io, pieceObj, room, userArray) {
//     let completed = 0;

//     for (const color in pieceObj) {
//         const tokens = pieceObj[color];
//         const isFinished = tokens.every(p => p.position === 'home');

//         if (isFinished && !winnerArr.includes(color)) {
//             winnerArr.push(color);
//             const user = userArray.find(u => u[1] === color);
//             const name = user ? user[0] : color;
//             io.to(room).emit("winner", `${name} has completed the game`);
//         }

//         if (isFinished) completed++;
//     }

//     if (completed === Object.keys(pieceObj).length) {
//         gameOn = false;
//         io.to(room).emit("game-over", winnerArr);
//     } else {
//         callNextTurn(io, userArray, room);
//     }
// }

// function callNextTurn(io,userArray,room,value = true){
//     if(diceResult===6 && value){
//         //more turn
//         turnTaken = false;
//         return;
//     }
//     prevTurnIndex = currentTurnIndex;
//     currentTurnIndex = (currentTurnIndex+1)%players;
//     turnTaken = false;
//     sixCount = ['', 0]; 
//     setTurn(io,userArray,room);
// }

// function StartGame(io, userArray, room) {
//     const pieceObj = {};
//     turnArray.forEach((team, idx) => {
//         pieceObj[team] = [];
//         for (let j = 1; j <= 4; j++) {
//             pieceObj[team].push(
//                 new Player_Piece(
//                     team,
//                     `${team}-home-${j}`,
//                     `${team}-home-${j}`,
//                     boarddetails[idx].homePathEntry,
//                     `${team}${j}`,
//                     boarddetails[idx].gameEntry,
//                     0
//                 )
//             );
//         }
//     });

//     io.to(room).emit("game-start", `Game started in ${room}`, pieceObj);
//     setTurn(io,userArray,room);
//     Game(io, userArray, room, pieceObj);
// }

// function rollDice(io, userArray, room) {
//         console.log("dice-clicked")
//         diceResult = generateDice();
       
//         io.to(room).emit("dice-value", diceResult);
//         turnTaken = true;
//         if(turnArray[currentTurnIndex] === sixCount[0]){
//             sixCount[1]++;
//         }
//         else{
//             sixCount[0] = turnArray[currentTurnIndex];
//             sixCount[1] = 1;
//         }
// }

// function letActivePieces(pieceObj) {
//         let activePieces = [];
//         let pieces = pieceObj[turnArray[currentTurnIndex]];
//             let paths = pathArray[turnArray[currentTurnIndex]];
//             pieces.forEach((piece)=>{
//                 if (piece.status === 0 && (diceResult === 6 || diceResult === 1)) {
//                     console.log(piece.id);
//                 activePieces.push(piece);
//             }
//             else if (piece.status === 1 && (paths.length-1 - paths.indexOf(piece.position))>= diceResult) {

//                 activePieces.push(piece);
//             }
//             })
//         return activePieces;
// }


// async function Game(io, userArray, room, pieceObj) {
//     console.log('my turn')
//     userArray[currentTurnIndex][2].removeAllListeners("dice-clicked");
//     userArray[currentTurnIndex][2].on("dice-clicked",async()=>{
//         rollDice(io,userArray,room);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         let arr = letActivePieces(pieceObj);
//         console.log(arr.length)
//         io.to(room).emit("active-pieces",arr);
//         if(sixCount[1]>=3 || arr.length===0){
//             callNextTurn(io,userArray,room,false);
//             return Game(io, userArray, room, pieceObj);

//         }
//         userArray[currentTurnIndex][2].removeAllListeners("piece-selected");
//         userArray[currentTurnIndex][2].once("piece-selected",(piece_id)=>{
//             MovePiece(piece_id,pieceObj,userArray,io,room);
//             if (gameOn) {
//                         console.log("yes")
//                         Game(io,userArray,room,pieceObj); 
//             }
//         })
//     }
// )};
// StartGame(io,userArray,room);
// }











