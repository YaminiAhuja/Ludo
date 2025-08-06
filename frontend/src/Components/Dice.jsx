import React, { useState } from 'react'
import  Dice1 from '../assets/dice-six-faces-1.png'
import  Dice2 from '../assets/dice-six-faces-2.png'
import Dice3 from  '../assets/dice-six-faces-3.png'
import Dice4 from  '../assets/dice-six-faces-4.png'
import Dice5 from '../assets/dice-six-faces-5.png'
import Dice6 from  '../assets/dice-six-faces-6.png'
import  DiceGif from '../assets/roll_dice.gif'
import { useEffect } from 'react'
import './Dice.css'
const Dice = (props) => {
  console.log(props);
  const [imgSrc,setImgSrc] = useState(Dice1);
  const Dice = [Dice1,Dice2,Dice3,Dice4,Dice5,Dice6];
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