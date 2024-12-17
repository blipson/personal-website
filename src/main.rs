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
#[macro_use]extern crate rocket_include_static_resources;

use rocket::serde::{json::Json, Deserialize, Serialize};

static_response_handler! {
    "/favicon.ico" => favicon => "favicon",
    "/favicon-16.png" => favicon_png => "favicon-png",
}

#[cfg(test)] mod tests;

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
fn root() -> Json<Health> {
    Json(Health {
        status: HealthStatus::HEALTHY
    })
}

#[launch]
fn rocket() -> _ {
    println!("
        Personal website of Ben Gangl-Lipson  Copyright (C) 2024  Ben Gangl-Lipson
        This program comes with ABSOLUTELY NO WARRANTY. This is free software, and
        you are welcome to redistribute it under certain conditions.
    ");
    rocket::build()
        .attach(static_resources_initializer!(
            "favicon.ico" => "static/favicon.ico",
        ))
        .mount("/", routes![health])
        .mount("/", routes![root])
}