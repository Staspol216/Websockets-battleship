import { server } from "../../server/http";

export function initHttpServer(port: number) {
    console.log(`Start static http server on the ${port} port!`);
    server.listen(port);
}