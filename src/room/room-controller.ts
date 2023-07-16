import { wss } from "../server/ws";
import { CLIENTS } from "../db";
import playerService from "../player/player-service";
import RoomService from "./room-service";
import WebSocket from 'ws';

class RoomController {
    public async create(ws) {
        const playerRoomCreatorId = CLIENTS.get(ws);
        const newRoom = RoomService.create(playerRoomCreatorId);
        return newRoom
    }

    public async addPlayer(ws, payload) {
        const playerId = CLIENTS.get(ws);
        const player = playerService.getPlayerById(playerId)
        const { indexRoom } = payload;
        // handle Error
        if (!indexRoom || !player) throw new Error('something went wrong')

        const room = RoomService.addPlayer(indexRoom, player);

        return room
    }

    public async updateRoom() {
        const rooms = RoomService.getAll();

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

    public async removeRoomById(id: string) {
        RoomService.removeById(id)
    }
}

export default new RoomController();