<script lang="ts" context="module">
  import { content, show_popup } from './Alert/content'
  import { onMount } from "svelte";
  import { API_URL, store } from "../Auth";
  import type User from "./Profile.svelte";
  import type { CreateChannelDto } from './dtos/create-channel.dto';
  import type { IdDto, PasswordDto } from './dtos/updateUser.dto';

  export interface ChannelsType {
    id: number;
    name: string;
    isPrivate: boolean;
    password: string;
    owner: User;
    admins: Array<User>;
    banned: Array<Array<number>>;
    muted: Array<Array<number>>;  
    isDM: boolean;
  }
  export interface ChatMessageServer {
    id: number;
    author: User;
    text: string;
  }
  export interface ChatMessage extends ChatMessageServer {
    hidden: boolean;
  }

  export async function formatChannelNames(channel: Array<ChannelsType>): Promise<void> {
    const res = await fetch(API_URL + "/users/all", {
      credentials: "include",
      mode: "cors",
    })
    if (res.ok) {
      const users: User[] = await res.json()
      if (users) {
        channel.forEach((channel) => {
          let channelName = channel.name;
          if (channelName.startsWith("🚪 ")) return;

          const split = channelName.split("&");
          if (split.length > 1) {
            const firstID = parseInt(split[0]);
            const secondID = parseInt(split[1]);
            let newChannelName = channelName;

            users.forEach((user: User) => {
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

  export async function getDMs(username: string): Promise<Response | null> {
    const res = await fetch(API_URL + "/channels/dms/" + username, {
      credentials: "include",
      mode: "cors",
    })
    if (res.ok)
      return res;
    else
      return null;
  }
</script>

<script lang="ts">

  //--------------------------------------------------------------------------------//
  let channelMode = "";
  const channelOptions = ["public", "private", "protected"];

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

  const createChannel = async () => {
    let password = "";
    await show_popup("Enter a name for the new channel:")
    const name: string = $content;
    if (name === "") return;
    if (name.includes("#")) {
      await show_popup("Channel name cannot contain #", false)
      return;
    }
    if (channels.some((chan) => chan.name === name)) {
        await show_popup("A channel with this name already exist", false)
      return;
    }
    if (channelMode === 'protected'){
      await show_popup("Enter a password for the new channel:", true, true)
      password = $content
      if (password == "") {
        await show_popup("Password is required #", false)
        return ;
      }
    }
    const editedName = "🚪 " + name;
    const body: CreateChannelDto = {
      name: editedName,
      owner: $store.ftId,
      password: password,
      isPrivate: channelMode === "private",
      isDM: false,
      otherDMedUsername: "",
    };
    const response = await fetch(API_URL + "/channels", {
      credentials: "include",
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok)  {
      const error = await response.json();
      await show_popup(error.message, false)
    }
    getChannels()
  };

  //--------------------------------------------------------------------------------/

  const removeChannel = async (id: number) => {
    await show_popup("press \"Okay\"to delete this channel", false);
    if ($content === "ok") {
      const response = await fetch(API_URL + "/channels/" + id, {
        credentials: "include",
        method: "DELETE",
        mode: "cors",
      });
      if (response.ok) channels = channels.filter((c) => c.id !== id);
      else {
        const error = await response.json();
        await show_popup(error.message, false)
      }
    }
  };

  //--------------------------------------------------------------------------------/

  const inviteChannel = async (id: number) => {
    await show_popup("Enter the username of the user you want to invite");
    const username = $content;
    if (username === "") return;
    const response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      method: "GET",
      mode: "cors",
    });
    if (response.ok) {
      const user = await response.json();
      console.log(user)
      const body: IdDto = {
        id: user.ftId
      }
      const response2 = await fetch(API_URL + "/channels/" + id + "/invite", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response2.ok) {
        await show_popup("User invited", false)
      } else {
        const error = await response2.json();
        await show_popup(error.message, false)
      }
    } else {
      const error = await response.json();
      await show_popup(error.message, false)
    }
  };

  //--------------------------------------------------------------------------------/

  const changePassword = async (id: number) => {
    await show_popup("Enter the new password for this channel (leave empty to remove password) :", true, true);
    const newPassword = $content;
    if (newPassword === "") return;
    const body: PasswordDto = {
      password: newPassword
    }
    const response = await fetch(API_URL + "/channels/" + id + "/password", {
      credentials: "include",
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      await show_popup(error.message, false)
    } else {
      getChannels()
      await show_popup("Password updated", false)
    }
  };

  //--------------------------------------------------------------------------------/
</script>

<div class="overlay">
  <div class="channels" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      <h2 >Channels <button class="refresh"  on:click={() => getChannels()}>🔄</button> </h2>
      {#if channels.length > 0}
        {#each channels as channel}
          <li>
            <span>{channel.name} : {channel.id}</span>
            <div style="display:block; margin-right:10%">
              <button on:click={() => onSelectChannel(channel)}>🔌</button>
              <button
                on:click={() => removeChannel(channel.id)}
                on:keydown={() => removeChannel(channel.id)}>🗑️</button
              >
              {#if channel.isPrivate == true && !channel.isDM}
                <button on:click={() => inviteChannel(channel.id)}>🤝</button>
              {/if}
              {#if !channel.isDM}
                <button on:click={() => changePassword(channel.id)}>🔑</button>
              {/if}
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
    overflow: auto;
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
    font-size: 100%;
  }
  
  .refresh {
    display: inline-block;
    background-color: rgb(187, 187, 187);
    color: #a0a0a0;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    position:relative; 
    top:-10px;
    right:auto
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
