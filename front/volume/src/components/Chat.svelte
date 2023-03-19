<script lang="ts" context="module">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { store, API_URL } from "../Auth";
  import { socket } from "../socket";
  import { show_popup, content } from "./Alert/content";
  import { APPSTATE } from "../App.svelte";
  import type { ChannelsType, chatMessagesType } from "./Channels.svelte";
  import type User from "./Profile.svelte";
</script>

<script lang="ts">
  let usersInterval: ReturnType<typeof setInterval>;
  let blockedUsers: Array<User> = [];
  let chatMembers: Array<User> = [];
  export let channel: ChannelsType;
  export let messages: Array<chatMessagesType> = [];
  let newText = "";

  export let setAppState: (newState: APPSTATE | string) => void;
  onMount(async () => {
    getMembers();
    usersInterval = setInterval(async () => {
      getMembers();
    }, 1000);
  });

  async function getMembers() {
    if (!channel) return;
    let res = await fetch(API_URL + "/users/blocked/", {
      credentials: "include",
      mode: "cors",
    });
    if (res.ok) blockedUsers = await res.json();
      res = await fetch(`${API_URL}/channels/${channel.id}/users`, {
      credentials: "include",
      mode: "cors"
    })
    if (res.ok) chatMembers = await res.json();
  }

  socket.on("newMessage", (msg: chatMessagesType) => {
    console.log(msg)
    messages = [...messages, msg];
  });


  socket.on("messages", (msgs: Array<chatMessagesType>) => {
    messages = msgs;
    console.log("You are joining channel: ", channel.name)
  });

  socket.on("failedJoin", (error: string) => {
    show_popup(`Failed to join channel: ${error}`, false) 
    setAppState("/channels")
  });


  onDestroy(() => {
    clearInterval(usersInterval)
    socket.disconnect();
  });

  //--------------------------------------------------------------------------------/

  const sendMessage = () => {
    if (newText !== "") {
      socket.emit("addMessage", {
        text: newText,
        UserId: $store.ftId,
        ChannelId: channel.id,
      });
      newText = "";
      const messagesDiv = document.querySelector(".messages");
      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    }
  };

  //--------------------------------------------------------------------------------/

  const dispatch = createEventDispatcher();
  let showProfileMenu = false;
  let selectedUser: string | null = null;
  function openProfile(username: string) {
    showProfileMenu = true;
    selectedUser = username;
    showChatMembers = false;
  }
  function closeProfileMenu() {
    showProfileMenu = false;
    selectedUser = "";
  }
  onMount(closeProfileMenu);

  //--------------------------------------------------------------------------------/

  let showChatMembers = false;
  function toggleChatMembers() {
    showChatMembers = !showChatMembers;
  }

  //--------------------------------------------------------------------------------/

  const blockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/" + target.ftId + "/block", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId }),
      });
    }
    if (response.ok) 
      await show_popup("User blocked", false);
    else await show_popup("Failed to block user",false);
  };

  //--------------------------------------------------------------------------------/

  const unblockUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/users/" + target.ftId + "/block", {
        credentials: "include",
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId }),
      });
    }
    if (response.ok) await show_popup("User blocked", false);
    else await show_popup("Failed to block user", false);
  };

  //--------------------------------------------------------------------------------/

  const banUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      await show_popup("Enter a time for which the user will be banned from this channel")
      const duration = $content 
      response = await fetch(API_URL + "/channels/" + channel.id + "/ban", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [target.ftId, duration]}),
      });
      socket.emit("kickUser", channel.id, $store.ftId, target.ftId)
      dispatch("return-home");
    }
  };

  //--------------------------------------------------------------------------------/

  const unbanUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/channels/" + channel.id + "/ban", {
        credentials: "include",
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId }),
      });
    }
    if (response.ok) await show_popup("User unbanned",false);
    else await show_popup("Failed to unban user",false);
  };

  //--------------------------------------------------------------------------------/

  const kickUser = async (username: string) => {
    const response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      socket.emit("kickUser", {chan : channel.id, from : $store.ftId, to: target.ftId});
      dispatch("return-home");
    } else {await show_popup("merde",false)}
  };

  //--------------------------------------------------------------------------------/

  const muteUser = async (username: string) => {
    const prompt = window.prompt("Enter mute duration in seconds");
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    const target = await response.json();
    if (response.ok) {
         response = await fetch(API_URL + "/channels/" + channel.id + "/mute", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [target.ftId, +prompt] }),
      });
    }
    if (response.ok) await show_popup("User muted",false);
    else await show_popup("Failed to mute user",false);
  };

  //--------------------------------------------------------------------------------/

  const adminUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/channels/" + channel.id + "/admin", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId }),
      });
    }
    if (response.ok) {
      await show_popup("User admined",false);
    } else {
      await show_popup("Failed to admin user",false);
    }
  };

  //--------------------------------------------------------------------------------/

  const removeAdminUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      response = await fetch(API_URL + "/channels/" + channel.id + "/admin", {
        credentials: "include",
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId }),
      });
    }
    if (response.ok) {
      await show_popup("User admined", false);
    } else {
      await show_popup("Failed to admin user", false);
    }
  };

  //--------------------------------------------------------------------------------/

  const leaveChannel = async () => {
    await show_popup("Press \"Okay\" to leave this channel?", false);
    if ($content == 'ok') {
      socket.emit("leaveChannel");
      dispatch("return-home");
      socket.disconnect()
      
    }
  }
  function onSendMessage() {
    dispatch("send-message", selectedUser);
    showProfileMenu = false;
  }
</script>

<div class="overlay">
  <div class="chat" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="messages">
      {#each messages as message}
        <p class="message">
          {#if !blockedUsers.filter((user) => user.username == message.author).length}
            <span
              class="message-name"
              on:click={() => openProfile(message.author.username)}
              on:keydown={() => openProfile(message.author.username)}
              style="cursor: pointer;"
            >
              {message.author.username}
            </span>: {message.text}
          {/if}
        </p>
      {/each}
    </div>
    {#if showProfileMenu}
      <div
        class="profile-menu"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <ul>
          <li>
            <button on:click={onSendMessage}>
              Send Message
            </button>
          </li>
          <li>
            <button on:click={() => dispatch("view-profile", selectedUser)}>
              View Profile
            </button>
          </li>
          <li>
            <button on:click={() => dispatch("add-friend", selectedUser)}>
              Add Friend
            </button>
          </li>
          <li>
            <button on:click={() => dispatch("invite-to-game", selectedUser)}>
              Invite to Game
            </button>
          </li>
          <li>
            {#if !blockedUsers.filter((user) => (user.username = selectedUser)).length}
              <button on:click={() => blockUser(selectedUser)}>
                Block User
              </button>
            {:else}
              <button on:click={() => unblockUser(selectedUser)}>
                Unblock User
              </button>
            {/if}
          </li>
          <li><button on:click={closeProfileMenu}> Close </button></li>
        </ul>
      </div>
    {/if}
    <form on:submit|preventDefault={sendMessage}>
      <input  type="text" placeholder="Type a message..." bind:value={newText} />
      <button style="background:#dedede; margin:auto" >
        <img  src="img/send.png" alt="send" />
      </button>
    </form>
    <div>
    <button on:click={leaveChannel}>Leave</button>
    <button
      on:click|stopPropagation={toggleChatMembers}
      on:keydown|stopPropagation
    >
      Chat Members
    </button>
  </div>

    {#if showChatMembers}
      <div
        on:click|stopPropagation
        on:keydown|stopPropagation
      />
      <ul>
        {#each chatMembers as member}
          <li>
            <p>
              {member.username}
              <button on:click={() => banUser(member.username)}> ban </button>
              <button on:click={() => kickUser(member.username)}> kick </button>
              <button on:click={() => muteUser(member.username)}> mute </button>
              <button on:click={() => adminUser(member.username)}> promote </button>
              <button on:click={() => removeAdminUser(member.username)}> demote </button>
            </p>
          </li>
        {/each}
      </ul>
    {/if}
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
  
  .chat {
    background-color: #343a40;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 1rem;
    max-width: 90%; 
    width: auto;
    margin: auto;
    display: flex;
    flex-direction: column;
  }

  .messages {
    height : 400px;
    width : 100%;
    overflow-y: scroll;
    border-bottom: 1px solid #dedede;
    padding-bottom: 1rem;
  }

  .message {
    font-size: 14px;
    max-width: 90%;
    width: auto;
    line-height: 1.4;
    margin-bottom: 0.5rem;
    word-wrap:break-word;
  }

  .message-name {
    font-weight: 600;
    color: #4c4c4c;
  }

  input[type="text"] {
    width: 82%;
    padding: 0.5rem;
    border: 1px solid #dedede;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    margin-bottom: 1rem;
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
    margin-bottom: 1rem;
  }

  button:last-child {
    margin-bottom: 0;
  }

  img {
    width: 16px;
    height: 16px;
  }

  .profile-menu,
  .chatMembers {
    position: absolute;
    background-color: #ffffff;
    border: 1px solid #dedede;
    border-radius: 5px;
    padding: 1rem;
    max-height: 70%;
    overflow-y: scroll;
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

  li:last-child {
    margin-bottom: 0;
  }
</style>
