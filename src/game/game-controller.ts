import { Games } from "../db";
import WebSocket from 'ws';

class GameController {
    async create(wss, ws, CLIENTS) {
        const idPlayer = CLIENTS.get(ws);

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

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });

    }
}

export default new GameController();