import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import './Board.css'
import { useEffect } from 'react';
import { useState } from 'react';
const Board = ({pieces,currentPlayer,ActivePiecesArr,socket}) => {
const [location,setLocation] = useState([]);
const [piecesVal,setPiecesVal] = useState([]);
const keys = Object.keys(pieces);
useEffect(()=>{
const loc = [];
const p = []
for (let k = 0; k < keys.length; k++) {
    const team = keys[k]; 
    const teamPieces = pieces[team];

    for (let i = 0; i < teamPieces.length; i++) {
        const piece = teamPieces[i];
        loc.push(piece.position); 
        p.push(piece);
    }
}
setLocation(loc);
setPiecesVal(p);
},[pieces,ActivePiecesArr])
let ActiveLocations = [];
ActivePiecesArr.forEach(element => {
    ActiveLocations.push(element.id);
});

console.log(ActiveLocations);
const BluePathDiv = ["b5","bh5","y6","b4","bh4","y7","b3","bh3","y8","b2","bh2","y9","b1","bh1","y10","y13","y12","y11"];
const blueColorPath = ["bh4","bh3","bh2","b1","bh1","bh5"];
const YellowPathDiv = ["g6","g7","g8","g9","g10","g11","yh1","yh2","yh3","yh4","yh5","g12","y5","y4","y3","y2","y1","g13"];
const yellowColorPath = ["yh4","yh3","yh2","y1","yh1","yh5"];
const RedPathDiv = ["b13","r1","r2","r3","r4","r5","b12","rh1","rh2","rh3","rh4","rh5","b11","b10","b9","b8","b7","b6"];
const redColorPath = ["rh4","rh3","rh2","r1","rh1","rh5"];
const GreenPathDiv = ["r11","r12","r13","r10","gh1","g1","r9","gh2","g2","r8","gh3","g3","r7","gh4","g4","r6","gh5","g5"]
const greenColorPath = ["gh4","gh3","gh2","g1","gh1","gh5"];
const home = ["home-1","home-2","home-3","home-4"];

function PiecePathClicked(p){
    console.log("piece clicked = ",p);
    socket.emit("piece-selected",p);
}

function PieceClicked(event){
    console.log("piece clicked = ",event.currentTarget.id);
    socket.emit("piece-selected",event.currentTarget.id);

}


return (
    <div className='w-full h-full'>
    <div className="ludoContainer">
        <div id="ludoboard">
            <div id="red-board" className ={`board ${currentPlayer === 'red'? 'active': ""}`}>
                <div>
                  {
                    home.map((index)=>{
                        const indexVal = `red-${index}`;
                        if(location.includes(indexVal)){
                        return <span key = {indexVal} id = {indexVal}>
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
                         icon={faCircle} className = {`piece 
                         ${piecesVal[location.indexOf(indexVal)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? `${piecesVal[location.indexOf(indexVal)].team}-active` : ""}`} 
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? PieceClicked :()=>{}}
                         />
                        </span>
                        }
                        else{
                            return <span key={indexVal} id = {index}>
                        </span>
                        }
                    }) 
            
                  }  
                </div> 
            

            </div>
            <div id="green-path" className="verticalPath">

                   {GreenPathDiv.map((index)=>{

                    let piecesInThis =  location.map((loc,i)=>({loc,piece : piecesVal[i]})).filter(({loc})=>(loc ===index));
                    let activePieces = piecesInThis.filter(({loc,piece})=>(ActiveLocations.includes(piece.id))).map(({loc,piece})=>(piece.id));
                    // console.log("ActivePieces = ",activePieces);
                    return <div key = {index}  className={`ludobox ${greenColorPath.includes(index) ? "greenLudoBox" : ""} ${index === 'r9' ? 'special' : ''}` } id = {index}
                      onClick={(activePieces.length>0 ? ()=>{PiecePathClicked(activePieces[0])}: ()=>{})}
                    >
                     <div className="piece-container">
                    {
                        piecesInThis.map(({piece},i)=>{
                        return <FontAwesomeIcon key =  {`${piece.id}`} id = {`${piece.id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piece.team}-piece ${ActiveLocations.includes(`${piece.id}`)? `${piece.team}-active` : ""}`} 
                         />
                        })
                    }
                    </div>
                    </div>
                })}
                  
                   {/* {
                    GreenPathDiv.map((index)=>{
                        if(location.includes(index)){
                            return (<div key = {index} className={`ludobox ${greenColorPath.includes(index) ? "greenLudoBox" : ""} ${index === 'r9' ? 'special' : ''}`} id = {index}>
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piecesVal[location.indexOf(index)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? `${piecesVal[location.indexOf(index)].team}-active` : ""}`}
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? PieceClicked :()=>{}}
                         />
                    </div>)
                        }
                        else{
                            return (<div key = {index} className={`ludobox ${greenColorPath.includes(index) ? "greenLudoBox" : ""} ${index === 'r9' ? 'special' : ''}`} id = {index}></div>)
                        }
                    })
                } */}
            </div>
            <div id="green-board" className={`board ${currentPlayer === 'green'? 'active': ""}`}>
                   <div>
                       {
                    home.map((index)=>{
                        const indexVal = `green-${index}`;
                        if(location.includes(indexVal)){
                        return <span key = {indexVal} id = {indexVal}>
                        <FontAwesomeIcon key = {index} id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
                         icon={faCircle} className = {`fa-location-pin piece 
                        ${piecesVal[location.indexOf(indexVal)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? `${piecesVal[location.indexOf(indexVal)].team}-active` : ""}`}
                        onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? PieceClicked :()=>{}}
                        />
                        </span>
                        }
                        else{
                            return <span key ={indexVal} id = {index}>
                        </span>
                        }
                    }) 
            
                  }  
                </div> 
            </div>
            <div id="red-path" className="horizontalPath">

                 {RedPathDiv.map((index)=>{

                    let piecesInThis =  location.map((loc,i)=>({loc,piece : piecesVal[i]})).filter(({loc})=>(loc ===index));
                   
                    let activePieces = piecesInThis.filter(({loc,piece})=>(ActiveLocations.includes(piece.id))).map(({loc,piece})=>(piece.id));
                    // console.log("ActivePieces = ",activePieces);
                    
                    return <div key = {index}  className={`ludobox ${redColorPath.includes(index) ? "redLudoBox" : ""} ${index === 'b9' ? 'special' : ''}` } id = {index}
                      onClick={(activePieces.length>0 ? ()=>{PiecePathClicked(activePieces[0])}: ()=>{})}
                    >
                    <div className="piece-container">

                    {
                        piecesInThis.map(({piece},i)=>{
                        return <FontAwesomeIcon key =  {`${piece.id}`} id = {`${piece.id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piece.team}-piece ${ActiveLocations.includes(`${piece.id}`)? `${piece.team}-active` : ""}`} 
                        //  onClick={ActiveLocations.includes(`${piece.id}`)? PieceClicked :()=>{}}
                         />
                        })
                    }
                    </div>
                    </div>
                })}

                 {/* {
                    RedPathDiv.map((index)=>{
                        if(location.includes(index)){
                            return (<div key = {index} className={`ludobox ${redColorPath.includes(index) ? "redLudoBox" : ""} ${index === 'b9' ? 'special' : ''}`} id = {index}>
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piecesVal[location.indexOf(index)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? `${piecesVal[location.indexOf(index)].team}-active` : ""}`}
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? PieceClicked :()=>{}}
                         />
                    </div>)
                        }
                        else{
                            return (<div key = {index} className={`ludobox ${redColorPath.includes(index) ? "redLudoBox" : ""} ${index === 'b9' ? 'special' : ''}`} id = {index}></div>)
                        }
                    })
                } */}
            </div>
            <div id="win-zone"></div>
            <div id="yellow-path" className="horizontalPath">

                {YellowPathDiv.map((index)=>{

                    let piecesInThis =  location.map((loc,i)=>({loc,piece : piecesVal[i]})).filter(({loc})=>(loc ===index));
                    let activePieces = piecesInThis.filter(({loc,piece})=>(ActiveLocations.includes(piece.id))).map(({loc,piece})=>(piece.id));
                    // console.log("ActivePieces = ",activePieces);
                    // let activePieces = piecesInThis.map((p)=>{ActiveLocations.includes(`${p.id}`)});
                    // console.log("ActivePieces = ",activePieces);

                    return <div key = {index}  className={`ludobox ${yellowColorPath.includes(index) ? "yellowLudoBox" : ""} ${index === 'g9' ? 'special' : ''}` } id = {index}
                      onClick={(activePieces.length>0 ? ()=>{PiecePathClicked(activePieces[0])}: ()=>{})}
                    >
                                         <div className="piece-container">

                    {
                        piecesInThis.map(({piece},i)=>{
                        return <FontAwesomeIcon key =  {`${piece.id}`} id = {`${piece.id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piece.team}-piece ${ActiveLocations.includes(`${piece.id}`)? `${piece.team}-active` : ""}`} 
                        //  onClick={ActiveLocations.includes(`${piece.id}`)? PieceClicked :()=>{}}
                         />
                        })
                    }
                    </div>
                    </div>
                })}

                  {
                // YellowPathDiv.map((index)=>{
                    //     if(location.includes(index)){
                    //         return (<div key = {index} className={`ludobox ${yellowColorPath.includes(index) ? "yellowLudoBox" : ""} ${index === 'g9' ? 'special' : ''}`} id = {index}>
                    //     <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
                    //     className = {`fa-location-pin piece
                    //      ${piecesVal[location.indexOf(index)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? `${piecesVal[location.indexOf(index)].team}-active` : ""}`}
                    //      onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? PieceClicked :()=>{}}
                    //      />
                    // </div>)
                    //     }
                    //     else{
                    //         return (<div key = {index} className={`ludobox ${yellowColorPath.includes(index) ? "yellowLudoBox" : ""} ${index === 'g9' ? 'special' : ''}`} id = {index}></div>)
                    //     }
                    // })
                }
            </div>
            <div id="blue-board"  className={`board ${currentPlayer === 'blue'? 'active': ""}`}>
                   <div>
                    {
                    home.map((index)=>{
                        const indexVal = `blue-${index}`;
                        if(location.includes(indexVal)){
                            // console.log(indexVal + "hi");
                        return <span key= {indexVal} id = {indexVal} >
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
                         icon={faCircle} className = {`fa-location-pin piece 
                         ${piecesVal[location.indexOf(indexVal)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? `${piecesVal[location.indexOf(indexVal)].team}-active` : ""}`} 
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? PieceClicked :()=>{}}
                         />
                        </span>
                        }
                        else{
                        // console.log(indexVal + "bye");
                       return <span key = {indexVal} id = {index} >
                        </span>
                        }
                    }) 
                  }  
                </div> 
            </div>          
             <div id="blue-path" className="verticalPath">
                {/* {
                    BluePathDiv.map((index)=>{
                        if(location.includes(index)){
                        return (<div key = {index}  className={`ludobox ${blueColorPath.includes(index) ? "blueLudoBox" : ""} ${index === 'y9' ? 'special' : ''}` } id = {index}>
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piecesVal[location.indexOf(index)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? `${piecesVal[location.indexOf(index)].team}-active` : ""}`} 
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(index)].id}`)? PieceClicked :()=>{}}
                         />
                    </div>)
                        }
                        else{
                            return (<div  key = {index} className={`ludobox ${blueColorPath.includes(index) ? "blueLudoBox" : ""} ${index === 'y9' ? 'special' : ''}`} id = {index}></div>)
                        }
                    })
                } */}

                 {BluePathDiv.map((index)=>{

                    let piecesInThis =  location.map((loc,i)=>({loc,piece : piecesVal[i]})).filter(({loc})=>(loc ===index));
                    let activePieces = piecesInThis.filter(({loc,piece})=>(ActiveLocations.includes(piece.id))).map(({loc,piece})=>(piece.id));
                    // console.log("ActivePieces = ",activePieces);
                    return <div key = {index}  className={`ludobox ${blueColorPath.includes(index) ? "blueLudoBox" : ""} ${index === 'y9' ? 'special' : ''}` } id = {index}
                    onClick={(activePieces.length>0 ? ()=>{PiecePathClicked(activePieces[0])}: ()=>{})}
                    >
                    <div className="piece-container">

                    {
                        piecesInThis.map(({piece},i)=>{
                        return <FontAwesomeIcon key =  {`${piece.id}`} id = {`${piece.id}`}  icon={faCircle} 
                        className = {`fa-location-pin piece
                         ${piece.team}-piece ${ActiveLocations.includes(`${piece.id}`)? `${piece.team}-active` : ""}`} 
                        //  onClick={ActiveLocations.includes(`${piece.id}`)? PieceClicked :()=>{}}
                         />
                        })
                    }
                    </div>
                    </div>
                })}

            </div>
            <div id="yellow-board"  className={`board ${currentPlayer === 'yellow'? 'active': ""}`}>
                    <div>
                    {
                    home.map((index)=>{
                        const indexVal = `yellow-${index}`;
                        if(location.includes(indexVal)){
                        return <span key = {indexVal} id = {indexVal}>
                        <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
                         icon={faCircle} className = {`piece 
                         ${piecesVal[location.indexOf(indexVal)].team}-piece ${ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? `${piecesVal[location.indexOf(indexVal)].team}-active` : ""}`}
                         onClick={ActiveLocations.includes(`${piecesVal[location.indexOf(indexVal)].id}`)? PieceClicked :()=>{}}
                         />
                        </span>
                        }
                        else{
                            return <span key = {indexVal} id = {index}>
                        </span>
                        }
                    }) 
            
                  }  
                </div> 
            </div>

        </div>

    </div>
    </div>
  )

}
export default Board















// import React from 'react'
// import Piece from '../Components/Piece.jsx'
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCircle } from "@fortawesome/free-solid-svg-icons";
// import './Board.css'
// const Board = ({pieces}) => {
// const location = [];
// const  piecesVal = [];
// const keys = Object.keys(pieces);

// for (let k = 0; k < keys.length; k++) {
//     const team = keys[k]; 
//     const teamPieces = pieces[team];

//     for (let i = 0; i < teamPieces.length; i++) {
//         const piece = teamPieces[i];
//         location.push(piece.position); 
//         piecesVal.push(piece);
//     }
// }
// const BluePathDiv = ["b5","bh5","y6","b4","bh4","y7","b3","bh3","y8","b2","bh2","y9","b1","bh1","y10","y13","y12","y11"];
// const blueColorPath = ["bh4","bh3","bh2","b1","bh1","bh5"];
// const YellowPathDiv = ["g6","g7","g8","g9","g10","g11","yh1","yh2","yh3","yh4","yh5","g12","y5","y4","y3","y2","y1","g13"];
// const yellowColorPath = ["yh4","yh3","yh2","y1","yh1","yh5"];
// const RedPathDiv = ["b13","r1","r2","r3","r4","r5","b12","rh1","rh2","rh3","rh4","rh5","b11","b10","b9","b8","b7","b6"];
// const redColorPath = ["rh4","rh3","rh2","r1","rh1","rh5"];
// const GreenPathDiv = ["r11","r12","r13","r10","gh1","g1","r9","gh2","g2","r8","gh3","g3","r7","gh4","g4","r6","gh5","g5"]
// const greenColorPath = ["gh4","gh3","gh2","g1","gh1","gh5"];
// const home = ["home-1","home-2","home-3","home-4"];


// return (
//     <div className='w-1/2 h-1/2'>
//     <div className="ludoContainer">
//         <div id="ludoboard">
//             <div id="red-board" className ="board">
//                 <div>
//                   {
//                     home.map((index)=>{
//                         const indexVal = `red-${index}`;
//                         if(location.includes(indexVal)){
//                         return <span id = {indexVal}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf(indexVal)].team}-piece`} />
//                         </span>
//                         }
//                         else{
//                              <span id = {index}>
//                         </span>
//                         }
//                     }) 
            
//                   }  
//                 {/* { location.includes("red-home-1")  ? 
//                 <span id = "red-home-1">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("red-home-1")].id}`}  icon={faCircle} className = {`fa-location-pin piece ${piecesVal[location.indexOf("red-home-1")].team}-piece`} />
//                     </span> :
//                   <span id = "red-home-1">
//                     </span> 
//                 }

//                  { location.includes("red-home-2")  ? 
//                 <span id = "red-home-2">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("red-home-2")].id}`}  icon={faCircle} className = {`fa-location-pin piece ${piecesVal[location.indexOf("red-home-2")].team}-piece`} />
//                     </span> :
//                   <span id = "red-home-2">
//                     </span> 
//                 }
//                  { location.includes("red-home-3")  ? 
//                 <span id = "red-home-3">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("red-home-3")].id}`}  icon={faCircle} className = {`fa-location-pin piece ${piecesVal[location.indexOf("red-home-3")].team}-piece`} />
//                     </span> :
//                   <span id = "red-home-3">
//                     </span> 
//                 }
//                  { location.includes("red-home-4")  ? 
//                 <span id = "red-home-4">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("red-home-4")].id}`}  icon={faCircle} className = {`fa-location-pin piece ${piecesVal[location.indexOf("red-home-4")].team}-piece`} />
//                     </span> :
//                   <span id = "red-home-4">
//                     </span> 
//                 } */}
//                     {/* <span id = "red-home-2">
//                     </span>
//                     <span  id = "red-home-3">
//                     </span>
//                     <span id = "red-home-4">
//                     </span> }
//                 </div> 
            

//             </div>
//             <div id="green-path" className="verticalPath">
//                   {
//                     GreenPathDiv.map((index)=>{
//                         if(location.includes(index)){
//                             return (<div className={`ludobox ${greenColorPath.includes(index) ? "greenLudoBox" : ""}`} id = {index}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf(index)].team}-piece`} />
//                     </div>)
//                         }
//                         else{
//                             return (<div className={`ludobox ${redColorPath.includes(index) ? "greenLudoBox" : ""}`} id = {index}></div>)
//                         }
//                     })
//                 }
//                 {/* <div className="ludobox" id = "r11"></div> 
//                 <div className="ludobox" id = "r12"></div>
//                 <div className="ludobox" id = "r13"></div>
//                 <div className="ludobox " id = "r10"></div>
//                 <div className="ludobox greenLudoBox" id ="gh1"></div>
//                 <div className="ludobox greenLudoBox" id = "g1"></div>
//                 <div className="ludobox" id ="r9"></div>
//                 <div className="ludobox greenLudoBox" id ="gh2"></div>
//                 <div className="ludobox" id = "g2"></div>
//                 <div className="ludobox" id ="r8"></div>
//                 <div className="ludobox greenLudoBox" id ="gh3"></div>
//                 <div className="ludobox" id = "g3"></div>
//                 <div className="ludobox" id ="r7"></div>
//                 <div className="ludobox greenLudoBox" id ="gh4"></div>
//                 <div className="ludobox" id = "g4"></div>
//                 <div className="ludobox" id = "r6"></div>
//                 <div className="ludobox greenLudoBox" id ="gh5"></div>
//                 <div className="ludobox" id = "g5"></div> }
//             </div>
//             <div id="green-board" className="board">
//                    <div>
//                        {
//                     home.map((index)=>{
//                         const indexVal = `green-${index}`;
//                         if(location.includes(indexVal)){
//                         return <span id = {indexVal}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf(indexVal)].team}-piece`} />
//                         </span>
//                         }
//                         else{
//                              <span id = {index}>
//                         </span>
//                         }
//                     }) 
            
//                   }  

//                   {/* { location.includes("green-home-1")  ? 
//                 <span id = "green-home-1">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("green-home-1")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("green-home-1")].team}-piece`} />
//                     </span> :
//                   <span id = "green-home-1">
//                     </span> 
//                 }

//                  { location.includes("green-home-2")  ? 
//                 <span id = "green-home-2">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("green-home-2")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("green-home-2")].team}-piece`} />
//                     </span> :
//                   <span id = "green-home-2">
//                     </span> 
//                 }
//                  { location.includes("green-home-3")  ? 
//                 <span id = "green-home-3">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("green-home-3")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("green-home-3")].team}-piece`} />
//                     </span> :
//                   <span id = "green-home-3">
//                     </span> 
//                 }
//                  { location.includes("green-home-4")  ? 
//                 <span id = "green-home-4">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("green-home-4")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("green-home-4")].team}-piece`} />
//                     </span> :
//                   <span id = "green-home-4">
//                     </span> 
//                 } }
//                 </div> 
//             </div>
//             <div id="red-path" className="horizontalPath">

//                  {
//                     RedPathDiv.map((index)=>{
//                         if(location.includes(index)){
//                             return (<div className={`ludobox ${redColorPath.includes(index) ? "redLudoBox" : ""}`} id = {index}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf(index)].team}-piece`} />
//                     </div>)
//                         }
//                         else{
//                             return (<div className={`ludobox ${redColorPath.includes(index) ? "redLudoBox" : ""}`} id = {index}></div>)
//                         }
//                     })
//                 }

//                 {/* <div className="ludobox" id ="b13"></div> 
//                 <div className="ludobox redLudoBox" id = 'r1'></div>
//                 <div className="ludobox" id = 'r2'></div>
//                 <div className="ludobox" id = 'r3'></div>
//                 <div className="ludobox" id = 'r4'></div>
//                 <div className="ludobox" id = 'r5'></div>
//                 <div className="ludobox" id = "b12"></div>
//                 <div className="ludobox redLudoBox" id ="rh1"></div>
//                 <div className="ludobox redLudoBox" id ="rh2"></div>
//                 <div className="ludobox redLudoBox" id ="rh3"></div>
//                 <div className="ludobox redLudoBox" id ="rh4"></div>
//                 <div className="ludobox redLudoBox" id ="rh5"></div>
//                 <div className="ludobox" id = "b11"></div>
//                 <div className="ludobox" id = "b10"></div>
//                 <div className="ludobox" id = "b9"></div>
//                 <div className="ludobox" id ="b8"></div>
//                 <div className="ludobox" id = "b7"></div>
//                 <div className="ludobox" id = "b6"></div> }
//             </div>
//             <div id="win-zone"></div>
//             <div id="yellow-path" className="horizontalPath">
//                   {
//                     YellowPathDiv.map((index)=>{
//                         if(location.includes(index)){
//                             return (<div className={`ludobox ${yellowColorPath.includes(index) ? "yellowLudoBox" : ""}`} id = {index}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf(index)].team}-piece`} />
//                     </div>)
//                         }
//                         else{
//                             return (<div className={`ludobox ${yellowColorPath.includes(index) ? "yellowLudoBox" : ""}`} id = {index}></div>)
//                         }
//                     })
//                 }
//                 {/* <div className="ludobox" id = "g6"></div> 
//                 <div className="ludobox" id = "g7"></div>
//                 <div className="ludobox" id = "g8"></div>
//                 <div className="ludobox" id = "g9"></div>
//                 <div className="ludobox" id = "g10"></div>
//                 <div className="ludobox" id = "g11"></div> 
//                 <div className="ludobox yellowLudoBox" id ="yh1"></div>
//                 <div className="ludobox yellowLudoBox" id ="yh2"></div>
//                 <div className="ludobox yellowLudoBox" id ="yh3"></div>
//                 <div className="ludobox yellowLudoBox" id ="yh4"></div>
//                 <div className="ludobox yellowLudoBox" id ="yh5"></div>
//                 <div className="ludobox" id ="g12"></div>
//                 <div className="ludobox" id = "y5"></div>
//                 <div className="ludobox" id = "y4"></div>
//                 <div className="ludobox" id = "y3"></div>
//                 <div className="ludobox" id = "y2"></div>
//                 <div className="ludobox yellowLudoBox" id ="y1"></div>
//                 <div className="ludobox" id="g13"></div> }
//             </div>
//             <div id="blue-board" className="board">
//                    <div>

//                     {
//                     home.map((index)=>{
//                         const indexVal = `blue-${index}`;
//                         if(location.includes(indexVal)){
//                         return <span id = {indexVal}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf(indexVal)].team}-piece`} />
//                         </span>
//                         }
//                         else{
//                              <span id = {index}>
//                         </span>
//                         }
//                     }) 
            
//                   }  

//                        {/* { location.includes("blue-home-1")  ? 
//                 <span id = "blue-home-1">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("blue-home-1")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("blue-home-1")].team}-piece`} />
//                     </span> :
//                   <span id = "blue-home-1">
//                     </span> 
//                 }

//                  { location.includes("blue-home-2")  ? 
//                 <span id = "blue-home-2">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("blue-home-2")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("blue-home-2")].team}-piece`} />
//                     </span> :
//                   <span id = "blue-home-2">
//                     </span> 
//                 }
//                  { location.includes("blue-home-3")  ? 
//                 <span id = "blue-home-3">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("blue-home-3")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("blue-home-3")].team}-piece`} />
//                     </span> :
//                   <span id = "blue-home-3">
//                     </span> 
//                 }
//                  { location.includes("blue-home-4")  ? 
//                 <span id = "blue-home-4">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("blue-home-4")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("blue-home-4")].team}-piece`} />
//                     </span> :
//                   <span id = "blue-home-4">
//                     </span> 
//                 } }
//                 </div> 
//             </div>          
//              <div id="blue-path" className="verticalPath">
                
//                 {
//                     BluePathDiv.map((index)=>{
//                         if(location.includes(index)){
//                             return (<div className={`ludobox ${blueColorPath.includes(index) ? "blueLudoBox" : ""}`} id = {index}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(index)].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf(index)].team}-piece`} />
//                     </div>)
//                         }
//                         else{
//                             return (<div className={`ludobox ${blueColorPath.includes(index) ? "blueLudoBox" : ""}`} id = {index}></div>)
//                         }
//                     })
//                 }

//                  {/* { location.includes("b5")  ? 
//                <div className="ludobox" id = "b5">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("b5")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("b5")].team}-piece`} />
//                     </div> :
//                   <div className="ludobox" id = "b5"></div>
//                 }

//                 {/* <div className="ludobox" id = "b5"></div> }
//                      { location.includes("bh5")  ? 
//                <div className="ludobox" id = "bh5">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("bh5")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("bh5")].team}-piece`} />
//                     </div> :
//                   <div className="ludobox" id = "bh5"></div>
//                 }

//                 {/* <div className="ludobox blueLudoBox" id = "bh5"></div> }
//                 { location.includes("y6")  ? 
//                <div className="ludobox" id = "y6">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("y6")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("y6")].team}-piece`} />
//                     </div> :
//                   <div className="ludobox" id = "y6"></div>
//                 }
//                     ["bh4","bh3","bh2","b1","bh1","bh5"]
//                 <div className="ludobox" id = "y6"></div>
//                 <div className="ludobox" id = "b4"></div>
//                 <div className="ludobox blueLudoBox" id = "bh4"></div>
//                 <div className="ludobox" id ="y7"></div>
//                 <div className="ludobox" id = "b3"></div>
//                 <div className="ludobox blueLudoBox" id = "bh3"></div>
//                 <div className="ludobox" id = "y8"></div>
//                 <div className="ludobox" id ="b2"></div>
//                 <div className="ludobox blueLudoBox" id = "bh2"></div>
//                 <div className="ludobox" id="y9"></div>
//                 <div className="ludobox blueLudoBox" id = "b1"></div>
//                 <div className="ludobox blueLudoBox" id = "bh1"></div>
//                 <div className="ludobox" id = "y10"></div>
//                 <div className="ludobox" id="y13"></div>
//                 <div className="ludobox" id = "y12"></div>
//                 <div className="ludobox" id = "y11"></div> }
//             </div>
//             <div id="yellow-board" className="board">
//                     <div>
//                     {
//                     home.map((index)=>{
//                         const indexVal = `yellow-${index}`;
//                         if(location.includes(indexVal)){
//                         return <span id = {indexVal}>
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf(indexVal)].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf(indexVal)].team}-piece`} />
//                         </span>
//                         }
//                         else{
//                              <span id = {index}>
//                         </span>
//                         }
//                     }) 
            
//                   }  
//                     { { location.includes("yellow-home-1")  ? 
//                 <span id = "yellow-home-1">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("yellow-home-1")].id}`}  icon={faCircle} 
//                         className = {`fa-location-pin piece
//                          ${piecesVal[location.indexOf("yellow-home-1")].team}-piece`} />
//                     </span> :
//                   <span id = "yellow-home-1">
//                     </span> 
//                 }

//                  { location.includes("yellow-home-2")  ? 
//                 <span id = "yellow-home-2">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("yellow-home-2")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("yellow-home-2")].team}-piece`} />
//                     </span> :
//                   <span id = "yellow-home-2">
//                     </span> 
//                 }
//                  { location.includes("yellow-home-3")  ? 
//                 <span id = "yellow-home-3">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("yellow-home-3")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("yellow-home-3")].team}-piece`} />
//                     </span> :
//                   <span id = "yellow-home-3">
//                     </span> 
//                 }
//                  { location.includes("yellow-home-4")  ? 
//                 <span id = "yellow-home-4">
//                         <FontAwesomeIcon id = {`${piecesVal[location.indexOf("yellow-home-4")].id}`} 
//                          icon={faCircle} className = {`fa-location-pin piece 
//                          ${piecesVal[location.indexOf("yellow-home-4")].team}-piece`} />
//                     </span> :
//                   <span id = "yellow-home-4">
//                     </span> 
//                 } }
//                 </div> 
//             </div>

//         </div>

//     </div>
//     </div>
//   )

// }
// export default Board
