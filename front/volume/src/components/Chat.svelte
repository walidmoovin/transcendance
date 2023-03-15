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
  //   const res = await fetch(API_URL + "/channels/members", {
  //     mode: "cors",
  //   });
  //   chatMembers = await res.json();
  // }

  //--------------------------------------------------------------------------------/

  const blockUser = async (username: string) => {};

  //--------------------------------------------------------------------------------/

  const banUser = async (username: string) => {
    // const prompt = window.prompt("Enter ban duration in seconds");
    // const res1 = await fetch(API_URL + "/users/" + username + "/byname", {
    //   mode: "cors",
    // });
    // const data1 = await res1.json();
    // const res2 = await fetch(API_URL + "/channels/" + data1.ftId + "/ban", {
    //   method: "POST",
    //   mode: "cors",
    // });
    // const data2 = await res2.json();
    // if (res2.ok) {
    //   alert("User banned");
    // } else {
    //   alert("Failed to ban user");
    // }
  };

  //--------------------------------------------------------------------------------/

  const kickUser = async (username: string) => {
    // set-up channel joining and kicking
    // const res1 = await fetch(API_URL + "/users/" + username + "/byname", {
    //   mode: "cors",
    // });
    // const data1 = await res1.json();
    // const res2 = await fetch(API_URL + "/channels/" + data1.ftId + "/kick", {
    //   method: "POST",
    //   mode: "cors",
    // });
    // const data2 = await res2.json();
    // if (res2.ok) {
    //   alert("User kicked");
    // } else {
    //   alert("Failed to kick user");
    // }
  };

  //--------------------------------------------------------------------------------/

  const muteUser = async (username: string) => {
    // use minutes prompt to determine mute duration
    // const prompt = window.prompt("Enter mute duration in seconds");
    // const res1 = await fetch(API_URL + "/users/" + username + "/byname", {
    //   mode: "cors",
    // });
    // const data1 = await res1.json();
    // const res2 = await fetch(API_URL + "/channels/" + data1.ftId + "/mute", {
    //   method: "POST",
    //   mode: "cors",
    // });
    // const data2 = await res2.json();
    // if (res2.ok) {
    //   alert("User muted");
    // } else {
    //   alert("Failed to mute user");
    // }
  };

  //--------------------------------------------------------------------------------/

  const adminUser = async (username: string) => {
    // const res1 = await fetch(API_URL + "/users/" + username + "/byname", {
    //   mode: "cors",
    // });
    // const data1 = await res1.json();
    // const res2 = await fetch(API_URL + "/channels/" + data1.ftId + "/admin", {
    //   method: "POST",
    //   mode: "cors",
    // });
    // const data2 = await res2.json();
    // if (res2.ok) {
    //   alert("User admined");
    // } else {
    //   alert("Failed to admin user");
    // }
  };

  //--------------------------------------------------------------------------------/

  const removeAdminUser = async (username: string) => {
    // const res1 = await fetch(API_URL + "/users/" + username + "/byname", {
    //   mode: "cors",
    // });
    // const data1 = await res1.json();
    // const res2 = await fetch(API_URL + "/channels/" + data1.ftId + "/admin", {
    //   method: "DELETE",
    //   mode: "cors",
    // });
    // const data2 = await res2.json();
    // if (res2.ok) {
    //   alert("User admin removed");
    // } else {
    //   alert("Failed to remove admin user");
    // }
  };

  //--------------------------------------------------------------------------------/
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
            <!-- block only if not blocked -->
            <button on:click={() => blockUser(selectedUser)}>Block User</button>
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
                  <button on:click={() => banUser(member.username)}>ban</button>
                  <button on:click={() => kickUser(member.username)}
                    >kick</button
                  >
                  <button on:click={() => muteUser(member.username)}
                    >mute</button
                  >
                  <button on:click={() => adminUser(member.username)}
                    >promote</button
                  >
                  <button on:click={() => removeAdminUser(member.username)}
                    >demote</button
                  >
                </p>
                <p>
                  -----------------------------------------------------------------------------------
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
    width: 6rem;
  }
</style>
