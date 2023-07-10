import { CLIENTS, Games, USERS_GAME_SHIPS } from "../db";
import WebSocket from 'ws';

class GameController {
    async create(wss) {
        wss.clients.forEach((client) => {
            const idPlayer = CLIENTS.get(client);

            const gameData = {
                idGame: Games.length + 1,
                idPlayer
            }

            const response = {
                type: "create_game",
                data: JSON.stringify(gameData),
                id: 0
            };
        
            const encodedResponse = JSON.stringify(response);
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });

    }

    addShips(wss, ws, payload) {
        const { ships } = payload;

        const playerId = CLIENTS.get(ws);

        USERS_GAME_SHIPS.set(playerId, ships);

        console.log(USERS_GAME_SHIPS.size)
        if (USERS_GAME_SHIPS.size === 2) {

            wss.clients.forEach((client, i) => {
                const playerId = CLIENTS.get(client);
                console.log(playerId, "playerId")
                const response = {
                    type: "start_game",
                    data: JSON.stringify({
                        ships: USERS_GAME_SHIPS.get(playerId),
                        currentPlayerIndex: playerId
                    }),
                    id: 0
                }

                const encodedResponse = JSON.stringify(response);

                if (client.readyState === WebSocket.OPEN) {
                    client.send(encodedResponse);
                }
            });
        }


    }
}

export default new GameController();