import React, { useState } from 'react'
import  Dice1 from '../assets/dice-six-faces-1.png'
import  Dice2 from '../assets/dice-six-faces-2.png'
import Dice3 from  '../assets/dice-six-faces-3.png'
import Dice4 from  '../assets/dice-six-faces-4.png'
import Dice5 from '../assets/dice-six-faces-5.png'
import Dice6 from  '../assets/dice-six-faces-6.png'
import click from '../assets/mixkit-fast-double-click-on-mouse-275.wav'
import diceSound from '../assets/diceland-90279.mp3'
import { useSound } from './useSound.jsx';
import  DiceGif from '../assets/roll_dice.gif'
import { useEffect } from 'react'
import './Dice.css'
const Dice = (props) => {
  console.log(props);
  const [imgSrc,setImgSrc] = useState(Dice1);
  const Dice = [Dice1,Dice2,Dice3,Dice4,Dice5,Dice6];
  const [clickSound,pauseClickSound]= useSound(click);
  const [diceClicked,pauseDiceClicked] = useSound(diceSound); 
  async function setDice(value){
    console.log(value);
    setImgSrc(DiceGif);
    const prom = new Promise((resolve,reject)=>{
        setTimeout(()=>{
        setImgSrc(Dice[value-1]);
        resolve();
        },1000)
    })
    await prom;
  }
  useEffect(()=>{
    if(props.socket)
    props.socket.on("dice-value",setDice)
  })

  function rollTheDice(){
    clickSound();
    diceClicked();
    console.log("dice rolled");
    props.socket.emit("dice-clicked",true);
    }
  return (
    <div className='dice-container'>
      <img src={imgSrc} className='dice-image'></img>
      {
      (props.turn)? <button onClick = {rollTheDice} className='roll-button'>Roll</button>:
      <button disabled className='disabled'>Roll</button>
      }
    </div>
  )
}

export default Dice