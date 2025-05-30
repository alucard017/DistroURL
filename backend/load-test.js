import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 150,
  duration: "1m",
};

export default function () {
  const url = "http://127.0.0.1:8080/url/p";
  const payload = JSON.stringify({
    OriginalUrl: "https://www.google.com",
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
