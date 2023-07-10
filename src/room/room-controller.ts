import { CLIENTS } from "../db";
import playerService from "../player/player-service";
import RoomService from "./room-service";
import WebSocket from 'ws';

class RoomController {
    async create(ws) {
        const playerRoomCreatorId = CLIENTS.get(ws);
        await RoomService.create(playerRoomCreatorId);
    }

    async addPlayer(ws, payload) {
        const playerId = CLIENTS.get(ws);
        const player = await playerService.getPlayerById(playerId)
        const { indexRoom } = payload;
        // handle Error
        if (!indexRoom || !player) return

        await RoomService.addPlayer(indexRoom, player);
    }

    async updateRoom(wss) {
        const rooms = await RoomService.getAll();

        const response = {
            type: "update_room",
            data: JSON.stringify(rooms),
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

export default new RoomController();