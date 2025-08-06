import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useWindowSize} from 'react-use'
import Confetti from 'react-confetti'
import './WinnerPage.css'
const WinnerPage = ({ winnerPage,socket }) => {

  

  const { width, height } = useWindowSize();
  const navigate = useNavigate();

   useEffect(()=>{

    if(!socket.current && winnerPage){
      navigate("/")
    }
  })

  // const winnerColor = winnerPage && getColorForTeam(winnerPage[0]) ||''; // Assuming first is winner

  console.log("aaa gye bhaiiii")
  return (
    <div className="winner-page-container">
      <Confetti
        width={width}
        height={height}
        numberOfPieces={300}
      />

      <div className="winner-content">
        <h1>Game Over!</h1>
        <h2>Winners:</h2>
        <div className="winner-list">
          {winnerPage && winnerPage.map((val, index) => (
            <div key={index} className="winner-name">
              {index + 1}. <span style={{ color: getColorForTeam(val) }}>{val}</span>
            </div>
          ))}
        </div>

        <button className="home-button" onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

function getColorForTeam(team) {
  switch (team) {
    case "red":
      return "#d62828";
    case "blue":
      return "#1d3557";
    case "green":
      return "#2a9d8f";
    case "yellow":
      return "#f4a261";
    default:
      return "#ffffff";
  }
}

export default WinnerPage;