import { User } from "../db/types";
import { DB } from "../db";
import { randomUUID } from "crypto";


class RoomService {
    public create(creatorId: string) {

        const PlayerCreatorData = DB.users.find((player) => player.index === creatorId);

        // handle error
        if (!PlayerCreatorData) throw new Error("Player not found")

        const { password, ...playerDataWithoutPassword } = PlayerCreatorData;

        const newRoom = {
            roomId: randomUUID(),
            roomUsers: [ playerDataWithoutPassword ]
        };

        DB.rooms.push(newRoom);

        return newRoom
    }

    public addPlayer(indexRoom: string, user: User) {
        const room = this.getById(indexRoom);
        const usersIds = room?.roomUsers.map(user => user.index);
        const isCreator = usersIds?.includes(user.index);
        if (!room ) throw new Error("Room not found");
        if (isCreator) throw new Error("Creator has been already added in room");
        
        const { password, ...playerDataWithoutPassword } = user;
        room.roomUsers.push(playerDataWithoutPassword)

        return room
    }

    public removeById(id: string) {
        const roomIndex = DB.rooms.findIndex(room => room.roomId === id)
        return DB.rooms.splice(roomIndex, 1)
    }

    public getById(id: string) {
        return DB.rooms.find(room => room.roomId === id)
    }

    public getAll() {
        return DB.rooms
    }
}

export default new RoomService();