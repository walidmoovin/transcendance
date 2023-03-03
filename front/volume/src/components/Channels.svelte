<script lang="ts" context="module">
  	import type { chatMessagesType } from "./Chat2.svelte";
	export interface ChannelsType {
		id: string;
		name: string;
		messages: Array<chatMessagesType>;
	}
</script>

<script lang="ts">
	export let channels: Array<ChannelsType> = [];
	export let onSelectChannel: (channel: ChannelsType) => void;
	const selectChat = (id: string) => {
		const channel = channels.find(c => c.id === id);
		if (channel) {
			onSelectChannel(channel);
		}
	}
	const createChannel = () => {
		const name = prompt("Enter a name for the new channel:");
		if (name) {
			const newChannel: ChannelsType = {
				id: Math.random().toString(),
				name,
				messages: []
			};
			channels = [newChannel, ...channels];
		}
		// TODO: save to database
  	};
</script>

<div class="overlay">
	<div class="channels" on:click|stopPropagation on:keydown|stopPropagation>
		<div>
		{#if channels.length > 0}
			<h2>Channels</h2>
			{#each channels.slice(0, 10) as _channels}
			<li>
				<span>{_channels.name}</span>
				<button on:click={() => selectChat(_channels.id)}>Enter</button>
			</li>
			{/each}
		{:else}
			<p>No channels available</p>
		{/if}
		<button on:click={createChannel}>Create Channel</button>
		</div>
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

	.channels {
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 1rem;
		width: 300px;
	}
</style>
