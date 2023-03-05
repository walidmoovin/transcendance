<script lang="ts" context="module">
  export interface chatMessagesType {
    id: number;
    name: string;
    text: string;
  }
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

  const openProfile = (id: number) => (event: Event) => {
    const message = chatMessages.find((m) => m.id === id);
    if (message) {
      const optionsModal = document.createElement("div");
      optionsModal.classList.add("options-modal");
      optionsModal.innerHTML = `
        <h3>${message.name}</h3>
        <ul>
          <li>View profile</li>
          <li>View posts</li>
          <li>View comments</li>
        </ul>
      `;
      document.querySelector(".overlay")?.appendChild(optionsModal);
      optionsModal.addEventListener("click", () => {
        document.body.removeChild(optionsModal);
      });
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
            on:click={openProfile(message.id)}
            on:keydown={openProfile(message.id)}
            style="cursor: pointer;"
          >
            {message.name}
          </span>: {message.text}
        </p>
      {/each}
    </div>
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
