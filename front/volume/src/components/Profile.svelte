<script lang="ts" context="module">
  export interface Player {
    username: string;
    wins: number;
    looses: number;
    matchs: number;
    winrate: number;
    rank: number;
    twoFA: boolean;
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { API_URL, store, logout } from "../Auth";

  export let edit: number;
  export let user: any;

  let avatarForm: HTMLFormElement;

  const dispatch = createEventDispatcher();
  async function handleSubmit() {
    let response = await fetch(API_URL, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({ username: user.username }),
      credentials: "include",
    });
    if (response.ok) {
      alert("Succefully changed username.");
      $store.username = user.username;
    }
  }

  async function handle2fa(event: Event) {
    event.preventDefault();
    user.twoFA = !user.twoFA;
    let response = await fetch(API_URL, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify(user),
      credentials: "include",
    });
    if (response.ok) {
      alert("Succefully " + (user.twoFA ? "enabled" : "disabled") + " 2FA");
    }
  }
</script>

<div class="overlay">
  <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
    <h3>===| <mark>{user.username}'s Profile</mark> |===</h3>
    <div class="profile-header">
      {#if edit == 0}
        <img src={API_URL + "/avatar"} alt="avatar" class="profile-img" />
      {:else}
        <form
          action={`${API_URL}/avatar`}
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
          <img src={API_URL + "/avatar"} alt="avatar" class="profile-img" />
        </label>
      {/if}
    </div>
    <div class="profile-body">
      <p>
        <button on:click={() => dispatch("view-history", user.ftId)}
          >View History</button
        >
      </p>
      <p>Wins: {user.wins}</p>
      <p>Looses: {user.looses}</p>
      <p>Winrate: {user.winrate}%</p>
      <p>Rank: {user.rank}</p>
    </div>
    {#if edit == 1}
      <form
        id="username-form"
        class="username"
        on:submit|preventDefault={handleSubmit}
      >
        <input type="text" id="username" bind:value={user.username} />
        <button type="submit" class="username" form="username-form"
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
    z-index: 9998;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .profile {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 375px;
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
    width: 256px;
    height: 256px;
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
</style>
