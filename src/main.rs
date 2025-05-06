/*
    Personal website of Ben Gangl-Lipson
    Copyright (C) 2024 Ben Gangl-Lipson

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

#[macro_use] extern crate rocket;

use rocket::fs::FileServer;

mod controller;
mod domain;

#[launch]
pub fn rocket() -> _ {
    println!("
        Personal website of Ben Gangl-Lipson  Copyright (C) 2024  Ben Gangl-Lipson
        This program comes with ABSOLUTELY NO WARRANTY; for details navigate to `/WARRANTY'.
        This is free software, and you are welcome to redistribute it
        under certain conditions; navigate to `/LICENSE' for details.
    ");
    rocket::build()
        .register("/", catchers![controller::home::not_found, controller::home::internal_error])
        .mount("/", FileServer::from("static"))
        .mount("/", routes![controller::home::health, controller::home::root])
        .mount("/graphics", routes![controller::graphics::root, controller::graphics::ascii])
        .mount("/ai", routes![controller::ai::root])
        .mount("/compiler", routes![controller::compiler::root])
        .mount("/demo", routes![controller::demo::cave])
}