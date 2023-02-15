<script lang="ts">
  export let links = [
    { text: "Home", url: "/" },
    { text: "Play", url: "/Play" },
    { text: "Spectate", url: "/Spectate"},
    { text: "Chat", url: "/Chat"},
    { text: "History", url: "/History"},
    { text: "Friends", url: "/Friends"},
    { text: "Profile", url: "/Profile" }
  ];
  export let clickProfile = () => {};
  export let clickHistory = () => {};
  export let clickFriends = () => {};
  export let clickSpectate = () => {};
</script>

<nav class="navigation-bar">
  <ul>
    {#each links as link}
      {#if link.text === "Profile" || link.text === "History" || link.text === "Friends" || link.text === "Spectate"}
        {#if link.text === "Spectate"}
          <li>
            <button on:click={clickSpectate}>
              <p>Spectate</p>
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
              <img src="img/profileicon.png" alt="profile icon">
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
      {:else}
        <li>
          <a href={link.url}>{link.text}</a>
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

  .navigation-bar a {
    text-decoration: none;
    color: #333;
  }

  .navigation-bar img {
    width: 2rem;
    height: 2rem;
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