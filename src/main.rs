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

use std::io;
use std::path::Path;
use rand::seq::SliceRandom;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::{Request};
use rocket::fs::NamedFile;

#[cfg(test)] mod tests;

#[catch(500)]
fn internal_error() -> &'static str {
    "Whoops! Looks like we messed up."
}

#[catch(404)]
async fn not_found() -> Result<NamedFile, std::io::Error> {
    let file_names = vec!["confucius.html", "plato.html", "aristotle.html"];
    let chosen = file_names.choose(&mut rand::thread_rng());
    let dir = "static/404";
    if let Some(file) = chosen {
        NamedFile::open(Path::new(dir).join(file)).await
    } else {
        NamedFile::open("static/404/confucius.html").await
    }

}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(crate = "rocket::serde")]
enum HealthStatus {
    HEALTHY,
    UNHEALTHY,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(crate = "rocket::serde")]
struct Health {
    status: HealthStatus,
}

#[get("/health")]
fn health() -> Json<Health> {
    Json(Health {
        status: HealthStatus::HEALTHY
    })
}

#[get("/")]
async fn root() -> Result<NamedFile, std::io::Error> {
    NamedFile::open("static/index.html").await
}

#[launch]
fn rocket() -> _ {
    println!("
        Personal website of Ben Gangl-Lipson  Copyright (C) 2024  Ben Gangl-Lipson
        This program comes with ABSOLUTELY NO WARRANTY; for details navigate to `/WARRANTY'.
        This is free software, and you are welcome to redistribute it
        under certain conditions; navigate to `/LICENSE' for details.
    ");
    rocket::build()
        .mount("/", routes![health, root])
        .mount("/", rocket::fs::FileServer::from("license"))
        .register("/", catchers![not_found, internal_error])
}