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
  import Channels, { formatChannelNames } from "./components/Channels.svelte";
  import Leaderboard from "./components/Leaderboard.svelte";

  import Pong from "./components/Pong/Pong.svelte";
  import type { ChannelsType } from "./components/Channels.svelte";
  import { API_URL } from "./Auth";

  import { store, getUser, login, verify } from "./Auth";
  import FakeLogin from "./FakeLogin.svelte";

  // Single Page Application config
  let appState: string = APPSTATE.HOME;

  async function updateChat() {
    const urlSplit = appState.split("#", 2)
    if (appState.includes(APPSTATE.CHANNELS) && urlSplit.length > 1) {
      const currentChannelName = appState.split("#", 2)[1];
      fetch(API_URL + "/channels", {
        credentials: "include",
        mode: "cors",
      }).then((res) => {
        res.json().then(async (channels) => {
          await formatChannelNames(channels);
          const channel = channels.find((c: ChannelsType) => c.name === currentChannelName);
          if (channel) {
            chan.selectChat(channel.id);
          } else {
            alert("Failed loading channel");
          }
        });
      }).catch(() => {
        alert("Failed loading channel");
      });
    }
  }

  history.replaceState({ appState: "" }, "", "/");
  window.onpopstate = (e: PopStateEvent) => {
    if (e.state) {
      appState = e.state.appState;
      void updateChat();
    }
  };

  function resetAppState() {
    setAppState(APPSTATE.HOME);
  }

  function setAppState(newState: APPSTATE | string) {
    if (newState === appState) return;
    appState = newState;
    history.pushState({ appState }, "", appState);
    void updateChat();
  }

  onMount(() => {
    getUser();
  });
  setInterval(() => {
    getUser();
  }, 15000);

  function clickProfile() {
    setAppState(APPSTATE.PROFILE);
  }

  let profileUsername: string = "";
  async function openIdProfile(event: CustomEvent<string>) {
    profileUsername = event.detail;
    setAppState(APPSTATE.PROFILE_ID);
  }

  async function getDMs(username: string): Promise<Response> {
    const response = await fetch(API_URL + "/channels/dms/" + username, {
      credentials: "include",
      mode: "cors",
    });
    return response;
  }

  let chan: Channels;
  async function openDirectChat(event: CustomEvent<string>) {
    const DMUsername = "test";
    // const DMUsername = event.detail;
    let DMChannel: Array<ChannelsType> = [];
    const res = await getDMs($store.username)
    if (res.ok) {
      DMChannel = await res.json();
      if (DMChannel.length != 0) {
        chan.selectChat(DMChannel[0].id);
      } else {
        console.log("Creating DMChannel: " + $store.username + "&" + DMUsername)
        fetch(API_URL + "/channels", {
          credentials: "include",
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "none",
            owner: $store.ftId,
            password: "",
            isPrivate: true,
            isDM: true,
            otherDMedUsername: DMUsername
          }),
        }).then(async () => {
          const response = await getDMs($store.username)
          if (response.ok) {
              DMChannel = await response.json(); 
              if (DMChannel.length != 0) {
                chan.selectChat(DMChannel[0].id);
              } else {
                alert("Error creating DM");
              }
          } else {
            alert("Error creating DM");
          }
        }).catch((error) => {
          alert(error.message);
        })
      }
    } else {
      alert("Error creating DM");
    }
  }

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
      <div
        class="{appState.replace(APPSTATE.CHANNELS, "") === "" ? 'hidden' : ''}"
        on:click={() => setAppState(APPSTATE.CHANNELS)}
        on:keydown={() => setAppState(APPSTATE.CHANNELS)}
      >
        <Chat
          channel={selectedChannel}
          on:view-profile={openIdProfile}
          on:add-friend={addFriend}
          on:invite-to-game={pong.inviteToGame}
          on:send-message={openDirectChat}
        />
      </div>
      <div
        class="{appState.replace(APPSTATE.CHANNELS, "") !== "" ? 'hidden' : ''}"
        on:click={resetAppState}
        on:keydown={resetAppState}
      >
        <Channels bind:this={chan} onSelectChannel={handleSelectChannel} />
      </div>
    {/if}
    {#if appState === APPSTATE.LEADERBOARD}
      <div on:click={resetAppState} on:keydown={resetAppState}>
        <Leaderboard />
      </div>
    {/if}
    {#if appState === APPSTATE.FRIENDS}
      <div on:click={resetAppState} on:keydown={resetAppState}>
        <Friends />
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
        <Profile on:view-history={() => setAppState(APPSTATE.HISTORY_ID)} />
      </div>
    {/if}
    {#if appState === APPSTATE.PROFILE_ID}
      <div
        on:click={() =>
          setAppState(APPSTATE.CHANNELS + "#" + selectedChannel.name)}
        on:keydown={() =>
          setAppState(APPSTATE.CHANNELS + "#" + selectedChannel.name)}
      >
        <Profile
          username={profileUsername}
          on:view-history={() => setAppState(APPSTATE.HISTORY_ID)}
        />
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
