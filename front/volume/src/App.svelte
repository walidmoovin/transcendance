<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./components/NavBar.svelte";
  import Profile from "./components/Profile.svelte";
  import MatchHistory from "./components/MatchHistory.svelte";
  import type { Match } from "./components/MatchHistory.svelte";
  import Friends,{addFriend} from "./components/Friends.svelte";
  import type { Friend} from "./components/Friends.svelte";
  import Spectate from "./components/Spectate.svelte";
  import type { SpectateType } from "./components/Spectate.svelte";
  import Pong from "./components/Pong/Pong.svelte";
  import Chat2 from "./components/Chat2.svelte";
  import Channels from "./components/Channels.svelte";
  import type { ChannelsType } from "./components/Channels.svelte";
  import Leaderboard from "./components/Leaderboard.svelte";
  import type { Player } from "./components/Leaderboard.svelte"

  import { store, getUser, login, logout, API_URL } from "./Auth";

  // PROFILE

  onMount(() => {
    getUser();
  });
  setInterval(() => {
    getUser();
  }, 15000);

  let isProfileOpen = false;
  function clickProfile() {
    isProfileOpen = true;
  }

  let userProfile;
  let isIdProfileOpen = false;
  async function openIdProfile(event) {
    console.log("Opening profile: " + event.detail)
    isIdProfileOpen = true;
    const res = await fetch(API_URL + "/user/" + event.detail, {
      method: "get",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });
    userProfile = await res.json();
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
    }, 5000);
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

  let leaderboard: Player[] = [];
  export async function getLeader(): Promise<Player[]> {
    let response = await fetch(API_URL + "/leader", {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }

  // LEADERBOARD
  let isLeaderboardOpen = false;
  async function clickLeaderboard() {
    isLeaderboardOpen = true;
    leaderboard = await getLeader();
  }

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
        {clickLeaderboard}
      />
      {#if isChannelsOpen}
        {#if selectedChannel}
          <div
            on:click={() => (selectedChannel = undefined)}
            on:keydown={() => (selectedChannel = undefined)}
          >
            <Chat2 chatMessages={selectedChannel.messages} 
              on:view-profile={openIdProfile} on:add-friend={addFriend} />
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
      {#if isLeaderboardOpen}
        <div
          on:click={() => (isLeaderboardOpen = false)}
          on:keydown={() => (isLeaderboardOpen = false)}
        >
          <Leaderboard {leaderboard}/>
        </div>
      {/if}
      {#if isFriendOpen}
        <div
          on:click={() => {
            isFriendOpen = false;
            clearInterval(friendsInterval);
          }}
          on:keydown={() => {
	    isFriendOpen = false;
            clearInterval(friendsInterval)
          }}
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
	    user = {$store}
            edit = 1
          />
        </div>
      {/if}
      {#if isIdProfileOpen}
        <div
          on:click={() => (isIdProfileOpen = false)}
          on:keydown={() => (isIdProfileOpen = false)}
        >
          <Profile
	    user = {userProfile}
            edit = 0
          />
        </div>
      {/if}
      <Pong />
    {/if}
  </div>
</main>

<style>
</style>
