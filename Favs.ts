import { Pool } from "pg";

export class Fav {
    username: string;
    team_id: string;
    sport: string;
    constructor(username: string, team_id: string, sport: string) {
        this.username = username;
        this.team_id = team_id;
        this.sport = sport;
    }
}

export class FavDAO {

    private pg_pool: Pool

    constructor(pg_pool: Pool) {
        this.pg_pool = pg_pool;
    }

    async addFav(fav: Fav): Promise<void> {
        const query = `
            INSERT INTO achastang_schema.fp_favs (username, team_id, sport)
            VALUES ('${fav.username}', '${fav.team_id}', '${fav.sport}')
            ON CONFLICT DO NOTHING
        `;
        await this.pg_pool.query(query);
    }

    async removeFav(fav: Fav): Promise<void> {
        const query = `
            DELETE FROM achastang_schema.fp_favs
            WHERE username = '${fav.username}' AND team_id = '${fav.team_id}' AND sport = '${fav.sport}'
        `;
        await this.pg_pool.query(query);
    }

    async getFavsByUsername(username: string): Promise<Fav[]> {
        const query = `SELECT * FROM achastang_schema.fp_favs WHERE username = '${username}'`;
        const result = await this.pg_pool.query(query);
        return result.rows.map(row => new Fav(row.username, row.team_id, row.sport));
    }

}