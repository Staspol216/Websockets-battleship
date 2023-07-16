import { initHttpServer } from "./initHttpServer";
import { initWSSServer } from "./initWSServer";

export default function initApp() {
    const HTTP_PORT = process.env.HTTP_PORT ?? 8181;

    initHttpServer(+HTTP_PORT);
    initWSSServer();
}