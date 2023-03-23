<script lang="ts" context="module">
  export interface Player {
    username: string;
    blocked: Array<Player>
    wins: number;
    looses: number;
    matchs: number;
    winrate: number;
    rank: number;
    twoFA: boolean;
    ftId: number;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { API_URL, store, logout } from "../Auth";
  import type { UserDto } from "./dtos/user.dto";
  import { show_popup } from "./Alert/content";
  import { APPSTATE } from "../App.svelte";

  export let gamePlaying: boolean;
  export let resetGameConnection: () => void = () => {};
  export let appState: string = APPSTATE.PROFILE;

  let edit: boolean = true;
  let user: Player = $store;
  let userId: string = $store.ftId;
  let username: string = $store.username;
  let email: string = $store.email;
  let blockedUsers: Array<Player> = [];
  let avatarForm: HTMLFormElement;

  async function getUser() {
    if ( appState !== APPSTATE.PROFILE) {
      edit = false;
      userId = appState.split("#")[1]
      let res = await fetch(API_URL + "/users/" + userId, {
        mode: "cors",
      });
      if (res.ok) {
        user = await res.json();
        username = user.username;
      }
    }
  }
  async function getBlockeds() {
    let res = await fetch(API_URL + "/users/blocked/", {
      credentials: "include",
      mode: "cors",
    });
    if (res.ok) blockedUsers = await res.json();
  }

  onMount(() => {
    getUser();
    getBlockeds();
  });

  const dispatch = createEventDispatcher();

  //--------------------------------------------------------------------------------//
  export const blockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/block/" + target.ftId, {
        method: "GET",
        credentials: "include",
        mode: "cors"
      });
      if (response.ok) {
        blockedUsers.push(target);
        blockedUsers = blockedUsers
        await show_popup("User blocked", false);
      } else {
        const error = await response.json();
        await show_popup(error.message, false);
      }
    } else {
      const error = await response.json();
      await show_popup(error.message, false);
    }
  };

  export const unblockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/block/" + target.ftId, {
        credentials: "include",
        method: "DELETE",
        mode: "cors"
      });
      dispatch("update-hiddens", username)
    }
    if (response.ok) {
      await show_popup("User unblocked", false);
      blockedUsers = blockedUsers.filter((user) => user.username !== username);
    }
    else {
      const error = await response.json();
      await show_popup(error.message, false);
    }
    dispatch("close")
  };

  async function handleSubmitUsername() {
    if (gamePlaying) return await show_popup("Cannot change username while playing.", false)
    if (username === $store.username) return await show_popup(`Username already set to ${username}.`, false)
    if (username.includes(" ")) return await show_popup("Username cannot contain spaces.", false)

    const response = await fetch(API_URL + "/users", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({ 
        username: username,
        email: $store.email
      }),
      credentials: "include",
    });
    if (response.ok) {
      $store.username = username;
      await show_popup("Successfully changed username.", false)
      resetGameConnection();
    } else {
      const error = await response.json();
      await show_popup(error.message, false)
    }
  }

  async function handleSubmitEmail() {
    console.log($store.username)
    const response = await fetch(API_URL + "/users", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({ 
        username: $store.username,
        email: email
      }),
      credentials: "include",
    });
    if (response.ok) {
      $store.email = email;
      await show_popup("Successfully changed email.", false)
    } else {
      const error = await response.json();
      await show_popup(error.message, false)
    }
  }

  async function handle2fa(event: Event) {
    event.preventDefault();
    user.twoFA = !user.twoFA;
    let response = await fetch(API_URL + "/users", {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(user),
      credentials: "include",
    });
    if (response.ok) {
      await show_popup("Successfully " + (user.twoFA ? "enabled" : "disabled") + " 2FA", false)
    }
  }
</script>

<div class="overlay">
  <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
    <h3>===| <mark>{username}</mark> |===</h3>
    <div class="profile-header">
      {#if !edit}
        <img src={`${API_URL}/users/${user.ftId}/avatar`} alt="avatar" class="profile-img" />
      {:else}
        <form
          action={`${API_URL}/users/avatar`}
          method="post"
          enctype="multipart/form-data"
          bind:this={avatarForm}
        >
          <input
            type="file"
            id="avatar-input"
            name="avatar"
            accept="image/png, image/gif, image/jpeg"
            on:change={() => avatarForm.submit()}
          />
        </form>
        <label class="img-class" for="avatar-input">
          <img
            src={API_URL + "/users/avatar"}
            alt="avatar"
            class="profile-img"
          />
        </label>
      {/if}
    </div>
    <div class="profile-body">
      {#if !edit}
        <p>
          <button on:click={() => dispatch("send-message", username)}>Send PM</button>
          <button on:click={() => dispatch("invite-to-game", username)}>
            Invite to Game
          </button>
        </p>
        <p>
          <button on:click={() => dispatch("add-friend", username)}>
            Add Friend
          </button>
        {#if blockedUsers.some((usr) => usr.username === username)}
          <button on:click={() => unblockUser(username)}>
            Unblock User
          </button>
        {:else}
          <button on:click={() => blockUser(username)}>
            Block User
          </button>
        {/if}
        </p>
      {/if}
      <p>
        <button on:click={() => dispatch("view-history", user.ftId)}
          >View History</button
        >
      </p>
      <p>Rank: {user.rank}</p>
      <p>Wins: {user.wins}</p>
      <p>Looses: {user.looses}</p>
      <p>Winrate: {user.winrate.toFixed(2)}%</p>
    </div>
    {#if edit}
      <form
        id="update-form-username"
        class="username"
        on:submit|preventDefault={handleSubmitUsername}
      >
        <input type="text" id="username" bind:value={username} required/>
        <button type="submit" class="username" form="update-form-username"
          >Change</button
        >
      </form>
      <form
        id="update-form-email"
        class="username"
        on:submit|preventDefault={handleSubmitEmail}
      >
        <input type="text" id="email" bind:value={email} required/>
        <button type="submit" class="username" form="update-form-email"
          >Change</button
        >
      </form>
      <button type="button" on:click={handle2fa}>
        {#if user.twoFA}
          Disable 2FA
        {:else}
          Enable 2FA
        {/if}
      </button>
      <button id="logout" type="button" on:click={logout}>Log Out</button>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .profile {
    background-color: #343a40;
    border: 1px solid #495057;
    border-radius: 5px;
    padding: 1rem;
    max-width: 80%;
    max-height: 80vh;
    overflow: auto;
    width: 500px;
    color: #e8e6e3;
  }

  .profile-header {
    display: flex;
    align-items: center;
  }

  .profile-header {
    margin: auto;
    justify-content: center;
  }

  .profile-img {
    max-width: 80%;
    width: 256px;
    height: auto;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

  #avatar-input {
    display: none;
  }

  .profile > h3 {
    display: flex;
    justify-content: center;
  }

  .profile-body > p {
    display: flex;
    justify-content: center;
  }

  .username {
    text-align: center;
  }

  #logout {
    float: right;
  }

  mark {
    background-color: #198754;
    padding: 0 0.2rem;
    color: #e8e6e3;
  }

  button {
    background-color: #198754;
    border: none;
    color: #e8e6e3;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease-in-out;
    outline: none;
    margin: 0.5rem;
  }

  button:hover {
    background-color: #157347;
  }

  button:focus {
    box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.25);
  }
</style>
