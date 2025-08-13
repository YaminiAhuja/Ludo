import React, { useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import FrontPage  from './Components/FrontPage.jsx';
import Game       from './Components/Game.jsx';
import WinnerPage from './Components/WinnerPage.jsx';

export default function MainLayout() {
  const [username,setUsername]       = useState('');
  const socket = useRef();
  const [currentPlayers, setCurrentPlayers] = useState([]);
  const [userColor,setUserColor]      = useState('');
  const [winnerList,setWinnerList]     = useState([]);
  const [generatedRoomCode, setGenRoomCode] = useState('');
  const [privateRoom,setRoom] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <FrontPage
              socket={socket}
              username={username}
              setUsername={setUsername}
              setColor={setUserColor}
              setCurrentPlayers={setCurrentPlayers}
              generatedRoomCode = {generatedRoomCode}
              setGenRoomCode = {setGenRoomCode}
              setRoom = {setRoom}
            />
          }
        />

        <Route
      
          path="/game"
          element={
            <Game
              socket={socket}
              username={username}
              setWinnerList={setWinnerList}
              currentplayers={currentPlayers}
              userColor={userColor}
              setCurrentPlayers={setCurrentPlayers}
              generatedRoomCode = {generatedRoomCode}
              setGenRoomCode = {setGenRoomCode}
              setRoom = {setRoom}
              privateRoom = {privateRoom}

            />
          }
        />

        <Route
          path="/gameOver"
          element={
            <WinnerPage
              winnerPage={winnerList}
              socket={socket}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
