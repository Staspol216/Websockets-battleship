import { CLIENTS, Games, USERS_GAME_SHIPS, Winners } from "../db";
import { randomUUID } from "crypto";
import { Game, Room } from "../db/types";
import WebSocket from 'ws';
import gameService from "./game-service";
import { wss } from "../server/ws";

class GameController {

    public async create(room: Room) {
        console.log("Creating game from", room)
        const roomPlayersIds = room.roomUsers.map(user => user.index);

        const game: Game = {
            idGame: randomUUID(),
            players: [],
            activePlayer: ''
        };

        wss.clients.forEach((client) => {
            const idPlayer = CLIENTS.get(client);
            if (!roomPlayersIds.includes(idPlayer)) return

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

    public async createGameWithBot(ws) {
        const game: Game = {
            idGame: randomUUID(),
            players: [],
            activePlayer: ''
        };

        const idPlayer = CLIENTS.get(ws);

        const response = {
            type: "create_game",
            data: JSON.stringify({
                idGame: game.idGame,
                idPlayer
            }),
            id: 0
        };
        
        const encodedResponse = JSON.stringify(response);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(encodedResponse);
        }

        Games.push(game);
    }

    public addShips(payload) {
        const currentGame = gameService.addShips(payload);

        if (currentGame.players.length === 2) {
            this.startGame(currentGame);
            this.setTurn(currentGame.players[0].id, currentGame);
        }
    }

    public startGame(game: Game) {
        const gamePlayersIds = game.players.map(player => player.id);

        wss.clients.forEach((client) => {
            const playerId = CLIENTS.get(client);

            if (!gamePlayersIds.includes(playerId)) return

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
    }

    public setTurn(currentPlayerId: string, currentGame: Game) {
        currentGame.activePlayer = currentPlayerId
        this._broadcast("turn", {
            currentPlayer: currentGame.activePlayer
        })
    }

    public attack(payload) {
        const { indexPlayer: currentPlayer, x, y, gameId } = payload;

        const currentGame = gameService.getCurrentGameById(gameId);
        if (currentGame.activePlayer !== currentPlayer) return
        const { status, opponent } = gameService.attack({ currentPlayer, currentGame, x, y });

        this._broadcast("attack", {
            position: { x, y },
            currentPlayer,
            status,
        })

        if (opponent?.ships.length === 0) {
            const playersIds = currentGame.players.map(player => player.id);
            gameService.updateWinnersTable(currentPlayer);
            this.setGameFinish(currentPlayer, playersIds);
            this.updateWinners();
            return
        }

        const nextPlayer = status === "miss" ? opponent?.id : currentPlayer
        currentGame.activePlayer = nextPlayer;
        this._broadcast("turn", {
            currentPlayer: nextPlayer
        })
    }

    public setGameFinish(winPlayerID: string, playersIds: string[]) {

        wss.clients.forEach((client) => {
            const playerId = CLIENTS.get(client);

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
        this._broadcast("update_winners", Winners)
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
            const encodedResponse = JSON.stringify(response);

            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedResponse);
            }
        });
    }


}

export default new GameController();