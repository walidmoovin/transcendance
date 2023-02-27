<script lang="ts" context="module">
  export interface chatMessagesType {
    name: string;
    text: string;
  }
</script>

<script lang="ts">
	const sendMessage = () => {
		if (newText !== '')
		{
			const newMessage = {
				name: 'You',
				text: newText
			};
			chatMessages = [
				...chatMessages,
				newMessage
			];
			newText = '';
		}
	}
  export let chatMessages: Array<chatMessagesType> = [];
  let newText = "";
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
