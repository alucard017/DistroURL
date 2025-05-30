import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 50, // number of virtual users
  duration: "1m", // duration of the test
};

export default function () {
  const url = "http://127.0.0.1:8080/url/p"; // replace with your POST URL
  const payload = JSON.stringify({
    OriginalUrl: "https://www.github.com",
    Password: "1234",
    OneTime: "1",
    ExpiresAt: "22/02/2026",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  http.post(url, payload, params);
  sleep(1);
}
