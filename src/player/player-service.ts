import { randomUUID } from "crypto";
import { Players } from "../db";
import { authData } from "./types";



class PlayerService {
    auth(authData: authData) {

        const playerIndex = Players.findIndex((player) => player.name === authData.name);

        if (playerIndex === -1) {
            const newPlayer = { index: randomUUID() , ...authData };
            Players.push(newPlayer);
            const { name, index } = newPlayer;
            return {
                name,
                index,
                error: false,
                errorText: ''
            }
        } else {

            if (authData.password === Players[playerIndex].password) {
                const { password, ...responseData } = Players[playerIndex];
                return {
                    ...responseData,
                    error: false,
                    errorText: ''
                };
            } else {
                const { password, ...responseData } = Players[playerIndex];
                return {
                    ...responseData,
                    error: true,
                    errorText: 'Incorrect password'
                }
            }

        }
    }

    getPlayerById(playerId: string) {
        return Players.find(player => player.index === playerId);
    }
}

export default new PlayerService();