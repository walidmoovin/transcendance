<script lang="ts">
	// import { navigate } from 'svelte-routing';

	// function handleMatchmakingClick() {
	//   navigate('/matchmaking');
	// }

	// function handlePlayWithFriendClick() {
	//   navigate('/play-with-friend');
	// }
</script>

<!-- dr -->
<main>
	<h1>Choose a gamemode</h1>
	<!-- <button on:click={handleMatchmakingClick}>Matchmaking</button>
    <button on:click={handlePlayWithFriendClick}>Play with a friend</button> -->
	<button>Matchmaking</button>
	<button>Play with a friend</button>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		margin-bottom: 2rem;
	}

	button {
		font-size: 1.5rem;
		padding: 1rem 2rem;
		margin-bottom: 1rem;
	}
</style>
