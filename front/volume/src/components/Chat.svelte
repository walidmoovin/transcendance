<script lang="ts" context="module">
  export interface chatMessagesType {
    id: number;
    author: User;
    text: string;
  }
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { store, API_URL } from "../Auth";
  import { socket } from "../socket";
  import type { ChannelsType } from "./Channels.svelte";
  import type User from "./Profile.svelte";
</script>

<script lang="ts">
  let usersInterval: ReturnType<typeof setInterval>;
  let blockedUsers: Array<User> = [];
  let chatMembers: Array<User> = [];
  let chatMessages: Array<chatMessagesType> = [];
  export let channel: ChannelsType;
  let newText = "";

  onMount(async () => {
    socket.connect();
    getMembers();
    usersInterval = setInterval(async () => {
      getMembers();
    }, 3000);
  });

  socket.on("messages", (msgs: Array<chatMessagesType>) => {
    chatMessages = msgs;
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
    chatMessages = [...chatMessages, msg];
  });

  onDestroy(() => {
    socket.emit("LeaveChanel", async (response) => {
      console.log(response.status);
    });
    clearInterval(usersInterval)
    socket.disconnect();
  });

  //--------------------------------------------------------------------------------/

  const sendMessage = () => {
    if (newText !== "") {
      chatMessages = [...chatMessages.slice(-5 + 1)];
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
  let selectedUser = null;
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
    if (response.ok) alert("User blocked");
    else alert("Failed to block user");
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
    if (response.ok) alert("User blocked");
    else alert("Failed to block user");
  };

  //--------------------------------------------------------------------------------/

  const banUser = async (username: string) => {
    let response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      const duration = prompt("Enter a time for which the user will be banned from this channel")
      response = await fetch(API_URL + "/channels/" + channel.id + "/ban", {
        credentials: "include",
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: target.ftId, duration: duration}),
      });
      socket.emit("kickUser", channel.id, $store.ftId, target.ftId);
    }
    if (response.ok) {
      alert("User banned");
    } else alert("Failed to ban user");
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
    if (response.ok) alert("User unbanned");
    else alert("Failed to unban user");
  };

  //--------------------------------------------------------------------------------/

  const kickUser = async (username: string) => {
    const response = await fetch(API_URL + "/users/" + username + "/byname", {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      const target = await response.json();
      socket.emit("kickUser", channel.id, $store.ftId, target.ftId);
    }
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
    if (response.ok) alert("User muted");
    else alert("Failed to mute user");
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
      alert("User admined");
    } else {
      alert("Failed to admin user");
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
      alert("User admined");
    } else {
      alert("Failed to admin user");
    }
  };

  //--------------------------------------------------------------------------------/

  const leaveChannel = async () => {
    const prompt = window.prompt("Are you sure you want to leave this channel? (y/n)");
    if (prompt == "y") {
      const response = await fetch(API_URL + "/channels/" + channel.id + "/leave", {
        credentials: "include",
        mode: "cors",
      });
      if (response.ok) {
        window.location.href = "/channels";
      } else {
        alert("Failed to leave channel");
      }
    }
  }

</script>
<div class="overlay">
  <div class="chat" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="messages">
      {#each chatMessages as message}
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
            <button on:click={() => dispatch("send-message", selectedUser)}>
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
      <input type="text" placeholder="Type a message..." bind:value={newText} />
      <button>
        <img src="img/send.png" alt="send" />
      </button>
    </form>
    <button on:click={leaveChannel}>Leave</button>
    <button
      on:click|stopPropagation={toggleChatMembers}
      on:keydown|stopPropagation
    >
      Chat Members
    </button>
    {#if showChatMembers}
      <div
        class="chatMembers"
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
    width: 300px;
    display: flex;
    flex-direction: column;
  }

  .messages {
    height: 200px;
    overflow-y: scroll;
    border-bottom: 1px solid #dedede;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .message {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .message-name {
    font-weight: 600;
    color: #4c4c4c;
  }

  input[type="text"] {
    width: 100%;
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
    max-height: 100px;
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
