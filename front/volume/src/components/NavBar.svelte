<script lang="ts">
  let api =
    "http://" +
    import.meta.env.VITE_HOST +
    ":" +
    import.meta.env.VITE_BACK_PORT;
  export let links = [
    { text: "Home", url: "img/pong.png" },
    { text: "Spectate" },
    { text: "Channels" },
    { text: "History" },
    { text: "Friends" },
    { text: "Profile" },
  ];
  export let clickProfile = () => {};
  export let clickHistory = () => {};
  export let clickFriends = () => {};
  export let clickSpectate = () => {};
  export let clickChannels = () => {};
</script>

<nav class="navigation-bar">
  <ul>
    {#each links as link}
      {#if link.text === "Spectate"}
        <li>
          <button on:click={clickSpectate}>
            <p>Spectate</p>
          </button>
        </li>
      {/if}
      {#if link.text === "Channels"}
        <li>
          <button on:click={clickChannels}>
            <p>Channels</p>
          </button>
        </li>
      {/if}
      {#if link.text === "Friends"}
        <li>
          <button on:click={clickFriends}>
            <p>Friends</p>
          </button>
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
          <button on:click={clickHistory}>
            <p>History</p>
          </button>
        </li>
      {/if}
      {#if link.text === "Home"}
        <li>
          <a href="/">
            <img src="img/pong.png" alt="home-icon" />
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</nav>

<style>
  .navigation-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    padding: 1rem;
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

  @media (max-width: 768px) {
    .navigation-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .navigation-bar ul {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .navigation-bar li {
      margin: 0;
      padding: 1rem;
      text-align: center;
    }
  }
</style>
