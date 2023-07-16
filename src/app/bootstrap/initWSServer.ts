import { router } from "../../router/router";
import { wss } from "../../server/ws";

export function initWSSServer() {
    wss.on('connection', (ws) => {
        ws.on('error', console.error);
        ws.on('message', (req) => router(req, ws));
        ws.on('close', () => {
            console.log("disconnected")
        });
    });
}