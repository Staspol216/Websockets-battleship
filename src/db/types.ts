export interface Player {
    name: string;
    password: string;
    index: string;
}

export interface Room {
    roomId: string;
    roomUsers: Omit<Player, "password">[]
}

export interface Winner {
    name: string;
    wins: number;
}

export interface ShipPosition {
    x: number,
    y: number,
    damaged: boolean;
}
export interface Ship {
    position: ShipPosition,
    direction: boolean,
    length: number,
    type: "small"|"medium"|"large"|"huge",
}

interface GamePlayer {
    id: string;
    ships: ShipPosition[][]
}

export interface Game {
    idGame: string; 
    players: GamePlayer[];
    activePlayer: string;
}

