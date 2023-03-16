import { writable } from "svelte/store";

let _user = localStorage.getItem("user");
export const store = writable(_user ? JSON.parse(_user) : null);
store.subscribe((value) => {
  if (value) localStorage.setItem("user", JSON.stringify(value));
  else localStorage.removeItem("user");
});

export const API_URL = `http://${import.meta.env.VITE_HOST}:${
  import.meta.env.VITE_BACK_PORT
}`;

export async function getUser() {
  const res = await fetch(API_URL + "/users", {
    method: "get",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  let user = await res.json();
  if (user.username) store.set(user);
  else store.set(null);
}

export function login() {
  window.location.replace(API_URL + "/log/in");
}

export function verify() {
  fetch(API_URL + "/log/verify", {
    method: "get",
    mode: "cors",
    credentials: "include",
  });
  alert(
    "We have sent you an email to verify your account. Check the mailbox which is linked to your 42's profile."
  );
}

export function logout() {
  window.location.replace(API_URL + "/log/out");
  store.set(null);
}
