import { Player } from "../db/types";
import { Players, Rooms } from "../db";
import { randomUUID } from "crypto";


class RoomService {
    create(creatorId) {

        const PlayerCreatorData = Players.find((player) => player.index === creatorId);

        // handle error
        if (!PlayerCreatorData) return

        const { password, ...playerDataWithoutPassword } = PlayerCreatorData;

        const newRoom = {
            roomId: randomUUID(),
            roomUsers: [ playerDataWithoutPassword ]
        };

        Rooms.push(newRoom);
        console.log(Rooms);
    }

    addPlayer(indexRoom: string, player: Player) {
        const room = this.getById(indexRoom);
        if (!room) return

        room.roomUsers.push(player)
        
        if (room.roomUsers.length === 2) {
            this.removeById(room.roomId)
        }
    }

    removeById(id: string) {
        const roomIndex = Rooms.findIndex(room => room.roomId === id)
        return Rooms.splice(roomIndex, 1)
    }

    getById(id: string) {
        return Rooms.find(room => room.roomId === id)
    }

    getAll() {
        return Rooms
    }
}

export default new RoomService();