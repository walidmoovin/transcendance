<script lang="ts" context="module">
  import { API_URL, store } from "../Auth";
  import { APPSTATE} from "../App.svelte";
  import { createEventDispatcher } from "svelte";
  import { formatChannelNames, type ChannelsType } from "./Channels.svelte";
  import { show_popup } from "./Alert/content";
  import type { CreateChannelDto } from "./dtos/create-channel.dto";
</script>

<script lang="ts">
  export let username: string = "";
  export let setAppState: (newState: APPSTATE | string) => void;

  const dispatch = createEventDispatcher();

  async function getDMs(username: string): Promise<Response | null> {
	const res = await fetch(API_URL + "/channels/dms/" + username, {
		credentials: "include",
		mode: "cors",
	})
	if (res.ok)
		return res;
	else
		return null;
  }

  async function openDirectChat() {
    const DMUsername = username;
    let DMChannel: Array<ChannelsType> = [];
    const res = await getDMs(DMUsername)
    if (res && res.ok) {
      DMChannel = await res.json();
      if (DMChannel.length != 0)
        await formatChannelNames(DMChannel)
        setAppState(APPSTATE.CHANNELS + "#" + DMChannel[0].name)
	  } else {
      console.log("Creating DMChannel: " + $store.username + "&" + DMUsername)
      const body: CreateChannelDto = {
        name: "none",
        owner: $store.ftId,
        password: "",
        isPrivate: true,
        isDM: true,
        otherDMedUsername: DMUsername
      }
      fetch(API_URL + "/channels", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then(async () => {
        const response = await getDMs(DMUsername)
        if (response && response.ok) {
            DMChannel = await response.json(); 
            if (DMChannel.length != 0) {
              await formatChannelNames(DMChannel)
              setAppState(APPSTATE.CHANNELS + "#" + DMChannel[0].name)
            } else {
              show_popup("Error: Couldn't create DM.", false)
            }
        } else {
          show_popup("Error: Couldn't create DM.", false)
        }
      }).catch(() => {
        show_popup("Error: Couldn't create DM.", false)
      })
    }
  }

  const blockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/block/" + target.ftId, {
        method: "GET",
        credentials: "include",
        mode: "cors"
      });
      dispatch("updateHiddens", username)
    }
    if (response.ok) await show_popup("User blocked", false);
    else {
      const error = await response.json();
      await show_popup(error.message, false);
    }
    dispatch("close")
  };

  //--------------------------------------------------------------------------------/

  const unblockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/block/" + target.ftId, {
        credentials: "include",
        method: "DELETE",
        mode: "cors"
      });
      dispatch("updateHiddens", username)
    }
    if (response.ok) await show_popup("User unblocked", false);
    else {
      const error = await response.json();
      await show_popup(error.message, false);
    }
    dispatch("close")
  };
</script>

<div
  class="user-menu"
  on:click|stopPropagation
  on:keydown|stopPropagation
>
  <ul>
    <li>
      <button on:click={openDirectChat}> Send Message </button>
    </li>
    <li>
      <button on:click={() => dispatch("view-profile", username)}>
        View Profile
      </button>
    </li>
    <li>
      <button on:click={() => dispatch("add-friend", username)}>
        Add Friend
      </button>
    </li>
    <li>
      <button on:click={() => dispatch("invite-to-game", username)}>
        Invite to Game
      </button>
    </li>
    <li>
      <button on:click={() => blockUser(username)}>
        Block User
      </button>
    </li>
    <li><button on:click={() => dispatch("close")}> Close </button></li>
  </ul>
</div>
<style>
  .user-menu {
    position: absolute;
    background-color: #ffffff;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 1rem;
    max-height: 70%;
    overflow-y: auto;
    z-index: 1;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

</style>
