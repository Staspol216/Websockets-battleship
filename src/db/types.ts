export interface User {
    name: string;
    password: string;
    index: string;
}

export interface Room {
    roomId: string;
    roomUsers: Omit<User, "password">[]
}

export interface Winner {
    name: string;
    wins: number;
}

export interface Coord {
    x: number,
    y: number,
}

export interface ShipPosition extends Coord {
    damaged: boolean;
}
export interface Ship {
    position: Coord;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

interface GamePlayer {
    id: string;
    ships: ShipPosition[][];
}

export interface Game {
    idGame: string; 
    players: GamePlayer[];
    activePlayer: string;
}

export interface DBType {
    users: User[];
    rooms: Room[];
    games: Game[];
    winners: Winner[];
    CLIENTS: Map<any, string>;
    USERS_GAME_SHIPS: Map<string, any>;
}

