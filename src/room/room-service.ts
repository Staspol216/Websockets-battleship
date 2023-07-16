import { Player } from "../db/types";
import { Players, Rooms } from "../db";
import { randomUUID } from "crypto";


class RoomService {
    public create(creatorId: string) {

        const PlayerCreatorData = Players.find((player) => player.index === creatorId);

        // handle error
        if (!PlayerCreatorData) throw new Error("Player not found")

        const { password, ...playerDataWithoutPassword } = PlayerCreatorData;

        const newRoom = {
            roomId: randomUUID(),
            roomUsers: [ playerDataWithoutPassword ]
        };

        Rooms.push(newRoom);

        return newRoom
    }

    public addPlayer(indexRoom: string, player: Player) {
        const room = this.getById(indexRoom);
        const usersIds = room?.roomUsers.map(user => user.index);
        const isCreator = usersIds?.includes(player.index);
        if (!room ) throw new Error("Room not found");
        if (isCreator) throw new Error("Creator has been already added in room");
        
        const { password, ...playerDataWithoutPassword } = player;
        room.roomUsers.push(playerDataWithoutPassword)

        return room
    }

    public removeById(id: string) {
        const roomIndex = Rooms.findIndex(room => room.roomId === id)
        return Rooms.splice(roomIndex, 1)
    }

    public getById(id: string) {
        return Rooms.find(room => room.roomId === id)
    }

    public getAll() {
        return Rooms
    }
}

export default new RoomService();