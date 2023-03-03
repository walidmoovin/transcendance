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
    }
    // TODO: save to database
  };

  export let chatMessages: Array<chatMessagesType> = [];
  let newText = "";

  // const openProfile = (id: number) => (event: Event) => {
  //   const message = chatMessages.find((m) => m.id === id);
  //   if (message) {
  //     const { name } = message;
  //     const options = ["View profile", "Send private message", "Block user"];
  //     const option = prompt(`Select an option for ${name}: ${options.join(", ")}`);
  //     if (option === "View profile") {
  //     } else if (option === "Send private message") {
  //     } else if (option === "Block user") {
  //     }
  //   }
  // };
</script>

<div class="overlay">
  <div class="chat" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="messages">
      {#each chatMessages as message}
        <p class="message">
          <span class="message-name">
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
</style>
