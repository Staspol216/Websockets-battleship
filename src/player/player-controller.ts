import { authData } from "./types";
import playerService from "./player-service";

class PlayerController {

    async auth(ws, payload: authData, wsClientsMap) {

        const newlyPlayer = await playerService.auth(payload);

        wsClientsMap.set(ws, newlyPlayer.index);

        const response = {
            type: "reg",
            data: JSON.stringify(newlyPlayer),
            id: 0
        };
        
        const encodedResponse = JSON.stringify(response);
        ws.send(encodedResponse);
    }

    async updateWinners(ws) {
        const players = await playerService.getAllWithWins();
        ws.send(players)

    }
}

export default new PlayerController();