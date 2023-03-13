<script lang="ts" context="module">
  export interface chatMessagesType {
    id: number;
    author: string;
    text: string;
  }
  import { createEventDispatcher, onMount } from "svelte";
  import { store, API_URL } from "../Auth";
  import type { Player } from "./Profile.svelte";
  interface User {
    username: string;
  }
</script>

<script lang="ts">
  //--------------------------------------------------------------------------------/

  export let chatMessages: Array<chatMessagesType> = [];
  let newText = "";

  //--------------------------------------------------------------------------------/

  const sendMessage = () => {
    if (newText !== "") {
      const newMessage = {
        id: chatMessages.length + 1,
        author: $store.username,
        text: newText,
      };
      chatMessages = [...chatMessages.slice(-5 + 1), newMessage];
      newText = "";
      const messagesDiv = document.querySelector(".messages");
      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    }
    // TODO: save to database
  };

  //--------------------------------------------------------------------------------/

  const dispatch = createEventDispatcher();
  let showProfileMenu = false;
  let selectedUser = null;
  function openProfile(username: string) {
    showProfileMenu = true;
    selectedUser = username;
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
  let chatMembers: Array<User> = [
    { username: "user1" },
    { username: "user2" },
    { username: "user3" },
    { username: "user4" },
    { username: "user5" },
    { username: "user6" },
    { username: "user7" },
    { username: "user8" },
    { username: "user9" },
  ];
  // let chatMembers: Array<Player> = [];
  // async function getChatMembers() {
  //   console.log("Getting chat members");
  //   const res = await fetch(API_URL + "/chat/members", {
  //     mode: "cors",
  //   });
  //   chatMembers = await res.json();
  // }

  //--------------------------------------------------------------------------------/

  const blockUser = async () => {
    const res = await fetch(API_URL + "/chat/block", {
      method: "POST",
      mode: "cors",
    });
    const data = await res.json();
    if (data.success) {
      alert("User blocked");
    } else {
      alert("Failed to block user");
    }
  }; 
</script>

<div class="overlay">
  <div class="chat" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="messages">
      {#each chatMessages as message}
        <p class="message">
          <span
            class="message-name"
            on:click={() => openProfile(message.author)}
            on:keydown={() => openProfile(message.author)}
            style="cursor: pointer;"
          >
            {message.author}
          </span>: {message.text}
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
            <button on:click={() => dispatch("send-message", selectedUser)}
              >Send Message</button
            >
          </li>
          <li>
            <button on:click={() => dispatch("view-profile", selectedUser)}
              >View Profile</button
            >
          </li>
          <li>
            <button on:click={() => dispatch("add-friend", selectedUser)}
              >Add Friend</button
            >
          </li>
          <li>
            <button on:click={() => dispatch("invite-to-game", selectedUser)}
              >Invite to Game</button
            >
          </li>
          <li>
            <button on:click={() => dispatch("block-user", selectedUser)}
              >Block User</button
            >
          </li>
          <li><button on:click={closeProfileMenu}>Close</button></li>
        </ul>
      </div>
    {/if}
    <form on:submit|preventDefault={sendMessage}>
      <input type="text" placeholder="Type a message..." bind:value={newText} />
      <button>
        <img src="img/send.png" alt="send" />
      </button>
    </form>
    <button
      on:click|stopPropagation={toggleChatMembers}
      on:keydown|stopPropagation>Chat Members</button
    >
    {#if showChatMembers}
      <div
        class="chatMembers"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div>
          <ul>
            {#each chatMembers as member}
              <li>
                <p>
                  {member.username}
                  <button>ban</button>
                  <button>kick</button>
                  <button>mute</button>
                  <button>admin</button>
                </p>
              </li>
            {/each}
          </ul>
        </div>
      </div>
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
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
  }

  .messages {
    height: 200px;
    overflow-y: scroll;
  }

  .chatMembers {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    max-height: 100px;
    overflow-y: scroll;
  }

  .chatMembers ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .chatMembers button {
    width: 3.5rem;
  }
</style>
