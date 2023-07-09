import { server } from "./src/http_server";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);
