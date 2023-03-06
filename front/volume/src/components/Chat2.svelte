<script lang="ts" context="module">
  export interface chatMessagesType {
    id: number;
    name: string;
    text: string;
  }
  import { createEventDispatcher, onMount } from "svelte";
</script>

<script lang="ts">
  const sendMessage = () => {
    if (newText !== "") {
      const newMessage = {
        id: chatMessages.length + 1,
        name: "You",
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

  export let chatMessages: Array<chatMessagesType> = [];
  let newText = "";

  const dispatch = createEventDispatcher();
  let showProfileMenu = false;
  let selectedUserId = null;
  function openProfile(id : number) {
    showProfileMenu = true;
    selectedUserId = id;
  }
  function closeProfileMenu() {
    showProfileMenu = false;
    selectedUserId = null;
  }
  onMount(closeProfileMenu)
</script>

<div class="overlay">
  <div class="chat" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="messages">
      {#each chatMessages as message}
        <p class="message">
          <span
            class="message-name"
            on:click={openProfile(message.id)}
            on:keydown={openProfile(message.id)}
            style="cursor: pointer;"
          >
            {message.name}
          </span>: {message.text}
        </p>
      {/each}
    </div>
    {#if showProfileMenu}
      <div class="profile-menu" on:click|stopPropagation on:keydown|stopPropagation>
        <ul>
          <!-- if admin 
          <li><button on:click={() => dispatch('delete-user', selectedUserId)}>Delete User</button></li>
          <li><button on:click={() => dispatch('ban-user', selectedUserId)}>Ban User</button></li>
          <li><button on:click={() => dispatch('mute-user', selectedUserId)}>Mute User</button></li>
          <li><button on:click={() => dispatch('promote-user', selectedUserId)}>Promote User</button></li>
          -->
          <li><button on:click={() => dispatch('send-message', selectedUserId)}>Send Message</button></li>
          <li><button on:click={() => dispatch('view-profile', selectedUserId)}>View Profile</button></li>
          <li><button on:click={() => dispatch('add-friend', selectedUserId)}>Add Friend</button></li>
          <li><button on:click={() => dispatch('invite-to-game', selectedUserId)}>Invite to Game</button></li>
          <li><button on:click={() => dispatch('block-user', selectedUserId)}>Block User</button></li>
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
    z-index: 9998;
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
</style>
