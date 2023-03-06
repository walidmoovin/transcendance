<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./components/NavBar.svelte";
  import Profile from "./components/Profile.svelte";
  import MatchHistory from "./components/MatchHistory.svelte";
  import type { Match } from "./components/MatchHistory.svelte";
  import Friends from "./components/Friends.svelte";
  import type { Friend } from "./components/Friends.svelte";
  import Spectate from "./components/Spectate.svelte";
  import type { SpectateType } from "./components/Spectate.svelte";
  import Pong from "./components/Pong/Pong.svelte";
  import Chat2 from "./components/Chat2.svelte";
  import Channels from "./components/Channels.svelte";
  import type { ChannelsType } from "./components/Channels.svelte";

  import { store, getUser, login, logout, API_URL } from "./Auth";

  // PROFILE

  onMount(() => {
    getUser();
  });
  setInterval(() => {
    getUser();
  },15000)

  let isProfileOpen = false;
  function clickProfile() {
    isProfileOpen = true;
  }

  // HISTORY

  let isHistoryOpen = false;
  function clickHistory() {
    isHistoryOpen = true;
  }
  let matches: Array<Match> = [
    { winner: "Alice", loser: "Bob", points: -5, rank: "22" },
    { winner: "Alice", loser: "Bob", points: 10, rank: "24" },
    { winner: "Alice", loser: "Bob", points: 10, rank: "24" },
    { winner: "Alice", loser: "Bob", points: 7, rank: "23" },
    { winner: "Alice", loser: "Bob", points: 10, rank: "24" },
    { winner: "Alice", loser: "Bob", points: 10, rank: "24" },
  ];

  // FRIENDS

  let friends: Friend[] = [];
  let invits: Friend[] = [];
  let friendsInterval: ReturnType<typeof setInterval>;

  export async function getFriends(): Promise<Friend[]> {
    let response = await fetch(API_URL + "/friends", {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }
  export async function getInvits(): Promise<Friend[]> {
    let response = await fetch(API_URL + "/invits", {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }

  let isFriendOpen = false;
  async function clickFriends() {
    isFriendOpen = true;
    friends = await getFriends();
    invits = await getInvits();
    friendsInterval = setInterval(async () => {
      friends = await getFriends();
      invits = await getInvits();
    }, 5000)
  }

  // SPECTATE
  let isSpectateOpen = false;
  function clickSpectate() {
    isSpectateOpen = true;
  }
  let spectate: Array<SpectateType> = [
    { player1: "Alice", player2: "Bob", id: "1" },
    { player1: "Alice", player2: "Bob", id: "4" },
    { player1: "Alice", player2: "Bob", id: "6" },
    { player1: "Alice", player2: "Bob", id: "8" },
    { player1: "Alice", player2: "Bob", id: "2" },
    { player1: "Alice", player2: "Bob", id: "3" },
  ];

  // CHANNELS
  let isChannelsOpen = false;
  function clickChannels() {
    isChannelsOpen = true;
  }
  let channels: Array<ChannelsType> = [
    { id: "1", name: "General", messages: [], privacy: "public", password: "" },
    {
      id: "2",
      name: "Lobby",
      messages: [],
      privacy: "private",
      password: "test",
    },
    { id: "3", name: "Game", messages: [], privacy: "private", password: "" },
  ];
  let selectedChannel: ChannelsType;
  const handleSelectChannel = (channel: ChannelsType) => {
    selectedChannel = channel;
  };
</script>

<main>
  <div>
    {#if $store === null}
      <h1><button type="button" on:click={login}>Log In</button></h1>
    {:else}
      <Navbar
        {clickProfile}
        {clickHistory}
        {clickFriends}
        {clickSpectate}
        {clickChannels}
      />
      {#if isChannelsOpen}
        {#if selectedChannel}
          <div
            on:click={() => (selectedChannel = undefined)}
            on:keydown={() => (selectedChannel = undefined)}
          >
            <Chat2 chatMessages={selectedChannel.messages} />
          </div>
        {/if}
        {#if !selectedChannel}
          <div
            on:click={() => (isChannelsOpen = false)}
            on:keydown={() => (isChannelsOpen = false)}
          >
            <Channels {channels} onSelectChannel={handleSelectChannel} />
          </div>
        {/if}
      {/if}
      {#if isSpectateOpen}
        <div
          on:click={() => (isSpectateOpen = false)}
          on:keydown={() => (isSpectateOpen = false)}
        >
          <Spectate {spectate} />
        </div>
      {/if}
      {#if isFriendOpen}
        <div
          on:click={() => {
            isFriendOpen = false;
            clearInterval(friendsInterval)
          }}
          on:keydown={() => (isFriendOpen = false)}
        >
          <Friends {friends} {invits} />
        </div>
      {/if}
      {#if isHistoryOpen}
        <div
          on:click={() => (isHistoryOpen = false)}
          on:keydown={() => (isHistoryOpen = false)}
        >
          <MatchHistory {matches} />
        </div>
      {/if}
      {#if isProfileOpen}
        <div
          on:click={() => (isProfileOpen = false)}
          on:keydown={() => (isProfileOpen = false)}
        >
          <Profile
            username={$store.username}
            wins={$store.wins}
            losses={$store.looses}
            winrate={$store.winrate}
            rank={$store.rank}
            is2faEnabled={false}
          />
        </div>
      {/if}
      <Pong />
    {/if}
  </div>
</main>

<style>
</style>
