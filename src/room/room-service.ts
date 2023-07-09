import { Player } from "../db/types";
import { Players, Rooms } from "../db";


class RoomService {
    create(creatorId) {

        const PlayerCreatorData = Players.find((player) => player.index === creatorId);

        // handle error
        if (!PlayerCreatorData) return

        const { password, ...playerDataWithoutPassword } = PlayerCreatorData;

        const newRoom = {
            roomId: Rooms.length + 1,
            roomUsers: [ playerDataWithoutPassword ]
        };

        Rooms.push(newRoom);
        console.log(Rooms);
    }

    addPlayer(indexRoom: number, player: Player) {
        const room = this.getById(indexRoom);
        if (!room) return
        console.log(player, "player wich we add")

        room.roomUsers.push(player)
        
        if (room.roomUsers.length === 2) {
            this.removeById(room.roomId)
        }
    }

    removeById(id: number) {
        const roomIndex = Rooms.findIndex(room => room.roomId === id)
        return Rooms.splice(roomIndex, 1)
    }

    getById(id: number) {
        return Rooms.find(room => room.roomId === id)
    }

    getAll() {
        return Rooms
    }
}

export default new RoomService();