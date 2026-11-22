 export function landing(){
    return `
    <html>
      <body>
        <h1>Welcome to the Landing Page</h1>
      </body>
    </html>
    `
}

import { User } from './User.ts';
import { Game } from './Game.ts';
import { Team } from './Team.ts';
import { Favs } from './Favs.ts'
export function get_schedule(){
    return `
    <html>
      <body>
        <h1>Welcome to the Schedule Page</h1>
      </body>
    </html>
    `
}

export function get_student_list(){
    return `
    <html>
      <body>
        <h1>Welcome to the Class List Page</h1>
      </body>
    </html>
    `
}

export function allowed(){
    return `
    <html>
      <body>
        <h1>Welcome to the Allowed Page</h1>
      </body>
    </html>
    `
}