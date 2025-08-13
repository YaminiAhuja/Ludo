import React, { useEffect, useState } from 'react';
import Board from './Board.jsx';
import Dice from './Dice.jsx';
import UserDetail from './UserDetail.jsx';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import './Game.css';
import game_start from '../assets/game_start.mp3'
import pieceAtHome from '../assets/mixkit-magic-sweep-game-trophy-257.wav'
import pieceMove from '../assets/mixkit-player-jumping-in-a-video-game-2043.wav'
import killMusic from '../assets/mixkit-video-game-health-recharge-2837.wav'
import { useSound } from './useSound.jsx';
const Game = (props) => {

  const { width, height } = useWindowSize()
  const [myTurn, setTurn] = useState(false);
  const [pieces, setPieces] = useState({});
  const [activePieces, setActivePieces] = useState([]);
  const [playerTurn, setPlayerTurn] = useState("");
  const navigate = useNavigate();
  const [isConfetti,setConfetti] = useState(false);
  const [gameStart,pauseGameStart] = useSound(game_start);
  const [confettiCol,setConfettiColor] = useState("");
  const [pieceHome,pausePieceHome] = useSound(pieceAtHome);
  const [piecemove , pausePiece] = useSound(pieceMove);
  const [killSound,pauseKillSound] = useSound(killMusic);

  useEffect(() => {
    if (!props.socket.current) {
      navigate('/');
      return;
    }

    const s = props.socket.current;

    function handleUpdateLobby(players) {
      console.log("settting players djfngf")
      props.setCurrentPlayers(players);
    }

    function handleGameStart(_msg, pieceObj) {
      console.log("gamee starteddd");
      gameStart();
      console.log("startSound() triggered");
      setPieces(pieceObj);
    }

    function handleActivePieces(arr) {
      setActivePieces(arr);
    }

    async function handleSetPiece(pieceObj) {
      piecemove();
      setActivePieces([]);
      setPieces(pieceObj);
      setTimeout(()=>{pausePiece()},600)
    }

    function handleYourTurn() {
      console.log("my turn")
      setTurn(true);
    }

    function handlePlayerTurn(color) {
      console.log("player turn = " , color);
      setPlayerTurn(color);
      // setTurn(false);
    }

    function handleYourTurnEnded() {
      console.log("my turn ended?")
      setTurn(false);
      setActivePieces([]);
    }
    function handleKillSound(){
      killSound();
    }

    async function handleGameOver(winners) {
      props.setWinnerList(winners);
      console.log("winnerlist -",winners);
      console.log("game overr!!!!11");
      await new Promise(r =>setTimeout(()=>{console.log("game over!!!1");r()},1000));
      navigate('/gameOver');
      props.setRoom(false);
    }

    async function handlerPieceHome() {
      pieceHome();
    }

    function winner(message,color,userDetails){
      setConfetti(true);
      setConfettiColor(color); 
      console.log("the winner is winning")
      
  setTimeout(() => {
    setConfetti(false);
  }, 10000);
    
    }
    // register all handlers
    s.on("update-lobby", handleUpdateLobby);
    s.on("game-start", handleGameStart);
    s.on("active-pieces", handleActivePieces);
    s.on("set-piece", handleSetPiece);
    s.on("your-turn", handleYourTurn);
    s.on("player-turn", handlePlayerTurn);
    s.on("your-turn-ended", handleYourTurnEnded);
    s.on("game-over", handleGameOver);
    s.on("piece-inside",handlerPieceHome);
    s.on("winner",winner);
    s.on("piece-killed",handleKillSound);
    
    return () => {
      s.off("update-lobby", handleUpdateLobby);
      s.off("game-start", handleGameStart);
      s.off("active-pieces", handleActivePieces);
      s.off("set-piece", handleSetPiece);
      s.off("your-turn", handleYourTurn);
      s.off("player-turn", handlePlayerTurn);
      s.off("your-turn-ended", handleYourTurnEnded);
      s.off("game-over", handleGameOver);
      s.off("piece-inside",handlerPieceHome);
      s.on("winner",winner);
      s.off("piece-killed",handleKillSound);

    };
  }, [props.socket, navigate, props.setCurrentPlayers, props.setWinnerList]);

  return (
    <div className="game-container">
     {isConfetti && (
  <Confetti
    width={width}
    height={height}
    colors={
      confettiCol
        ? [confettiCol]  
        : ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]
    }
  />
)}
      <div className="left-panel">
        <div className='board-area'>
          <Board
            pieces={pieces}
            currentPlayer={playerTurn}
            ActivePiecesArr={activePieces}
            socket={props.socket.current}
          />
        </div>
        <div className="dice-area">
          <Dice turn={myTurn} socket={props.socket.current} />
        </div>
      </div>
      <div className="right-panel">
          {console.log(props.privateRoom)}
            {props.privateRoom &&props.generatedRoomCode &&
            <div className="created-room-section">
              <p>Room Created! Share this code:</p>
              <code className="room-code">{props.generatedRoomCode}</code>
              <br />
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(props.generatedRoomCode);
                  alert('Room code copied to clipboard!');
                }}
              >
                Copy Code
              </button>
            </div>
    }
        <div className='user-details-container'>
  {Array.isArray(props.currentplayers) && props.currentplayers.length > 0 &&
    props.currentplayers.map(({ name, color }, index) => (
      <UserDetail
        key={index}
        name={name}
        color={color}
        socket = {props.socket.current}
        myColor = {props.userColor}
        setRoom = {props.setRoom}
        isTurn={playerTurn === color}
      />
    ))
}
         
        </div>
      </div>
    </div>
  );
};

export default Game;

// import React from 'react';
// import Board from './Board.jsx';
// import Dice from './Dice.jsx';
// import UserDetails from './UserDetail.jsx'
// import { useRef } from 'react';
// import { useEffect } from 'react';
// import {io} from 'props.socket.io-client';
// import { useState } from 'react';
// import './Game.css'
// const Game = () => {
//   const props.socket = useRef();
//   const [myTurn,setTurn] = useState(false);
//   const [pieces,setPieces] = useState({});
//   const [activePieces,setActivePieces] = useState([]);
//   const [message,setMessage] = useState("message");
//   //when the player will make the move we need to set active pieces as {} again
//   const [PlayerTurn,setPlayerTurn] = useState("");
//    useEffect(()=>{
//     props.socket.current = io(import.meta.env.VITE_SERVER_URL);
//     props.socket.current.on("connect",()=>{
//       console.log("the user is connected to the client");
//     })
//     props.socket.current.on("user-joined",(message)=>{
//       console.log(message)
//     })
//     props.socket.current.on("game-start",(message,pieceObj)=>{
//       console.log(message);
//       setPieces(pieceObj);
//       console.log(pieceObj)
//     })
//     props.socket.current.on("active-pieces",(piecesArr)=>{
//       console.log("got the active pieces");
//       console.log(piecesArr);
//       setActivePieces(piecesArr);
//     })

//     props.socket.current.on("set-piece",(pieceObj)=>{
//       setActivePieces([])
//       setPieces(pieceObj);
//     })

//     props.socket.current.on("your-turn",(value)=>{
//       console.log("my turn")
//       setMessage("your turn");
//         setTurn(true);
//     })

//     props.socket.current.on("player-turn",(player)=>{
//         setPlayerTurn(player);
//         setMessage(player,"'s turn");
//         console.log(player);
//     })

//     props.socket.current.on("your-turn-ended",()=>{
//       setTurn(false);
//     })

//     return ()=>{
//       props.socket.current.disconnect();
//     }
//   },[])


//   return (
//     <div className='w-full h-full flex-col grid-cols-2'>
//     <div className='flex align-center justify-center w-full h-full'>
//       <Board pieces = {pieces} currentPlayer = {PlayerTurn} ActivePiecesArr = {activePieces} props.socket = {props.socket.current}></Board>
//       <Dice turn = {myTurn} props.socket = {props.socket.current}></Dice>
//       <div className='text-7xl'>{myTurn===true?"your turn" : message}</div>
//       <div>
//         <UserDetails></UserDetails>
//         <UserDetails></UserDetails>
//         <UserDetails></UserDetails>
//         <UserDetails></UserDetails>
//       </div>
//     </div>

//     </div>
//   )

// }

// export default Game



