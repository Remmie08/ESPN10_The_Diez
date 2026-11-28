import { User } from './User.ts';
import { Game } from './Game.ts';
import { Team } from './Team.ts';
import { Fav } from './Favs.ts'
 
 export function login(){
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="description" content="Login page for ESPN10: The Diez"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>

        <link href="/CSS/login.css" rel="stylesheet" />

        <script type="module">
            import App from "./JS/login.js";
            const app = new App();
        </script>
    </head>
    <body>
        <img src="vecteezy_high-dynamic-range-soccer-stadium-with-empty-stands-background_48632608.jpg" alt="Stadium background" class="background">
        <div class="login-page-wrapper">
            <div class="form-box login">
                <h2>Login</h2>
                <form action="#" id="login">
                    <div class="form-error hidden" id="login-error-message">
                        <p>Invalid Username or Password</p>
                    </div>
                    <div class="input-box">
                        <input type="text" id="login-username" required>
                        <label>Username</label>
                    </div>
                    <div class="input-box">
                        <input type="password" id="login-password" required>
                        <label>Password</label>
                    </div>
                    <button type="submit" class="btn">Login</button>
                    <div class="login-register">
                        <p>Don't have an account? <a href="#" class="register-link">Register</a></p>
                    </div>
                </form>
            </div>

            <div class="form-box register">
                <h2>Registration</h2>
                <form action="#" id="register">
                    <div class="form-error hidden" id="register-error-message">
                        <p>Account already exits</p>
                    </div>
                    <div class="input-box">
                        <input type="text" id="register-username" required>
                        <label>Username</label>
                    </div>
                    <div class="input-box">
                        <input type="password" id="register-password" required>
                        <label>Password</label>
                    </div>
                    <button type="submit" class="btn">Register</button>
                    <div class="login-register">
                        <p>Already have an account? <a href="#" class="login-link">Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    </body>
    </html>
    `
 }

export function get_games(games: Game[], onlyFavorites: boolean, teams: Team[] = [], selectedDate?: string) {


    let dates = ["2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"];
    let labels = ["Thu 19 Nov", "Fri 20 Nov", "Sat 21 Nov", "Sun 22 Nov", "Mon 23 Nov"];


    let current = selectedDate || "2026-11-21";


    let dateTabs = "";
    for (let i = 0; i < dates.length; i++) {
        let active = dates[i] === current ? "active" : "";
        dateTabs += `<a href="?date=${dates[i]}" class="date-tab ${active}">${labels[i]}</a>`;
    }

    let leagues = [
        ["football", "Premier League"],
        ["nba", "NBA"],
        ["american-football", "NFL"]
    ];

    let sections = "";
    for (let league of leagues) {
        let cards = "";

        for (let game of games) {
            let home: Team | null = null;
            let away: Team | null = null;
            for (let team of teams) {
                if (team.team_id === game.home_team_id) {
                    home = team;
                }
                if (team.team_id === game.away_team_id) {
                    away = team;
                }
            }
            let gameDate = game.match_date.toISOString().slice(0, 10);

            if (gameDate !== current || !home || !away || home.sport !== league[0]) {
                continue;
            }

            let status = "FT";
            let score = game.home_goals + " - " + game.away_goals;
            if (game.home_goals === null) {
                status = "Upcoming";
                score = "vs";
            }

            cards += `
                <div class="game-card">
                    <div class="game-status">${status}</div>
                    <div class="game-score">
                        <div class="team">
                            <img src="${home.logo}">
                            <span>${home.team_name}</span>
                        </div>
                        <div class="score">${score}</div>
                        <div class="team">
                            <img src="${away.logo}">
                            <span>${away.team_name}</span>
                        </div>
                    </div>
                </div>`;
        }

        if (cards === "") {
            cards = `<p class="no-games">No games on this day</p>`;
        }

        sections += `
            <section class="league">
                <h2>${league[1]}</h2>
                <div class="game-row">${cards}</div>
            </section>`;
    }

    let favLink = `?date=${current}&favorites=true`;
    if (onlyFavorites) {
        favLink = `?date=${current}`;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <title>ESPN10: The Diez</title>
        <link href="/CSS/home.css" rel="stylesheet" />
    </head>
    <body>
        <nav class="top-nav">
            <a href="/games" class="nav-link active">Home</a>
            <a href="/favorites" class="nav-link">Favourites</a>
        </nav>

        <div class="date-bar">${dateTabs}</div>

        <main class="content">
            <div class="toolbar">
                <a href="${favLink}" class="fav-toggle ${onlyFavorites ? "on" : ""}">&#9734; Favourites only</a>
            </div>
            ${sections}
        </main>
    </body>
    </html>
    `;
}

export function get_favorites(favs: Fav[], team_search: Team[], search_box: string, teams: Team[]){

        let cards = "";
            for (let fav of favs) {
                for (let team of teams) {
                    if (team.team_id === fav.team_id) {
                        cards += `
                            <div class="team-card">
                            <form onsubmit="removeFav(event)">
                                <input type="hidden" name="team_id" value="${team.team_id}">
                                <img src="${team.logo}">
                                <span>${team.team_name}</span>
                                <button>&times;</button>
                            </form>
                            </div>`;
                    }
                }
            }
        if (cards === "") {
            cards = `<p class="no-favs">No Favourites found</p>`;
        }

        let results = "";
            for (let team of team_search) {
                results += `
                    <form onsubmit="addFav(event)">
                        <input type="hidden" name="team_id" value="${team.team_id}">
                        <img src="${team.logo}">
                        <span>${team.team_name}</span>
                        <button>Add</button>
                    </form>`;
            }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <title>ESPN10: The Diez</title>
        <link href="/CSS/home.css" rel="stylesheet" />
            <script>
                async function addFav(event) {
                    event.preventDefault();
                    const form = event.target;
                    const data = {
                        team_id: form.team_id.value
                    };
                    await fetch("/favorites/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });
                    location.reload();
                }

                async function removeFav(event) {
                    event.preventDefault();
                    const form = event.target;
                    const data = {
                        team_id: form.team_id.value
                    };
                    await fetch("/favorites/remove", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });
                    location.reload();
                }
            </script>
    </head>
    <body>
        <nav class="top-nav">
            <a href="/games" class="nav-link">Home</a>
            <a href="/favorites" class="nav-link active">Favourites</a>
        </nav>
        <form method="GET" action="/favorites">
            <input type="text" name="team_name" value="${search_box}" placeholder="Search to add fav team">
        </form>
        ${results}

        ${cards}
    </body>
    </html>
    `
}

export function get_teams(teams: Team[]){
    return `
    <html>
      <body>
        <h1>Welcome to the teams Page</h1>
      </body>
    </html>
    `
}

export function get_team_games(team: Team, games: Game[]){
    return `
    <html>
      <body>
        <h1>Welcome to the team games Page</h1>
      </body>
    </html>
    `
}