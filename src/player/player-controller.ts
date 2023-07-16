import { authData } from "./types";
import playerService from "./player-service";
import { DB } from "../db";
import { wss } from "../server/ws";

class PlayerController {

    async auth(ws: WebSocket, payload: authData) {

        const newlyPlayer = await playerService.auth(payload);

        DB.CLIENTS.set(ws, newlyPlayer.index);

        const response = {
            type: "reg",
            data: JSON.stringify(newlyPlayer),
            id: 0
        };
        
        const encodedResponse = JSON.stringify(response);
        ws.send(encodedResponse);
    }

    async updateWinners() {
        wss.clients.forEach((client) => {

            const response = {
                type: "update_winners",
                data: JSON.stringify(DB.winners),
                id: 0
            };
            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }
}

export default new PlayerController();