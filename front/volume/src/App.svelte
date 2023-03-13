<script lang="ts" context="module">
  export enum APPSTATE {
    HOME = "/",
    PROFILE = "/profile",
    HISTORY = "/history",
    HISTORY_ID = "/history_id",
    FRIENDS = "/friends",
    CHANNELS = "/channels",
    LEADERBOARD = "/leaderboard",
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

  import { store, getUser, login, verify, API_URL } from "./Auth";
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
    userProfile = $store;
    setAppState(APPSTATE.PROFILE);
  }

  let userProfile: Player;
  async function openIdProfile(event: CustomEvent<string>) {
    console.log("Opening profile: " + event.detail);
    const res = await fetch(API_URL + "/user/" + event.detail, {
      mode: "cors",
    });
    userProfile = await res.json();
    setAppState(APPSTATE.PROFILE_ID);
  }

  // HISTORY
  async function clickHistory() {
    setAppState(APPSTATE.HISTORY);
  }

  async function openIdHistory(event: CustomEvent<string>) {
    setAppState(APPSTATE.HISTORY_ID);
  }

  // FRIENDS
  let friends: Friend[] = [];
  let invits: Friend[] = [];
  let friendsInterval: ReturnType<typeof setInterval>;

  async function getFriends(): Promise<Friend[]> {
    let response = await fetch(API_URL + "/friends", {
      credentials: "include",
      mode: "cors",
    });
    return await response.json();
  }
  async function getInvits(): Promise<Friend[]> {
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
      username: usernameFake,
      socketKey: ftIdFake,
    };
    store.set(user);
    fakeUser = true;
    fakemenu = false;
  }
</script>

<div>
  {#if $store === null}
    <div class="login-div">
      <h3 class="test">Please log in with 42 api to access the website.</h3>
      <img
        class="img-42"
        src="https://translate.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg"
        alt="logo_42"
      />
      <button class="login-button" type="button" on:click={login}>Log In</button
      >
    </div>
  {:else if $store.twoFA === true && $store.isVerified === false}
    <h1><button type="button" on:click={verify}>verify</button></h1>
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
        <MatchHistory />
      </div>
    {/if}
    {#if appState === APPSTATE.HISTORY_ID}
      <div
        on:click={() => setAppState(APPSTATE.PROFILE)}
        on:keydown={() => setAppState(APPSTATE.PROFILE)}
      >
        <MatchHistory username={userProfile.username} />
      </div>
    {/if}
    {#if appState === APPSTATE.PROFILE}
      <div on:click={resetAppState} on:keydown={resetAppState}>
        <Profile user={userProfile} edit={1} on:view-history={openIdHistory} />
      </div>
    {/if}
    {#if appState === APPSTATE.PROFILE_ID}
      <div
        on:click={() =>
          setAppState(APPSTATE.CHANNELS + "#" + selectedChannel.name)}
        on:keydown={() =>
          setAppState(APPSTATE.CHANNELS + "#" + selectedChannel.name)}
      >
        <Profile user={userProfile} edit={0} on:view-history={openIdHistory} />
      </div>
    {/if}

    {#if fakemenu}
      <FakeLogin bind:username={usernameFake} bind:ftId={ftIdFake} />
      <button on:click={impersonate}>Impersonate</button>
      <button on:click={() => (fakemenu = false)}>No impersonate</button>
    {:else}
      <Pong bind:this={pong} {appState} {setAppState} {fakeUser} />
    {/if}
  {/if}
</div>

<style>
  .login-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10vh;
  }

  .img-42 {
    -webkit-filter: invert(100%);
    filter: invert(100%);
    width: 64px;
    height: 64px;
  }

  .login-button {
    display: inline;
  }
</style>
