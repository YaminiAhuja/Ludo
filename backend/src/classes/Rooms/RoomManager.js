import { generateRoomCode } from "./generateRoomCode.js";
import { Rooms } from "./Room.js";
export class RoomManager{
    constructor(){
        this.rooms = {}
        this.pendingRooms = []
    }
    createRoom(ownerSocket,ownerName,maxPlayer,isRandom = false){
        const code = generateRoomCode();
        const room = new Rooms(code,ownerSocket,ownerName,maxPlayer);
        this.rooms[code] = room;
        if(isRandom) this.pendingRooms.push(room);
        return room;
    }

    joinRoom(code,socket,name){
        const room = this.rooms[code];
        if(!room || room.isFull() || room.started) return false;
        room.addPlayer(socket,name);
        return room;
    }

    getAvailableRandomRoom(maxPlayer = 4){
        return this.pendingRooms.find((room)=> room.started==false && room.player.length<room.maxPlayer && room.maxPlayer === maxPlayer);
    }
    leaveRoom(socketId){
        for(const code in this.rooms){
            const room = this.rooms[code];
            if(room.getPlayer(socketId)){
                console.log("i got user")
                room.removePlayer(socketId);
                if(room.isEmpty()){
                    delete this.rooms[code];
                    this.removeFromPending(code);
                }
                if(!room.started && !this.pendingRooms.includes(room)){
                    this.pendingRooms.push(room);
                }

                return room;
            }
        }
        console.log("i didnt find any user")
        return null;
    }

    removeFromPending(roomCode){
        this.pendingRooms = this.pendingRooms.filter(room => room.code !==roomCode);
    }
    getRoom(code){
        return this.rooms[code];
    }
}
