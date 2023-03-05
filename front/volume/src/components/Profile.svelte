<script lang="ts">
  import { API_URL, store, logout } from "../Auth";

  export let username = $store.userame;
  export let realname = "";
  export let wins = 0;
  export let losses = 0;
  export let elo = 0;
  export let rank = -1;
  export let is2faEnabled = false;

  async function handleSubmit() {
    let response = await fetch(API_URL, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({ username: username }),
      credentials: "include",
    });
    if (response.ok) {
      alert("Succefully changed username.");
      $store.username = username;
    }
  }

  async function handle2fa(event: Event) {
    event.preventDefault();
    alert("Trying to " + (is2faEnabled ? "disable" : "enable") + " 2FA");
  }
</script>

<div class="overlay">
  <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="profile-header">
      <img class="profile-img" src={API_URL + "/avatar"} alt="avatar" />
      <h3>{realname}</h3>
      <form
        action={API_URL + "/avatar"}
        method="post"
        enctype="multipart/form-data"
      >
        <input type="file" id="avatar-input" name="avatar" />
        <input type="submit" />
      </form>
    </div>
    <div class="profile-body">
      <form on:submit|preventDefault={handleSubmit}>
        <div class="username">
          <label for="username">Username</label>
          <input type="text" id="username" bind:value={username} />
          <button type="submit">Submit</button>
        </div>
      </form>
      <p>Wins: {wins}</p>
      <p>Losses: {losses}</p>
      <p>Winrate: {(wins / (wins + losses)) * 100}%</p>
      <p>Elo : {elo}</p>
      <p>Rank: {rank}</p>
      <form class="two-factor-auth" on:submit={handle2fa}>
        <button type="submit">
          {#if is2faEnabled}
            Disable 2FA
          {:else}
            Enable 2FA
          {/if}
        </button>
      </form>
      <button type="button" on:click={logout}>Log Out</button>
    </div>
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

  .profile-img {
    width: 50px;
    height: 50px;
    margin-right: 1rem;
  }

  .two-factor-auth {
    margin-top: 1rem;
  }
</style>
