import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './FrontPage.css'
import { useEffect } from 'react';

const FrontPage = (props) => {
  const [showButton, setShowButton] = useState(false);
  const [message, setMessage] = useState('');
  const [action, setAction] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerCount, setPlayerCount] = useState(4);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [buttonName,setName] = useState("Join");
  const [option,setOption] = useState(0);

  
  
  const handleCreateRoom = () => {
    setAction('create');
    if (!props.socket.current?.connected)
      props.socket.current = io(import.meta.env.VITE_SERVER_URL);

    props.socket.current.emit(
      'create-room',
      props.username,
      playerCount,
      (response) => {
        if (response.roomcode) {
          setOption(1);
          props.setRoom(true);
          console.log(response);
          console.log("current player = ",response);
          props.setGenRoomCode(response.roomcode);
          props.setCurrentPlayers(response.player);
          props.setColor(response.color);
          navigate("/game")
        } else {
          setError('Room creation failed');
          setOption(0);
        }
      }
    );
  };

  const handleJoinRoom = () => {
    setName("Joining");
    if (!roomCode.trim()) {
      setError('Enter valid room code');
      return;
    }
    if (!props.socket.current?.connected)
      props.socket.current = io(import.meta.env.VITE_SERVER_URL);

    props.socket.current.emit(
      'join-room',
      roomCode.trim(),
      props.username,
      (response) => {
        if (response.error) {
          setError(response.error);
          setOption(0);
        } else {
          setError('');
          setOption(1);
          console.log("players",response.player);
          props.setCurrentPlayers(response.player);
          console.log("color = ",response.color)
          props.setColor(response.color);
          navigate('/game');
        }
      }
    );
  };

  const handleJoinRandom = () => {
    if (!props.socket.current?.connected)
      props.socket.current = io(import.meta.env.VITE_SERVER_URL);

    console.log("joninhhhhh");
    props.socket.current.emit(
      'join-random',
      props.username,
      playerCount,
      (response) => {
        if (response.joined) {
          setError('');
          setOption(1);
          console.log("joinedddd");
          console.log("response = ",response);
          props.setCurrentPlayers(response.player);
          props.setColor(response.color);
          navigate('/game');
        } else {
          setOption(0);
          setError('Unable to join a random room');
        }
      }
    );
  };

  const handleUsername = () => {
    if (props.username.trim() === '') {
      setMessage('Enter username first');
      return;
    }
    setShowButton(true);
    setMessage('');
  };

  return (
      <div className="frontpage-container">
      <h1 className="title">Welcome to Ludo</h1>

      {!showButton ? (
        <div className="username-section">
          <input
            className="username-input"
            type="text"
            placeholder="Enter your name"
            value={props.username}
            onChange={(e) => props.setUsername(e.target.value)}
          />
          <div className="player-count-group">
            <h4>Select number of players:</h4>
            <label>
              <input
                type="radio"
                name="playerCount"
                value={2}
                checked={playerCount === 2}
                onChange={() => setPlayerCount(2)}
              />
              2 Players
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="playerCount"
                value={3}
                checked={playerCount === 3}
                onChange={() => setPlayerCount(3)}
              />
              3 Players
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="playerCount"
                value={4}
                checked={playerCount === 4}
                onChange={() => setPlayerCount(4)}
              />
              4 Players
            </label>
          </div>
          <button className="primary-button" onClick={handleUsername}>
            Save Name
          </button>
          {message && <p className="info-message">{message}</p>}
        </div>
      ) : (
        <div className="room-options">
          <button className="primary-button" onClick={handleCreateRoom} disabled = {option!=0?true :false}
>
            Create Private Room
          </button>
          <button
  
            className="secondary-button"
            disabled = {option!=0 && option!=1?true :false}
            onClick={() => setAction('join')}
          >
            Join Private Room
          </button>
          <button className="secondary-button" onClick={handleJoinRandom} disabled = {option !=0?true : false}>
            Join Random Room
          </button>

          {action === 'join' && (
            <div className="join-section">
              <input
                className="room-input"
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <button className="join-button" onClick={handleJoinRoom}>
                Join
              </button>
            </div>
          )}

          {/* {action === 'create' && generatedRoomCode && (
            <div className="created-room-section">
              <p>Room Created! Share this code:</p>
              <code className="room-code">{generatedRoomCode}</code>
              <br />
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedRoomCode);
                  alert('Room code copied to clipboard!');
                }}
              >
                Copy Code
              </button>
              <button
                className="go-button"
                onClick={() => navigate('/game')}
              >
                Go to Game
              </button>
            </div>
          )} */}

          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default FrontPage;

// import React from 'react'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom';


// const FrontPage = (props) => {
//   const [showButton,setShowButton] = useState(false);
//   const [message,setMessage] = useState("");
//   const [action,setAction] = useState(null);
//   const [roomCode,setRoomCode] = useState("");
//   const [generatedRoomCode,setGenRoomCode] = useState("");
//   const [playerCount,setPlayerCount] = useState(4);
//   const [error,setError] = useState("");
//   const navigate = useNavigate();

//   const handleCreateRoom = ()=>{
//     setAction("create");

//     if (!props.socket.current?.connected)
//     props.socket.current = io(import.meta.env.VITE_SERVER_URL);

//     props.socket.current.emit("create-room",username,playerCount,(response)=>{
//       if(response.roomcode){  
//         setGenRoomCode(response.roomcode);
//       }else{
//         setError("Room creation failed");
//       }
//     });
//   };

//   const handleJoinRoom= ()=>{
//     if(roomCode.trim()){
//       setError("Enter valid room code");
//       return;
//     }
//     if (!props.socket.current?.connected)
//     props.socket.current = io(import.meta.env.VITE_SERVER_URL);
    
//     props.socket.current.emit("join-room",roomCode.trim(),username,(response)=>{
//       if(response.error){
//         setError(response.error);
//       }
//       else{
//         setError("");
//         navigate("/game")
//       }
//     });
//   };

//   const handleJoinRandom = ()=>{
//     if (!props.socket.current?.connected)
//     props.socket.current = io(import.meta.env.VITE_SERVER_URL);

//     props.socket.current.emit("join-random",username,playerCount,(response)=>{
//         if(response.joined){
//           setError("");
//           navigate("/game");
//         }
//         else{
//           setError("unable to join a random room");
//         }
//     });
//   };


//   function handleUsername(e){
//     if(props.username === ""){
//         setMessage("enter username first");
//         return;
//     }
//     setShowButton(true);
//     setMessage("button appearing on screen");
//   }
//   return (
//     <div className='frontpage-container'>
//       <h1>Welcome to Ludo</h1>
//       {!showButton?
//       <div>
//       <input type = "text" placeholder='Enter your name' value = {props.username} onChange = {(e)=>{props.setUsername(e.target.value)}}></input>
     
//         <div className="player-count-group">
//   <h4>Select number of players:</h4>
//   <label>
//     <input
//       type="radio"
//       name="playerCount"
//       value={2}
//       checked={playerCount === 2}
//       onChange={() => setPlayerCount(2)}
//     />
//     2 Players
//   </label>
//   <br />
//   <label>
//     <input
//       type="radio"
//       name="playerCount"
//       value={3}
//       checked={playerCount === 3}
//       onChange={() => setPlayerCount(3)}
//     />
//     3 Players
//   </label>
//   <br />
//   <label>
//     <input
//       type="radio"
//       name="playerCount"
//       value={4}
//       checked={playerCount === 4}
//       onChange={() => setPlayerCount(4)}
//     />
//     4 Players
//   </label>
// </div>

//       <button onClick={handleUsername}>Save Name</button>
//       {message}
//       </div> :
//       <div>
//         <button onClick = {handleCreateRoom}>Create Private Room</button>
//         <button onClick={()=>{setAction("join")}}>Join Private Room</button>
//         <button onClick={handleJoinRandom}>Join Random Room</button>
      
//         {
//           action === 'join' && (
//             <div>
//               <input type = "text" placeholder='Enter Room Code' value = {roomCode} onClick={(e)=>{setRoomCode(e.target.value)}}></input>
//               <button onClick = {handleJoinRoom}>Join</button>
//             </div>
//           )
//         }
//         {
//          action === "create" && generatedRoomCode && (
//     <div>
//       <p>Room Created! Share this code:</p>
//       <code>{generatedRoomCode}</code>
//       <button onClick={() => {
//         navigator.clipboard.writeText(generatedRoomCode);
//         alert("Room code copied to clipboard!");
//       }}>
//         Copy Code
//       </button>
//       <br />
//       <button onClick={() => navigate("/game")}>
//         Go to Game
//       </button>
//     </div>
//   )
//         }
//         {
//           error && <p>{error}</p>
//         }
//       </div>
//       }

//     </div>
//   )
// }

// export default FrontPage

// // import React, { useEffect, useState } from 'react'
// // import { io } from 'socket.io-client';
// // import { useNavigate } from 'react-router-dom';


// // const FrontPage = (props) => {

// //     useEffect(()=>{
// //     props.socket.current = io(import.meta.env.VITE_SERVER_URL,
// //       {
// //         query: {
// //           name: props.username,
// //         }
// //       }
// //     );
// //     props.socket.current.on("connect", () => {
// //       console.log("Connected to server");
// //     });
// //     //now we wait to user  to do things
// //     },[])

// //     const Connection = ()=>{
// //         if(option === 1){
// //           // join any local room
// //         }
// //         else if(option===2){
// //           //create your custom room
// //           //create-room 
// //         }
// //         else{
// //             // join a custom room 
// //             //join-room
// //         }
// //     }

// //     const [message,setMessage] = useState("")
// //     const navigate = useNavigate();
// //     function JoinOperation(event){
// //         if(username === ""){
// //             setMessage("Enter username First");
// //             return;
// //         }
// //         navigate("/game");
// //     }
// //     return (
// //     <div disable = {option!=0 ? true : false}>
// //         <div>Welcome to Ludo</div>
// //         { props.option == 0 ?
// //         <div>
// //         <label htmlFor='username'>Username :</label>
// //         <input type = "text" key = {username} placeholder='Enter name' onChange={(e)=>{
// //                 props.setUsername(e.target.value);
// //         }}></input>
// //         <button onClick={()=>{
// //             props.setOption(1);
// //             con
// //         }}>Join Random Room</button>
// //         <button onClick={()=>{
// //             props.setOption(2);
// //         }}>Join Existing Room</button>
// //         <button onClick={()=>{
// //            props.setOption(3);
// //         }}>Create Room</button>
// //         </div>
// //         :
// //         <div>
// //             <button onClick={JoinOperation}>start</button>
// //             {message}
// //         </div>
// //     }
// //     </div>
// //   )
// // }

// // export default FrontPage