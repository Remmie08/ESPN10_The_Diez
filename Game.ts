import { Fav } from "./Favs";
import { Pool } from "pg";

export class Game {
    game_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: Date;
    home_goals: number | null;
    away_goals: number | null;
    sport: string;
    constructor(game_id: string, home_team_id: string, away_team_id: string, match_date: Date, home_goals: number | null, away_goals: number | null, sport: string) {
        this.game_id = game_id;
        this.home_team_id = home_team_id;
        this.away_team_id = away_team_id;
        this.match_date = match_date;
        this.home_goals = home_goals;
        this.away_goals = away_goals;
        this.sport = sport;
    }
}

export class GameDAO {

    private pg_pool: Pool

    constructor(pg_pool: Pool) {
        this.pg_pool = pg_pool;
    }

    private toGame(row: any): Game {
        return new Game(row.game_id, row.home_team_id, row.away_team_id, row.match_date, row.home_goals, row.away_goals, row.sport);
    }

    async upsertGame(game: Game): Promise<void> {
        const date = game.match_date.toISOString().slice(0, 10);
        const homeGoals = game.home_goals === null ? "NULL" : game.home_goals;
        const awayGoals = game.away_goals === null ? "NULL" : game.away_goals;
        const query = `
            INSERT INTO achastang_schema.fp_games (game_id, home_team_id, away_team_id, match_date, home_goals, away_goals, sport)
            VALUES ('${game.game_id}', '${game.home_team_id}', '${game.away_team_id}', '${date}', ${homeGoals}, ${awayGoals}, '${game.sport}')
            ON CONFLICT (game_id) DO UPDATE SET
                home_team_id = EXCLUDED.home_team_id,
                away_team_id = EXCLUDED.away_team_id,
                match_date = EXCLUDED.match_date,
                home_goals = EXCLUDED.home_goals,
                away_goals = EXCLUDED.away_goals,
                sport = EXCLUDED.sport;
        `;
        await this.pg_pool.query(query);
    }

    async getGamesByTeamId(team_id: string, sport: string): Promise<Game[]> {
        const query = `
            SELECT * FROM achastang_schema.fp_games
            WHERE sport = '${sport}' AND (home_team_id = '${team_id}' OR away_team_id = '${team_id}')
            ORDER BY match_date DESC
        `;
        const result = await this.pg_pool.query(query);
        return result.rows.map(row => this.toGame(row));
    }

    async getGamesForFavs(favs: Fav[]): Promise<Game[]> {
        if (favs.length === 0) {
            return [];
        }

        const conditions = favs
            .map(fav => `(sport = '${fav.sport}' AND (home_team_id = '${fav.team_id}' OR away_team_id = '${fav.team_id}'))`)
            .join(" OR ");
        const query = `
            SELECT * FROM achastang_schema.fp_games
            WHERE ${conditions}
            ORDER BY match_date DESC
        `;
        const result = await this.pg_pool.query(query);
        return result.rows.map(row => this.toGame(row));
    }
}