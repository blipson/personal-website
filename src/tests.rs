use rocket::local::blocking::Client;

#[test]
fn health_check() {
    let client = Client::tracked(super::rocket()).unwrap();
    let response = client.get("/up").dispatch();
    assert_eq!(response.into_string(), Some("Healthy".into()));
}