export class Rooms {
    constructor(code, ownerSocket, ownerName, maxPlayer = 4) {
        this.code = code;
        this.ownerSocket = ownerSocket;
        this.player = [{ socket: ownerSocket, name: ownerName, color: 'red' }];
        this.maxPlayer = maxPlayer;
        this.started = false;
        this.colors = ['red', 'blue', 'green', 'yellow']
        this.gameManager = null;
    }
    addPlayer(socket, name) {
        if (this.player.length >= this.maxPlayer || this.started === true) return false;

        const takenColors = this.player.map(p => p.color);
        const availableColor = this.colors.find(colors => !takenColors.includes(colors));
        if (!availableColor) return false;

        this.player.push({ socket, name, color: availableColor });
        return availableColor;
    }
    removePlayer(socketId) {
        this.player = this.player.filter(p => p.socket.id !== socketId);
    }
    getPlayer(socketId) {
        console.log("Searching player in room:", this.code, "for socketId:", socketId, "=> Found:");
        return this.player.find((p) => p.socket.id == socketId);
    }
    isFull() {
        return this.player.length === this.maxPlayer
    }
    isEmpty() {
        return this.player.length === 0;
    }
    startGame() {
        this.started = true;
    }
    getPlayerList() {
        return this.player.map((player) => ({ name: player.name, color: player.color }));
    }
}