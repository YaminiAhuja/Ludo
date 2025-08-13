import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { RoomManager } from './classes/Rooms/RoomManager.js';
import { GameManager } from './classes/Game/GameManager.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const  server = createServer(app);
const io = new Server(server,{
    cors:{
    origin : process.env.USER_WEBSITE,
    methods :['GET','POST','PUT','DELETE','OPTIONS'],
    credentials : true 
    }
});

//middleware
app.use(cors({
    origin : process.env.USER_WEBSITE,
    methods :['GET','POST','PUT','DELETE','OPTIONS'],
    credentials : true 
}))


const roomManager = new RoomManager();

io.on("connection",(socket)=>{
    console.log(socket.id);
    socket.on("create-room",(name,maxPlayers =4 ,callback)=>{
        const room = roomManager.createRoom(socket,name,maxPlayers);
        socket.join(room.code);
        const currentPlayer = room.player.find(p => p.socket.id === socket.id);
        const playerColor = currentPlayer?.color
        callback({roomcode : room.code,player:room.getPlayerList(),color : playerColor,owner: socket.id}); 
    });

    socket.on("join-room",(roomCode,name,callback)=>{
        const room = roomManager.joinRoom(roomCode,socket,name);
        if(!room){
            callback({error : "Room is invalid,full or the game has already started"});
            return;
        }
        socket.join(room.code);
        const currentPlayer = room.player.find(p => p.socket.id === socket.id);
        const playerColor = currentPlayer?.color
        io.to(socket.id).emit("update-lobby",room.getPlayerList());
        io.to(room.code).emit("update-lobby",room.getPlayerList());
        
         if(room.isFull()){
                room.startGame(); 
                const gameManager = new GameManager(io, room);
                room.gameManager = gameManager;
            }

        callback({success : true,roomcode : room.code,color : playerColor,player: room.getPlayerList()});
    });

    socket.on("quit-game",()=>{
         const room = roomManager.leaveRoom(socket.id);
        if(room){
            console.log(room.getPlayerList());
            io.to(room.code).emit("update-lobby", room.getPlayerList());
        }
        console.log(`User disconnected: ${socket.id}`);

    })

    socket.on("join-random",(name,maxPlayers=4,callback)=>{
        let room = roomManager.getAvailableRandomRoom(maxPlayers);
        if(room){
            room.addPlayer(socket,name);
            socket.join(room.code);
            console.log("updatinggg");
            const currentPlayer = room.player.find(p => p.socket.id === socket.id);
            const playerColor = currentPlayer?.color
            io.to(socket.id).emit("update-lobby",room.getPlayerList());
            io.to(room.code).emit("update-lobby",room.getPlayerList());
            
            if(room.isFull()){
                room.startGame(); 
                roomManager.removeFromPending(room.code);
                const gameManager = new GameManager(io, room);
                room.gameManager = gameManager;
            }

            callback({ roomCode: room.code, player: room.getPlayerList(),color : playerColor, joined: true });
        }
        else{
            room = roomManager.createRoom(socket,name,maxPlayers,true);
            socket.join(room.code);
            const currentPlayer = room.player.find(p => p.socket.id === socket.id);
            const playerColor = currentPlayer?.color
            io.to(room.code).emit("update-lobby",room.getPlayerList());
            callback({ roomCode: room.code, player: room.getPlayerList(),color : playerColor, joined: true });

        }
    })

    socket.on("disconnect",()=>{
        const room = roomManager.leaveRoom(socket.id);
        if(room){
            console.log(room.getPlayerList());
            io.to(room.code).emit("update-lobby", room.getPlayerList());
        }
        console.log(`User disconnected: ${socket.id}`);

    })

});


// let rooms = []

// let users = 0;
// let userArray = [];
// let players = ["blue","red","green","yellow"];
// let roomId = 1;
// let currentplayerarr = []
// io.on("connection",(socket)=>{
//     const name = socket.handshake.query.name;
//     console.log(name);
//     console.log("user connected to our server with id = ",socket.id);
//     socket.join(`room-${roomId}`);
   
//     socket.on("disconnect",()=>{
//         console.log(socket);
//     })
//     currentplayerarr.push({name,'color':players[users]});
//     io.to(`room-${roomId}`).emit("user-joined",`user ${socket.id} is joining the game,
//         waiting for the rest to join to the game`,currentplayerarr)
//     userArray.push([socket.id , players[users],socket]);
//     users++;
//     if(users==4){
//     // if(users==1){
//         const safeUserArray = userArray.map(([idArr, color, _socket]) => [idArr, color,_socket]);
//         Ludo(io,safeUserArray,`room-${roomId}`);
//         currentplayerarr = []
//         userArray.splice(0);
//         users = 0;
//         roomId++;
//     }
// })


server.listen(port,()=>{
    console.log("app running on port",port);
})

