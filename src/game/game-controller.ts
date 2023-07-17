import { DB } from "../db";
import { randomUUID } from "crypto";
import { Coord, Game, Room, Ship } from "../db/types";
import WebSocket from 'ws';
import gameService from "./game-service";
import { wss } from "../server/ws";

class GameController {

    public async create(room: Room) {
        const roomPlayersIds = room.roomUsers.map(user => user.index);

        const game: Game = {
            idGame: randomUUID(),
            players: [],
            activePlayer: ''
        };

        wss.clients.forEach((client) => {
            const idPlayer = DB.CLIENTS.get(client);
            if (!idPlayer) return
            if (!roomPlayersIds.includes(idPlayer)) return

            const data = {
                idGame: game.idGame,
                idPlayer
            }

            const response = {
                type: "create_game",
                data: JSON.stringify(data),
                id: 0
            };

            console.log(response.type, data)
        
            const encodedResponse = JSON.stringify(response);
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });

        DB.games.push(game);
    }

    public addShips(payload: { indexPlayer: string, gameId: string, ships: Ship[]}) {
        const currentGame = gameService.addShips(payload);

        if (currentGame.players.length === 2) {
            this.startGame(currentGame);
            this.setTurn(currentGame.players[0].id, currentGame);
        }
    }

    public startGame(game: Game) {
        const gamePlayersIds = game.players.map(player => player.id);

        wss.clients.forEach((client) => {
            const playerId = DB.CLIENTS.get(client);
            if (!playerId) return
            if (!gamePlayersIds.includes(playerId)) return

            const data = {
                ships: DB.USERS_GAME_SHIPS.get(playerId),
                currentPlayerIndex: playerId
            }

            const response = {
                type: "start_game",
                data: JSON.stringify(data),
                id: 0
            }

            console.log(response.type, data)

            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }

    public setTurn(currentPlayerId: string, currentGame: Game) {
        currentGame.activePlayer = currentPlayerId
        this._broadcast("turn", {
            currentPlayer: currentGame.activePlayer
        })
    }

    public attack(payload: { indexPlayer: string, gameId: string} & Coord) {
        const { indexPlayer, x, y, gameId } = payload;

        const currentGame = gameService.getCurrentGameById(gameId);
        if (currentGame.activePlayer !== indexPlayer) return
        const { status, opponent } = gameService.attack({ indexPlayer, currentGame, x, y });

        this._broadcast("attack", {
            position: { x, y },
            currentPlayer: indexPlayer,
            status,
        })

        if (opponent?.ships.length === 0) {
            const playersIds = currentGame.players.map(player => player.id);
            gameService.updateWinnersTable(indexPlayer);
            this.setGameFinish(indexPlayer, playersIds);
            this.updateWinners();
            return
        }

        if (!opponent) throw new Error("spmething went wrong")
        const nextPlayer = status === "miss" ? opponent.id : indexPlayer
        currentGame.activePlayer = nextPlayer;
        this._broadcast("turn", {
            currentPlayer: nextPlayer
        })
    }

    public setGameFinish(winPlayerID: string, playersIds: string[]) {

        wss.clients.forEach((client) => {
            const playerId = DB.CLIENTS.get(client);
            if (!playerId) return
            if (!playersIds.includes(playerId)) return
            
            const response = {
                type: "finish",
                data: JSON.stringify({
                    winPlayer: winPlayerID
                }),
                id: 0
            };
            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }

    public updateWinners() {
        this._broadcast("update_winners", DB.winners)
    }

    public randomAttack(payload: { gameId: string, indexPlayer: string }) {
        const { gameId, indexPlayer } = payload;

        const coords = gameService.getRandomCoords()

        const attackPayload = {
            gameId,
            indexPlayer,
            ...coords
        }

        this.attack(attackPayload)
    }

    private _broadcast(type: string, data: any) {
        wss.clients.forEach((client) => {

            const response = {
                type,
                data: JSON.stringify(data),
                id: 0
            };

            console.log(type, data)

            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }


}

export default new GameController();