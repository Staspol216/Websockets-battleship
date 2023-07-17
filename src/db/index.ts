import { DBType } from "./types";


export const DB: DBType = {
    users: [],
    rooms: [],
    games: [],
    winners: [],
    CLIENTS: new Map(),
    USERS_GAME_SHIPS: new Map()
}