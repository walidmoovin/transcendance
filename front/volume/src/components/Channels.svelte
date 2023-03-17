<script lang="ts" context="module">
  	import { getContext } from 'svelte';
	  import Alert from './Alert/Alert.svelte';
	  import { content,  popup} from './Alert/content'
    import { bind } from 'svelte-simple-modal';
	  const showDialog = () => {
	  }

  export interface ChannelsType {
    id: number;
    name: string;
    isPrivate: boolean;
    password: string;
    owner: User;
  }
  import { onMount } from "svelte";
  import { API_URL, store } from "../Auth";
  import { socket } from "../socket";
  import type User from "./Profile.svelte";

  export async function formatChannelNames(channel: Array<ChannelsType>): Promise<void> {
    const res = await fetch(API_URL + "/users/all", {
      credentials: "include",
      mode: "cors",
    })
    if (res.ok) {
      const users = await res.json()
      if (users) {
        channel.forEach((channel) => {
          let channelName = channel.name;
          if (channelName.startsWith("🚪 ")) return;

          const split = channelName.split("&");
          if (split.length > 1) {
            const firstID = parseInt(split[0]);
            const secondID = parseInt(split[1]);
            let newChannelName = channelName;

            users.forEach((user) => {
              if (user.ftId === firstID) {
                newChannelName = newChannelName.replace(
                  split[0],
                  user.username
                );
              }
              if (user.ftId === secondID) {
                newChannelName = newChannelName.replace(
                  split[1],
                  user.username
                );
              }
            });
            channel.name = newChannelName;
          } else {
            console.log("Could not format channel name")
          }
        });
      }
    }
  }
</script>

<script lang="ts">

  //--------------------------------------------------------------------------------//
  let channelMode = "";
  const channelOptions = ["public", "private", "protected"];

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
    if (res.ok) {
      const newChannels: Array<ChannelsType> = await res.json();
      await formatChannelNames(newChannels);
      channels = newChannels;
    }
  };

  let channels: Array<ChannelsType> = [];
  onMount(async () => {
    getChannels()
  });

  //--------------------------------------------------------------------------------/

  export let onSelectChannel: (channel: ChannelsType) => void;
  export const selectChat = (id: number) => {
    console.log("channel: ", id)
    popup.set(bind(Alert, {message:"Did not find channel", form : false}))
    getChannels().then(() => {
      const channel = channels.find((c) => c.id === id);
      if (channel) {
        joinChannel(id);
        onSelectChannel(channel);
      } else {
        alert("Did not find channel");
      }
    });
  };

  const createChannel = async () => {
    let name: string;
    let password = "";
    name = prompt("Enter a name for the new channel:");
	if (name.includes("#")) {
		alert("Channel name cannot contain #");
		return;
	}
    if (name) {
      if (channelMode === 'protected')
        password = prompt("Enter a password for the new channel:");
      name = "🚪 " + name;
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
          isPrivate: channelMode === "private",
        }),
      });
      if (!response.ok) alert("Error creating channel");
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
		alert("User invited");
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
        <h2>Channels <button style="margin-right :auto;" on:click={() => getChannels()}>🔄</button> </h2>
        {#each channels.slice(0, 10) as channel}
          <li>
            <span>{channel.name}</span>
            <div style="display:block; margin-right:10%">
            <button on:click={() => selectChat(channel.id)}>🔌</button>
            <button
              on:click={() => removeChannel(channel.id)}
              on:keydown={() => removeChannel(channel.id)}>🗑️</button
            >
            {#if channel.isPrivate == true}
            <button on:click={() => inviteChannel(channel.id)}>🤝</button>
            {/if}
            <button on:click={() => changePassword(channel.id)}>🔑</button>

            </div>
          </li>
        {/each}
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
    overflow-x:visible;
  }

  .channels {
    background-color: #343a40;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 1rem;
    width: 500px;
    overflow-y: scroll;
    overflow-x: auto;
    max-height: 80%;
  }

  h2 {
    margin-bottom: 1rem;
    font-size:xx-large;
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
    color:black;
    text-align: center;
    margin: 50;
    width: 100%;
    height: 15%;
    padding: 10px;
    border-radius: 20px;
    background: #eee;
    border: none; 
    outline: grey;
    display: inline-block;
    -webkit-appearance: none;
    -moz-appearance: none;
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

  span {
    width: 100%;
    outline: 10%;
    margin: 1%;
    height: 10%;
    font-size: 100%; /* Taille de la police en pourcentage */
    padding: 10px;
    top: 2px;
  }
</style>
