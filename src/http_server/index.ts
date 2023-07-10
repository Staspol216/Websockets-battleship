import fs from 'fs';
import path from 'path';
import {createServer} from 'http';
import { WebSocketServer } from 'ws';
import { router } from '../router/router';

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

export const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', (req) => router(req, ws));
});