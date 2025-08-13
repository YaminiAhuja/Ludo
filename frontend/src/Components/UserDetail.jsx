import React from 'react';
import './UserDetail.css';
import click from '../assets/mixkit-fast-double-click-on-mouse-275.wav'
import { useSound } from './useSound.jsx';
import { useNavigate } from 'react-router-dom';
const UserDetail = (props) => {
  const [clickSound,pauseClickSound]= useSound(click); 
  const navigate = useNavigate()
  function handlequit(e){
    props.setRoom(false);
    clickSound();
    props.socket.emit("quit-game");
      navigate("/")
  }
  
  return (
    <div
      className={`user-card ${props.isTurn ? 'glow' : ''}`}
      style={{ backgroundColor: props.color ? props.color : "pink" }}
    >
      <div className="user-name">{(props.isTurn && props.myColor ===props.color) ? "Your turn" : props.name}</div>      
      {props.myColor ==props.color ? <button className="quit-button" onClick={handlequit}>Quit</button> : ""}
    </div>
  );
};

export default UserDetail;

// import React from 'react';
// import './UserDetail.css';

// const UserDetail = (props) => {
//   return (
//     <div className={`user-detail-card ${props.isTurn ? 'glow' : ''}`}>
//       <div className="user-info">
//         <span className="user-name">{props.name}</span>
//         <span className="user-color" style={{ backgroundColor: props.color }}></span>
//       </div>
//       <button className="quit-button">Quit</button>
//     </div>
//   );
// };

// export default UserDetail;