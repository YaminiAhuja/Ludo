import React, { useEffect, useRef } from 'react'

export const useSound = (sound) => {
    const audio = useRef();
    useEffect(()=>{
        audio.current = new Audio(sound);
    },[])

    function Play(){
      const clone = audio.current.cloneNode();
      clone.play();
    //  audio.current.play();   
    }

    function Pause(){
        audio.current.pause();
        audio.current.currentTime = 0; 
    }
  return (
    [
        Play,Pause
    ]
  )
}

