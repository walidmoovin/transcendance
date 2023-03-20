import { writable } from "svelte/store";
import { content, show_popup } from "./components/Alert/content";
import {get} from 'svelte/store'
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

export async function verify() {
  let email : string;
  await show_popup("Enter your preferred email adress:\n(defaults to 42 email)")
  email = get(content);
  if (email == '')
    return ;
  if (email != 'ok') { 
    const response = await fetch(API_URL + "/log/email", {
      method: "POST",
      mode: "cors",
      headers: {"Content-Type": "application/json",}, 
      credentials: "include",
      body: JSON.stringify({email: email})
    })
    if (response.ok) {await show_popup("Email set",false)}
    else {await show_popup("Couldn't set Email",false); return }
  }
  console.log(API_URL)
  const response = await fetch(API_URL + "/log/verify", {
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
  if (response.ok) {
    await show_popup("We have sent you an email to verify your account. Check your mailbox!.", false);
  } else { await show_popup("Email doensn't seem valid", false);}


}

export function logout() {
  window.location.replace(API_URL + "/log/out");
  store.set(null);
}
