<script lang="ts" context="module">
  export interface User {
    username: string;
  }
</script>

<script lang="ts">

  export const API_URL = "http://" + import.meta.env.VITE_HOST + ":" + import.meta.env.VITE_BACK_PORT
  export const AUTH_SERVER_URL = API_URL + "/log/in"

  export let avatar = API_URL + "/avatar"
  export let username = "";
  export let realname = "";
  export let wins = 0;
  export let losses = 0;
  export let elo = 0;
  export let rank = -1;
  export let is2faEnabled = false;
  const handleSubmit = () => {
    const user: User = { username : username};
    fetch("http://localhost:3001/", {
      headers: {"content-type": "application/json"},
      method: "POST",
      body: JSON.stringify(user),
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  async function handle2fa(event: Event) {
    event.preventDefault();
    alert("Trying to " + (is2faEnabled ? "disable" : "enable") + " 2FA");
  }
</script>

<div class="overlay">
  <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="profile-header">
      <img class="profile-img" src={avatar} alt="avatar" />
      <h3>{realname}</h3>
      <form action={avatar}
        method="post"
        enctype="multipart/form-data">
        <label for="mavatar-input">Select a file:</label>
        <input type="file" id="avatar-input" name="avatar" />
        <br /><br />
        <input type="submit" />
      </form>
    </div>
    <div class="profile-body">
      <form on:submit|preventDefault={handleSubmit}>
        <div class="username">
          <label for="username">Username</label>
          <input type="text" id="username" bind:value={username} />
        </div>
        <button type="submit">Submit</button>
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
