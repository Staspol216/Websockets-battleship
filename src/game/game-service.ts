import { Ship, ShipPosition } from "../db/types";
import { Games, Players, USERS_GAME_SHIPS, Winners } from "../db";


class GameService {

    public attack(payload) {
        const { currentPlayer, currentGame, x, y } = payload;

        const opponent = currentGame.players.find((player => player.id !== currentPlayer));

        let positionIndex;
        let shipIndex;

        const shipCoords = opponent?.ships.find((shipPositions, i) => {
            shipIndex = i
            positionIndex = shipPositions.findIndex(coord => coord.x == x && coord.y == y)
            return positionIndex !== -1
        });

        let status: string;

        if (positionIndex === -1 || !shipCoords) {
            status = "miss";
        } else {
            shipCoords[positionIndex].damaged = true;
            const isKilledShip = shipCoords.every(coord => coord.damaged);
            if (isKilledShip) {
                status = "killed"
                opponent?.ships.splice(shipIndex, 1);
            } else {
                status = "shot"
            }
        }

        return {
            status,
            opponent,
            currentGame
        }
    }

    public addShips(payload) {
        const { ships, gameId, indexPlayer } = payload;
        const currentGame = this.getCurrentGameById(gameId);

        USERS_GAME_SHIPS.set(indexPlayer, ships);

        const allShipsPositions = this._transformShipsToShipsPositionsCoords(ships);

        currentGame.players.push({
            id: indexPlayer,
            ships: allShipsPositions, 
        });

        return currentGame

    }

    public updateWinnersTable(indexPlayer: string) {
        const currentPlayer = Players.find(player => player.index === indexPlayer);
        const winnerIndex = Winners.findIndex(winner => winner.name === currentPlayer?.name);
        
        if (!currentPlayer?.name) throw new Error('Player not found')

        if (winnerIndex === -1) {
            this._createNewWinner(currentPlayer.name);
        } else {
            this._updateWinnerStat(winnerIndex);
        }

        return Winners
    }

    public getRandomCoords() {
        const x = this._getRandomCoord();
        const y = this._getRandomCoord();
        return {
            x,
            y
        }
    }

    public getCurrentGameById(gameId) {
        const currentGameIndex = Games.findIndex(game => game.idGame === gameId);
        return Games[currentGameIndex];
    }

    private _transformShipsToShipsPositionsCoords(ships: Ship[]) {
        const allShipsPositions: ShipPosition[][] = [];

        ships.forEach((ship) => {
            const shipPositions: ShipPosition[] = [];

            const vertical = ship.direction;
            const shipLength = ship.length;

            for (let i = 0; i < shipLength; i++) {
                if (vertical) {
                    shipPositions.push({
                        x: ship.position.x,
                        y: ship.position.y + i,
                        damaged: false
                    })
                } else {
                    shipPositions.push({
                        x: ship.position.x + i,
                        y: ship.position.y,
                        damaged: false
                    })
                }
            }
            allShipsPositions.push(shipPositions)
            console.log(allShipsPositions);
        })

        return allShipsPositions
    }

    private _createNewWinner(name: string) {
        Winners.push({
            name: name,
            wins: 1
        })
    }

    private _updateWinnerStat(index: number) {
        Winners[index].wins += 1
    }

    private _getRandomCoord() {
        return Math.floor(Math.random() * (10 - 0)) + 0;
    }
}

export default new GameService();