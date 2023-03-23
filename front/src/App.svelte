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
  import Modal from "svelte-simple-modal";
  import Profile from "./components/Profile.svelte";
  import MatchHistory from "./components/MatchHistory.svelte";
  import Friends, { addFriend } from "./components/Friends.svelte";
  import Chat from "./components/Chat.svelte";
  import Channels, {openDirectChat} from "./components/Channels.svelte";
  import Leaderboard from "./components/Leaderboard.svelte";
  import { popup } from "./components/Alert/content";
  import Pong from "./components/Pong/Pong.svelte";
  import type { ChannelsType } from "./components/Channels.svelte";
  import { store, getUser, login, verify } from "./Auth";

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
    history.pushState({ appState: newState, prevState: appState }, "", newState);
    appState = newState;
  }

  onMount(() => {
    getUser();
  });
  setInterval(() => {
    getUser();
  }, 15000);

  function clickProfile() {
    profileUsername = $store.username
    setAppState(APPSTATE.PROFILE);
  }

  let profileUsername: string = $store?.username ?? "";
  async function openIdProfile(event: CustomEvent<string>) {
    profileUsername = event.detail;
    setAppState(APPSTATE.PROFILE_ID);
  }
  $: console.log("New profileUsername:", profileUsername)
  async function clickHistory() {
    setAppState(APPSTATE.HISTORY);
  }

  async function clickFriends() {
    setAppState(APPSTATE.FRIENDS);
  }

  async function clickLeaderboard() {
    setAppState(APPSTATE.LEADERBOARD);
  }

  function clickChannels() {
    setAppState(APPSTATE.CHANNELS);
  }
  let selectedChannel: ChannelsType;
  const handleSelectChannel = (channel: ChannelsType) => {
    selectedChannel = channel;
    setAppState(APPSTATE.CHANNELS + "#" + channel.name);
  };

  // GAME
  let pong: Pong;
  let gamePlaying: boolean = false;
  let failedGameLogIn: boolean = false;
  let resetGameConnection: () => void;
</script>

<div>
  <Modal show={$popup}>
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
    <div class="login-div">
      <button class="login-button" type="button" style="width:100%;height:100%;font-size:xx-large;" on:click={verify}>Verify</button
      >
    </div>
  {:else}
    {#if !failedGameLogIn && !gamePlaying}
      <Navbar
        {clickProfile}
        {clickHistory}
        {clickFriends}
        {clickChannels}
        {clickLeaderboard}
        {failedGameLogIn}
        {gamePlaying}
      />

      {#if appState.includes(`${APPSTATE.CHANNELS}#`)}
        {#key appState}
          <div
            on:click={() => setAppState(APPSTATE.CHANNELS)}
            on:keydown={() => setAppState(APPSTATE.CHANNELS)}
          >
            <Chat
              {setAppState}
              bind:channel={selectedChannel}
              on:view-profile={openIdProfile}
              on:add-friend={addFriend}
              on:invite-to-game={pong.inviteToGame}
              on:return-home={resetAppState}
            />
          </div>
        {/key}
      {/if}
      {#if appState.includes(APPSTATE.CHANNELS)}
        <div
          class="{appState !== APPSTATE.CHANNELS ? 'hidden' : ''}"
          on:click={resetAppState}
          on:keydown={resetAppState}
        >
          <Channels onSelectChannel={handleSelectChannel} />
        </div>
      {/if}
      {#if appState === APPSTATE.LEADERBOARD}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Leaderboard />
        </div>
      {/if}
      {#if appState == APPSTATE.FRIENDS}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Friends 
            {setAppState}
            on:view-profile={openIdProfile}
            on:invite-to-game={pong.inviteToGame}
          />
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
          <MatchHistory username={profileUsername} />
        </div>
      {/if}
      {#if appState === APPSTATE.PROFILE}
        <div on:click={resetAppState} on:keydown={resetAppState}>
          <Profile {resetGameConnection} {gamePlaying} bind:username={profileUsername} on:view-history={() => setAppState(APPSTATE.HISTORY_ID)} />
        </div>
      {/if}
      {#if appState === APPSTATE.PROFILE_ID}
        <div
          on:click={() => setAppState(history.state.prevState)}
          on:keydown={() => setAppState(history.state.prevState)}
        >
          <Profile
            {gamePlaying}
            bind:username={profileUsername}
            on:send-message={openDirectChat}
            on:view-history={() => setAppState(APPSTATE.HISTORY_ID)}
            on:add-friend={addFriend}
            on:invite-to-game={pong.inviteToGame}
          />
        </div>
      {/if}
    {/if}
    <Pong bind:gamePlaying={gamePlaying} bind:this={pong} bind:failedGameLogIn={failedGameLogIn} {appState} {setAppState} bind:resetGameConnection={resetGameConnection} />
  {/if}

</Modal>
</div>

<style>
  :global(body) {
    background-color: #212529;
    color: #e8e6e3;
    margin: 0;
    padding: 0;
  }

  .login-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
  }

  .img-42 {
    -webkit-filter: invert(100%);
    filter: invert(100%);
    width: 64px;
    height: 64px;
  }

  .login-button {
    display: inline-block;
    background-color: #198754;
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease-in-out;
  }

  .login-button:hover {
    background-color: #157347;
  }

  .login-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.25);
  }

  .hidden {
	display: none;
  }
</style>
