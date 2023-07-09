import fs from 'fs';
import path from 'path';
import {createServer} from 'http';
import { WebSocketServer } from 'ws';
import playerController from '../player/player-controller';
import roomController from '../room/room-controller';
import gameController from '../game/game-controller';

export const server = createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

const wss = new WebSocketServer({ port: 3000 });

const CLIENTS = new Map();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
  
    ws.on('message', async (request) => {
        const { type, data } = JSON.parse(request);
        let payload;
        if (data) {
            payload = JSON.parse(data)
        }

        console.log(JSON.parse(request))

        console.log(type);
        switch(type) {
            case 'reg':
                await playerController.auth(ws, payload, CLIENTS);
                await roomController.updateRoom(wss);
                break;
            case 'update_winners':
                await playerController.updateWinners(ws);
                break;
            case 'create_room':
                console.log("this case");
                await roomController.create(ws, CLIENTS);
                await roomController.updateRoom(wss);
                break;
            case 'add_user_to_room':
                console.log('add uset to room');
                await roomController.addPlayer(ws, payload, CLIENTS);
                await roomController.updateRoom(wss);
                await gameController.create(wss, ws, CLIENTS)
                break;
        }
    });
});