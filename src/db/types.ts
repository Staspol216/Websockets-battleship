export interface Player {
    name: string,
    password: string;
    index: number
}

export interface Room {
    roomId: number;
    roomUsers: Omit<Player, "password">[]
}

export interface Game {
    idGame: number;
    idPlayer: number;
}