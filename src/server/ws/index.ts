import { WebSocketServer } from 'ws';

const port = process.env.WS_PORT ?? 3000;

export const wss = new WebSocketServer({ port: +port });