<script lang="ts">

	let chatIsOpen = false;
	const toggleChat = () => (chatIsOpen = !chatIsOpen);
	let newText = '';

	let chatMessages = [
		{
			name: 'Alice',
			text: 'Hello guys! Happy to see you here!'
		},
		{
			name: 'Bob',
			text: 'Wanna play?'
		},
		{
			name: 'Carl',
			text: 'cyka blyat'
		},
	]

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

</script>



<!-- Main chat div, changes style to hide/unhide the chat depending if it's open or closed -->
<div class={
	chatIsOpen
		? 'chat-open chat-container'
		: 'chat-container'}>
	<!-- Button to toggle chat -->
	<div class="chat-view-button">
		<button on:click={toggleChat}>
			{#if chatIsOpen}
				<img src="img/close.png" alt="Close" />
			{:else}
				<img src="img/chat.png" alt="Open" />
			{/if}
		</button>
	</div>
	<div class="chat">
		<!-- Chat history -->
		<div class="messages">
			{#each chatMessages as message}
				<p class="message">
					<span class="message-name">
						{message.name}
					</span>: {message.text}
				</p>
			{/each}
		</div>
		<!-- Form to send message -->
		<form on:submit|preventDefault={sendMessage}>
			<input
				type="text"
				placeholder="Type a message..."
				bind:value={newText} />
			<button>
				<img src="img/send.png" alt="send" />
			</button>
		</form>
	</div>
</div>



<style>
	.chat-container {
		position: absolute;
		top: 10rem;
		height: calc(100vh - 10rem);
		z-index: 42; /* Show it above everything */
		display: flex;
		width: 300px;
		right: -300px;
		transition: right 0.3s ease-out;
	}
	.chat-view-button {
		position: absolute;
		left: -64px;
		top: 0;
		bottom: 0;
		margin: auto 0;
		height: 64px;
	}
	.chat-view-button button {
		border: none;
		cursor: pointer;
		border-radius: 16px 0 0 16px;
		padding: 16px 16px 16px 16px;
	}
	.chat-open {
		right: 0; /* Shows chat */
	}
	.chat {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.messages {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 10rem);
		padding: 1rem;
		overflow-y: scroll;
	}
	.message-name {
		cursor: pointer;
	}
	form {
		/* border-bottom: var(--grey) 1px solid; */
		margin: 1rem;
		display: flex;
		justify-content: space-between;
	}
	input {
		border: none;
	}
	form button {
		background: transparent;
		border: none;
		cursor: pointer;
	}
</style>
