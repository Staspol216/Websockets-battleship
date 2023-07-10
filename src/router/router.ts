import playerController from '../player/player-controller';
import roomController from '../room/room-controller';
import gameController from '../game/game-controller';
import { wss } from '../http_server';

export const router = async (request, ws) => {
    const { type, data } = JSON.parse(request);
    let payload;
    if (data) {
        payload = JSON.parse(data)
    }
    console.log(JSON.parse(request))
    console.log(type);
    switch(type) {
    case 'reg':
        await playerController.auth(ws, payload);
        await roomController.updateRoom(wss);
        break;
    case 'update_winners':
        await playerController.updateWinners(ws);
        break;
    case 'create_room':
        await roomController.create(ws);
        await roomController.updateRoom(wss);
        break;
    case 'add_user_to_room':
        await roomController.addPlayer(ws, payload);
        await roomController.updateRoom(wss);
        await gameController.create(wss)
        break;
    case 'add_ships':
        await gameController.addShips(wss, ws, payload)
        break;
    }
}