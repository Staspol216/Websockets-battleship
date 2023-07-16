import { wss } from "../server/ws";
import { DB } from "../db";
import playerService from "../player/player-service";
import RoomService from "./room-service";
import WebSocket from 'ws';

class RoomController {
    public async create(ws: WebSocket) {
        const playerRoomCreatorId = DB.CLIENTS.get(ws);
        if (!playerRoomCreatorId) return
        const newRoom = RoomService.create(playerRoomCreatorId);
        return newRoom
    }

    public async addPlayer(ws: WebSocket, payload) {
        const playerId = DB.CLIENTS.get(ws);
        if (!playerId) return
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
        console.log(response.type, rooms);
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