import playerController from '../player/player-controller';
import roomController from '../room/room-controller';
import gameController from '../game/game-controller';

export const router = async (request, ws) => {
    const { type, data } = JSON.parse(request);
    const payload = data ? JSON.parse(data) : null;
    try {
        switch(type) {
        case 'reg':
            await playerController.auth(ws, payload);
            await roomController.updateRoom();
            await gameController.updateWinners();
            break;
        case 'create_room':
            await roomController.create(ws);
            await roomController.updateRoom();
            break;
        case 'add_user_to_room': {
            const room = await roomController.addPlayer(ws, payload);
            if (!room) throw new Error("something went wrong")
            if (room.roomUsers.length === 2) {
                roomController.removeRoomById(room.roomId)
            }
            await roomController.updateRoom();
            await gameController.create(room);
            break;
        }
        case 'add_ships':
            await gameController.addShips(payload);
            break;
        case 'attack':
            await gameController.attack(payload)
            break;
        case 'randomAttack':
            await gameController.randomAttack(payload);
            break;
        }
    } catch(e) {
        console.log(e);
    }
    
}