#[macro_use] extern crate rocket;

#[cfg(test)] mod tests;

#[get("/up")]
fn up() -> &'static str {
    "Healthy"
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![up])
}