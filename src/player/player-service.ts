import { randomUUID } from "crypto";
import { DB } from "../db";
import { authData } from "./types";



class PlayerService {
    auth(authData: authData) {

        const playerIndex = DB.users.findIndex((player) => player.name === authData.name);

        if (playerIndex === -1) {
            const newUser = { index: randomUUID() , ...authData };
            DB.users.push(newUser);
            const { name, index } = newUser;
            return {
                name,
                index,
                error: false,
                errorText: ''
            }
        } else {

            if (authData.password === DB.users[playerIndex].password) {
                const { password, ...responseData } = DB.users[playerIndex];
                return {
                    ...responseData,
                    error: false,
                    errorText: ''
                };
            } else {
                const { password, ...responseData } = DB.users[playerIndex];
                return {
                    ...responseData,
                    error: true,
                    errorText: 'Incorrect password'
                }
            }

        }
    }

    getPlayerById(playerId: string) {
        return DB.users.find(player => player.index === playerId);
    }
}

export default new PlayerService();