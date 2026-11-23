import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

const db_schema = process.env.DB_SCHEMA;

export class Team {
    team_id: string;
    team_name: string;
    country: string;
    sport: string;
    logo: string;

    constructor(team_id: string, team_name: string, country: string, sport: string, logo: string){
        this.team_id = team_id;
        this.team_name = team_name;
        this.country = country;
        this.sport = sport;
        this.logo = logo;
    }
}

export class TeamDAO {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private rowToTeam(row: any): Team {
        return new Team(
            "team_id" in row ? String(row["team_id"]) : "",
            "team_name" in row ? String(row["team_name"]) : "",
            "country" in row ? String(row["country"]) : "",
            "sport" in row ? String(row["sport"]) : "",
            "logo" in row ? String(row["logo"]) : ""
        );
    }

    async searchByName(team_name: string, sport: string) : Promise<Team[]>{
        const result = await this.pool.query(`SELECT team_id, team_name, country, sport, logo FROM '${db_schema}'.fp_teams WHERE sport='${sport}' AND team_name ILIKE '%${team_name}%'`);
        return result.rows.map((row: any) => this.rowToTeam(row));
    }

    async findById(team_id: string, sport: string) : Promise<Team | null>{
        let retval: Team;
        let row: string[];
        const result = await this.pool.query(`SELECT team_id, team_name, country, sport, logo FROM '${db_schema}'.fp_teams WHERE team_id='${team_id}' AND sport='${sport}'`);
        if(result.rowCount === null || result.rowCount > 0){
            row = result.rows[0];
            return this.rowToTeam(result.rows[0]);
        }
        else return null;
    }
}