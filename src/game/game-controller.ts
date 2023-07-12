import { CLIENTS, Games, USERS_GAME_SHIPS } from "../db";
import { randomUUID } from "crypto";
import { Game, Ship, ShipPosition } from "../db/types";
import WebSocket from 'ws';

class GameController {
    public async create(wss) {
    
        const game: Game = {
            idGame: randomUUID(),
            players: []
        };

        wss.clients.forEach((client) => {
            const idPlayer = CLIENTS.get(client);

            const response = {
                type: "create_game",
                data: JSON.stringify({
                    idGame: game.idGame,
                    idPlayer
                }),
                id: 0
            };
        
            const encodedResponse = JSON.stringify(response);
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });

        Games.push(game);
    }

    public addShips(wss, payload) {
        const { ships, gameId, indexPlayer } = payload;
        
        const currentGameIndex = Games.findIndex(game => game.idGame === gameId);
        const currentGame = Games[currentGameIndex];
        const allShipsPositions: ShipPosition[][] = [];

        USERS_GAME_SHIPS.set(indexPlayer, ships);

        ships.forEach((ship: Ship) => {
            const shipPositions: ShipPosition[] = [];
            shipPositions.push(ship.position);

            const vertical = ship.direction;
            const shipLength = ship.length;

            if (shipLength === 1) return

            for (let i = 1; i < shipLength; i++) {
                if (vertical) {
                    shipPositions.push({
                        x: ship.position.x,
                        y: ship.position.y + i
                    })
                } else {
                    shipPositions.push({
                        x: ship.position.x + i,
                        y: ship.position.y
                    })
                }
            }
            allShipsPositions.push(shipPositions)
        })


        console.log(allShipsPositions)


        currentGame.players.push({
            id: indexPlayer,
            ships: allShipsPositions, 
        });

        console.log(currentGame, "currentGame currentGame currentGame ");

        if (currentGame.players.length === 2) {

            wss.clients.forEach((client) => {
                const playerId = CLIENTS.get(client);

                const response = {
                    type: "start_game",
                    data: JSON.stringify({
                        ships: USERS_GAME_SHIPS.get(playerId),
                        currentPlayerIndex: playerId
                    }),
                    id: 0
                }

                const encodedResponse = JSON.stringify(response);

                if (client.readyState === WebSocket.OPEN) {
                    client.send(encodedResponse);
                }
            });

            this.setTurn(wss, currentGame.players[0].id);
        }
    }

    public setTurn(wss, currentPlayerId) {
        this._broadcast(wss, "turn", {
            currentPlayer: currentPlayerId
        })
    }

    public attack(wss, ws, payload) {

        const { gameId, indexPlayer, x, y } = payload;

        const currentGameIndex = Games.findIndex(game => game.idGame === gameId);
        const currentGame = Games[currentGameIndex];

        const anotherPlayer = currentGame.players.find((player => player.id !== indexPlayer));

        let positionIndex;

        console.log(anotherPlayer?.ships, "anotherPlayer?.ships")
        const ship = anotherPlayer?.ships.find(shipPositions => {
            positionIndex = shipPositions.findIndex(coord => coord.x == x && coord.y == y)
            return positionIndex !== -1
        });

        console.log(ship, "SHIP");
        console.log(positionIndex, "positionIndex")

        let status: string;

        if (positionIndex === -1 || !ship) {
            status = "miss"
        } else {
            ship.splice(positionIndex, 1);
            if (ship.length === 0) {
                status = "killed"
            } else {
                status = "shot"
            }
        }

        this._broadcast(wss, "attack", {
            position: {
                x,
                y,
            },
            currentPlayer: indexPlayer,
            status,
        })

        this._broadcast(wss, "turn", {
            currentPlayer: status === "miss" ? anotherPlayer?.id : indexPlayer
        })
        
    }

    public randomAttack(wss, ws, payload) {
        const { gameId, indexPlayer } = payload;

        const x = this._getRandomCoord();
        const y = this._getRandomCoord();


        const attackPayload = {
            gameId,
            indexPlayer,
            x,
            y
        }

        console.log(attackPayload, "attackPayload");

        this.attack(wss, ws, attackPayload)
    }

    private _getRandomCoord() {
        return Math.floor(Math.random() * (10 - 0)) + 0;
    }

    private _broadcast(wss, type, data) {
        wss.clients.forEach((client) => {

            const response = {
                type,
                data: JSON.stringify(data),
                id: 0
            };
            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }
}

export default new GameController();