import { Coord, Game, Ship, ShipPosition } from "../db/types";
import { DB } from "../db";


class GameService {

    public attack(payload: { indexPlayer: string, currentGame: Game} & Coord) {
        const { indexPlayer, currentGame, x, y } = payload;

        const opponent = currentGame.players.find((player => player.id !== indexPlayer));

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

    public addShips(payload: { indexPlayer: string, gameId: string, ships: Ship[]}) {
        const { ships, gameId, indexPlayer } = payload;
        const currentGame = this.getCurrentGameById(gameId);

        DB.USERS_GAME_SHIPS.set(indexPlayer, ships);

        const allShipsPositions = this._transformShipsToShipsPositionsCoords(ships);

        currentGame.players.push({
            id: indexPlayer,
            ships: allShipsPositions, 
        });

        return currentGame

    }

    public updateWinnersTable(indexPlayer: string) {
        const currentPlayer = DB.users.find(user => user.index === indexPlayer);
        const winnerIndex = DB.winners.findIndex(winner => winner.name === currentPlayer?.name);
        
        if (!currentPlayer?.name) throw new Error('Player not found')

        if (winnerIndex === -1) {
            this._createNewWinner(currentPlayer.name);
        } else {
            this._updateWinnerStat(winnerIndex);
        }

        return DB.winners
    }

    public getRandomCoords() {
        const x = this._getRandomCoord();
        const y = this._getRandomCoord();
        return {
            x,
            y
        }
    }

    public getCurrentGameById(gameId: string) {
        const currentGameIndex = DB.games.findIndex(game => game.idGame === gameId);
        return DB.games[currentGameIndex];
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
        DB.winners.push({
            name: name,
            wins: 1
        })
    }

    private _updateWinnerStat(index: number) {
        DB.winners[index].wins += 1
    }

    private _getRandomCoord() {
        return Math.floor(Math.random() * (10 - 0)) + 0;
    }
}

export default new GameService();