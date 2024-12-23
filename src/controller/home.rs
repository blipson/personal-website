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

use std::path::Path;
use rand::Rng;
use rocket::fs::NamedFile;
use rocket::serde::json::Json;
use crate::domain::health::Health;
use crate::domain::health_status;
pub const NOT_FOUND_FILES: [&str; 3] = ["confucius.html", "plato.html", "aristotle.html"];

#[catch(500)]
pub fn internal_error() -> &'static str {
    "Whoops! Looks like we messed up."
}

#[catch(404)]
pub async fn not_found() -> Result<NamedFile, std::io::Error> {
    let file_idx = rand::thread_rng().gen_range(0..NOT_FOUND_FILES.len());
    let chosen = NOT_FOUND_FILES[file_idx];
    let dir = "static/404";
    NamedFile::open(Path::new(dir).join(chosen)).await
}

#[get("/health")]
pub fn health() -> Json<Health> {
    Json(Health {
        status: health_status::HealthStatus::HEALTHY
    })
}

#[get("/")]
pub async fn root() -> Result<NamedFile, std::io::Error> {
    NamedFile::open("static/index.html").await
}


#[cfg(test)]
mod tests {
    use rocket::http::Status;
    use rocket::local::blocking::Client;
    use crate::controller::home::internal_error;
    use crate::domain::health::Health;
    use crate::domain::health_status::HealthStatus;
    use crate::rocket;

    #[test]
    fn test_internal_error() {
        assert_eq!(internal_error(), "Whoops! Looks like we messed up.")
    }

    #[test]
    fn not_found() {
        let client = Client::tracked(rocket()).unwrap();
        let response = client.get("/woopsies").dispatch();
        assert_eq!(response.status(), Status::NotFound);
        let body = response.into_string().unwrap();
        assert!(body.contains("<h1>404 Page Not Found</h1>"));
    }

    #[test]
    fn health() {
        let client = Client::tracked(rocket()).unwrap();
        let response = client.get("/health").dispatch();
        let health_response: Option<Health> = response.into_json().unwrap();
        assert_eq!(
            health_response,
            Some(Health {
                status: HealthStatus::HEALTHY,
            })
        );
    }

    #[test]
    fn index() {
        let client = Client::tracked(rocket()).unwrap();
        let response = client.get("/").dispatch();
        assert_eq!(response.status(), Status::Ok);
        let index_response: String = response.into_string().unwrap().chars().filter(|c| !c.is_whitespace()).collect();
        let expected: String = "<!DOCTYPE html>

<html lang=\"en\">
<head>
    <meta charset=\"utf-8\">
    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
    <title>Gangl-Lipson</title>
</head>

<body>
<h1>Ben Gangl-Lipson</h1>
<p>Software Engineer, musician, aspiring post-contemporary purely functional automaton.</p>
<a href=\"https://github.com/blipson\" target=\"_blank\">Code</a>
<a href=\"https://github.com/blipson/resume\" target=\"_blank\">Resume</a>
</body>
</html>
".chars().filter(|c| !c.is_whitespace()).collect();
        assert_eq!(index_response, expected)
    }
}

