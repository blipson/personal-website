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

use rocket::local::blocking::Client;
use crate::{Health, HealthStatus};

#[test]
fn health() {
    let client = Client::tracked(super::rocket()).unwrap();
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
fn root() {
    let client = Client::tracked(super::rocket()).unwrap();
    let response = client.get("/").dispatch();
    let health_response: Option<Health> = response.into_json().unwrap();
    assert_eq!(
        health_response,
        Some(Health {
            status: HealthStatus::HEALTHY,
        })
    );
}