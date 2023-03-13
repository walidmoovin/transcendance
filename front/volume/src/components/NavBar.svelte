<script lang="ts">
  let api =
    "http://" +
    import.meta.env.VITE_HOST +
    ":" +
    import.meta.env.VITE_BACK_PORT;
  export let links = [
    { text: "Home" },
    { text: "Channels" },
    { text: "History" },
    { text: "Friends" },
    { text: "Leaderboard" },
    { text: "Profile" },
  ];
  export let clickProfile = () => {};
  export let clickHistory = () => {};
  export let clickFriends = () => {};
  export let clickChannels = () => {};
  export let clickLeaderboard = () => {};

  let hide = true;

  function toggle() {
    hide = !hide;
  }
</script>

<nav class="navigation-bar">
  <ul>
    <li>
      <img src="img/pong.png" alt="home-icon" />
    </li>
    <div class:links={hide}>
      {#each links as link}
        {#if link.text === "Leaderboard"}
          <li>
            <button on:click={clickLeaderboard}> Leaderboard </button>
          </li>
        {/if}
        {#if link.text === "Channels"}
          <li>
            <button on:click={clickChannels}> Channels </button>
          </li>
        {/if}
        {#if link.text === "Friends"}
          <li>
            <button on:click={clickFriends}> Friends </button>
          </li>
        {/if}
        {#if link.text === "Profile"}
          <li>
            <button on:click={clickProfile}>
              <img src={api + "/avatar"} alt="avatar" />
            </button>
          </li>
        {/if}
        {#if link.text === "History"}
          <li>
            <button on:click={clickHistory}> History </button>
          </li>
        {/if}
      {/each}
    </div>
    <button on:click={toggle}>
      <svg
        class="hamburger"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
      </svg>
    </button>
  </ul>
</nav>

<style>
  .navigation-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    padding: 1rem;
    max-height: 5vh;
  }

  .navigation-bar ul {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    padding: 0;
  }

  .navigation-bar li {
    margin: 0 1rem;
  }

  .navigation-bar img {
    width: 2rem;
    height: 2rem;
  }

  .navigation-bar button {
    border: none;
  }

  .hamburger {
    display: none;
  }

  .links {
    display: flex;
  }

  @media (max-width: 768px) {
    .navigation-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 0;
      max-height: none;
    }

    .navigation-bar ul {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 4px;
    }

    .navigation-bar li {
      margin: 0;
      text-align: center;
    }

    .hamburger {
      display: block;
      /* margin: 0 auto; */
    }

    .links {
      display: none;
    }
  }
</style>
