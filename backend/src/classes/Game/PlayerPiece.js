export class Player_Piece{
    constructor(team,position,homePosition,homePathEntry,id,gameEntry){
        this.team = team;
        this.position = position;
        this.homePosition = homePosition;
        this.homePathEntry = homePathEntry;
        this.id = id;
        this.gameEntry = gameEntry;   
        this.status = 0; //locked-0 && unlock-1
    }
    unlock(){
        this.status = 1;
        this.position = this.gameEntry;
    }
    updatePosition(position){
        this.position = position;
    }
   
    sentMeToBoard(){
        this.position = this.homePosition;
        this.status = 0;
    }
}