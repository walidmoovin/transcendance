<script lang="ts" context="module">
  export enum APPSTATE {
    HOME = "/",
    PROFILE = "/profile",
    HISTORY = "/history",
    FRIENDS = "/friends",
    SPECTATE = "/spectate",
    CHANNELS = "/channels",
    LEADERBOARD = "/leaderboard",
    SPECTATE_GAME = "/spectate_game",
    CREATE_GAME = "/create-game",
    MATCHMAKING = "/matchmaking",
    PROFILE_ID = "/profile_id",
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./components/NavBar.svelte";

  import Profile from "./components/Profile.svelte";
  import MatchHistory from "./components/MatchHistory.svelte";
  import Friends, { addFriend } from "./components/Friends.svelte";
  import Chat from "./components/Chat.svelte";
  import Channels from "./components/Channels.svelte";
  import Leaderboard from "./components/Leaderboard.svelte";

  import Pong from "./components/Pong/Pong.svelte";
  import type { Player } from "./components/Profile.svelte";
  import type { Match } from "./components/MatchHistory.svelte";
  import type { Friend } from "./components/Friends.svelte";
  import type { ChannelsType } from "./components/Channels.svelte";

  import { store, getUser, login, API_URL } from "./Auth";
  import FakeLogin from "./FakeLogin.svelte";

  // Single Page Application config
  let appState: string = APPSTATE.HOME;

  history.replaceState({ appState: "" }, "", "/");
  window.onpopstate = (e: PopStateEvent) => {
    if (e.state) {
      appState = e.state.appState;
    }
  };

  function resetAppState() {
    setAppState(APPSTATE.HOME);
  }

  function setAppState(newState: APPSTATE | string) {
    if (newState === appState) return;
    appState = newState;
    history.pushState({ appState }, "", appState);
  }

  // PROFILE
  onMount(() => {
    getUser();
  });
  setInterval(() => {
    getUser();
  }, 15000);
  function clickProfile() {
    setAppState(APPSTATE.PROFILE);
  }

  let userProfile: Player;
  async function openIdProfile(event: CustomEvent<string>) {
    console.log("Opening profile: " + event.detail);
    const res = await fetch(API_URL + "/user/" + event.detail, {
      method: "get",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });
    userProfile = await res.json();
    setAppState(APPSTATE.PROFILE_ID);
  }

  // HISTORY
  let matches: Array<Match>;
  async function clickHistory() {
    setAppState(APPSTATE.HISTORY);
    matches = await getHistory();
  }

  export async function getHistory(): Promise<Array<Match>> {
    let response = await fetch(API_URL + "/history/" + $store.ftId, {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }

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

  async function clickFriends() {
    setAppState(APPSTATE.FRIENDS);
    friends = await getFriends();
    invits = await getInvits();
    friendsInterval = setInterval(async () => {
      friends = await getFriends();
      invits = await getInvits();
    }, 5000);
  }

  // CHANNELS
  function clickChannels() {
    setAppState(APPSTATE.CHANNELS);
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
    setAppState(APPSTATE.CHANNELS + "#" + channel.name);
  };

  // LEADERBOARD
  let leaderboard: Array<Player> = [];

  export async function getLeader(): Promise<Player[]> {
    let response = await fetch(API_URL + "/leaderboard", {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }

  async function clickLeaderboard() {
    leaderboard = await getLeader();
    setAppState(APPSTATE.LEADERBOARD);
  }

  // GAME
  let pong: Pong;

  // FAKE LOGIN
  let usernameFake = "test";
  let ftIdFake = "42";
  let fakemenu = true;
  let fakeUser = false;
  function impersonate() {
    const user = {
      username: "test",
      socketKey: "42",
    };
    store.set(user);
    fakeUser = true;
    fakemenu = false;
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
        {clickChannels}
        {clickLeaderboard}
      />
      {#if appState.includes(APPSTATE.CHANNELS)}
        {#if appState.replace(APPSTATE.CHANNELS, "") !== ""}
          <div
            on:click={() => setAppState(APPSTATE.CHANNELS)}
            on:keydown={() => setAppState(APPSTATE.CHANNELS)}
          >
            <Chat
              chatMessages={selectedChannel.messages}
              on:view-profile={openIdProfile}
              on:add-friend={addFriend}
              on:invite-to-game={pong.inviteToGame}
            />
          </div>
        {:else}
          <div on:click={resetAppState} on:keydown={resetAppState}>
            <Channels {channels} onSelectChannel={handleSelectChannel} />
          </div>
        {/if}
      {/if}
      {#if appState === APPSTATE.LEADERBOARD}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Leaderboard {leaderboard} />
        </div>
      {/if}
      {#if appState === APPSTATE.FRIENDS}
        <div
          on:click={() => {
            resetAppState();
            clearInterval(friendsInterval);
          }}
          on:keydown={() => {
            resetAppState();
            clearInterval(friendsInterval);
          }}
        >
          <Friends {friends} {invits} />
        </div>
      {/if}
      {#if appState === APPSTATE.HISTORY}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <MatchHistory {matches} />
        </div>
      {/if}
      {#if appState === APPSTATE.PROFILE}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Profile user={$store} edit={1} />
        </div>
      {/if}
      {#if appState === APPSTATE.PROFILE_ID}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Profile user={userProfile} edit={0} />
        </div>
      {/if}

      {#if fakemenu}
        <FakeLogin username={usernameFake} ftId={ftIdFake} />
        <button on:click={impersonate}>Impersonate</button>
        <button on:click={() => (fakemenu = false)}>No impersonate</button>
      {:else}
        <Pong bind:this={pong} {appState} {setAppState} {fakeUser} />
      {/if}
    {/if}
  </div>
</main>

<style>
</style>
