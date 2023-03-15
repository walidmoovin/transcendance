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
</script>

<script lang="ts">
  //--------------------------------------------------------------------------------/

  let channels: Array<ChannelsType> = [];
  onMount(async () => {
    const res = await fetch(API_URL + "/channels", {
      credentials: "include",
      mode: "cors",
    });
    if (res.ok) channels = await res.json();
  });

  //--------------------------------------------------------------------------------/

  export let onSelectChannel: (channel: ChannelsType) => void;
  const selectChat = (id: number) => {
    const channel = channels.find((c) => c.id === id);
    if (channel) {
      onSelectChannel(channel);
    }
  };

  //--------------------------------------------------------------------------------/

  const createChannel = async () => {
    const name = prompt("Enter a name for the new channel:");
    if (name) {
      const privacy = prompt(
        "Enter a privacy setting for the new channel (public/private):"
      );
      if (privacy !== "public" && privacy !== "private") {
        alert("Invalid privacy setting");
        return;
      }
      let password = "";
      password = prompt("Enter a password for the new channel:");
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
          password: password || "",
          isPrivate: privacy,
        }),
      });
      if (response.ok) {
        channels.push(await response.json());
      } else {
        alert("Error creating channel");
      }
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
      const response2 = await fetch(API_URL + "/channels/" + id, {
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
</script>

<div class="overlay">
  <div class="channels" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if channels.length > 0}
        <h2>Channels</h2>
        {#each channels.slice(0, 10) as _channels}
          <li>
            <span>{_channels.name}</span>
            <button on:click={() => selectChat(_channels.id)}>Enter</button>
            <button
              on:click={() => removeChannel(_channels.id)}
              on:keydown={() => removeChannel(_channels.id)}>delete</button
            >
            <button on:click={() => inviteChannel(_channels.id)}>invite</button>
          </li>{/each}
      {:else}
        <p>No channels available</p>
      {/if}
      <button on:click={createChannel}>Create Channel</button>
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
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
  }
</style>
