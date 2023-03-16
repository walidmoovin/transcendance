<script lang="ts" context="module">
  export interface ChannelsType {
    id: number;
    name: string;
    isPrivate: boolean;
    password: string;
    owner: number;
  }
  import { onMount } from "svelte";
  import { API_URL, store } from "../Auth";
  import { socket } from "../socket";
</script>

<script lang="ts">
  //--------------------------------------------------------------------------------/
  let channelMode = "";
  const channelOptions = ["public", "private", "direct"];

  const joinChannel = async (id: number) => {
    socket.emit("joinChannel", {
      UserId: $store.ftId,
      ChannelId: id,
    });
  };

  const getChannels = async () => {
    const res = await fetch(API_URL + "/channels", {
      credentials: "include",
      mode: "cors",
    });
    if (res.ok) channels = await res.json();
  };
  
  let channels: Array<ChannelsType> = [];
    onMount(async () => {
    getChannels()
    });

  //--------------------------------------------------------------------------------/

  export let onSelectChannel: (channel: ChannelsType) => void;
  const selectChat = (id: number) => {
    const channel = channels.find((c) => c.id === id);
    if (channel) {
      joinChannel(id);
      onSelectChannel(channel);
    }
  };

  //--------------------------------------------------------------------------------/

  const createChannel = async () => {
    let name, friend;
    if (channelMode === "direct") {
      friend = prompt("Invite a friend to your channel:");
      const response = await fetch(API_URL + "/users/" + friend + "/byname", {
      credentials: "include",
      method: "GET",
      mode: "cors",});
      if (!response.ok) {
        alert("Error getting user infos");
        return
      }
    }
    else name = prompt("Enter a name for the new channel:");
    if (name) {
      let password = "";
      if (channelMode === "private")
        password = prompt("Enter a password for the new channel:");
      if (friend !== undefined) name = "💬 " + $store.username + "/" + friend;
      else name = "🚪 " + name;
      const response = await fetch(API_URL + "/channels", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          owner: $store.ftId,
          password: password,
          isPrivate: channelMode === "private" || channelMode === "direct",
          direct: friend,
        }),
      });
      if (response.ok) {
        channels.push(await response.json());
      } else {
        alert("Error creating channel");
      }
      const res = await fetch(API_URL + "/channels", {
        credentials: "include",
        mode: "cors",
      });
      if (res.ok) channels = await res.json();
      getChannels()
    }
  };

  //--------------------------------------------------------------------------------/

  const removeChannel = async (id: number) => {
    let string = prompt("type 'delete' to delete this channel");
    if (string === "delete") {
      const response = await fetch(API_URL + "/channels/" + id, {
        credentials: "include",
        method: "DELETE",
        mode: "cors",
      });
      if (response.ok) channels = channels.filter((c) => c.id !== id);
      else alert("Error deleting channel");
    }
  };

  //--------------------------------------------------------------------------------/

  const inviteChannel = async (id: number) => {
    let string = prompt("Enter the username of the user you want to invite");
    const response = await fetch(API_URL + "/users/" + string + "/byname", {
      credentials: "include",
      method: "GET",
      mode: "cors",
    });
    if (response.ok) {
      const user = await response.json();
      const response2 = await fetch(API_URL + "/channels/" + id + "/invite", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.ftId,
        }),
      });
      if (response2.ok) {
        channels.push(await response2.json());
      } else {
        alert("Error inviting user");
      }
    } else {
      alert("Error getting user infos");
    }
  };

  //--------------------------------------------------------------------------------/

  const changePassword = async (id: number) => {
    let string = prompt(
      "Enter the new password for this channel (leave empty to remove password) :"
    );
    const response = await fetch(API_URL + "/channels/" + id + "/password", {
      credentials: "include",
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: string,
      }),
    });
    if (response.ok) {
      channels.push(await response.json());
    } else {
      alert("Error changing password");
    }
  };

  //--------------------------------------------------------------------------------/
</script>

<div class="overlay">
  <div class="channels" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if channels.length > 0}
        <h2>Channels</h2>
        {#each channels.slice(0, 10) as _channels}
          <li>
            <span>{_channels.name}</span>
            <button on:click={() => selectChat(_channels.id)}>🔌</button>
            <button
              on:click={() => removeChannel(_channels.id)}
              on:keydown={() => removeChannel(_channels.id)}>🗑️</button
            >
            <button on:click={() => inviteChannel(_channels.id)}>🤝</button>
            <button on:click={() => changePassword(_channels.id)}
              >Edit Password</button
            >
          </li>{/each}
      {:else}
        <p>No channels available</p>
      {/if}
      <div>
        <select bind:value={channelMode}>
          {#each channelOptions as option}
            <option value={option} selected={channelMode === option}
              >{option}</option
            >
          {/each}
        </select>
        {#if channelMode != ""}
          <button class="button" on:click={createChannel}>Create Channel</button
          >
        {/if}
      </div>
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
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .channels {
    background-color: #5f5e5e;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 1rem;
  }

  p {
    font-size: 14px;
    margin-bottom: 1rem;
  }

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  button {
    background-color: #6b8e23;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    margin-bottom: 5px;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #dedede;
    border-radius: 5px;
    background-color: #5e5d5d;
    font-size: 14px;
    margin-bottom: 1rem;
    appearance: none;
    cursor: pointer;
  }

  .button {
    background-color: #6b8e23;
    color: #ffffff;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    width: 100%;
  }
</style>
