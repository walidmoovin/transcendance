<script>
	import Navbar from './components/NavBar.svelte';
	import Profile from './components/Profile.svelte';
	import MatchHistory from './components/MatchHistory.svelte';
	let isProfileOpen = false; 
	function clickProfile() {
	  isProfileOpen = true;
	}
	let isHistoryOpen = false;
	function clickHistory() {
	  isHistoryOpen = true;
	}
	let matches = [
		{winner : "Alice", loser : "Bob"},
	]
</script>

<main>
	<Navbar clickProfile={clickProfile} clickHistory={clickHistory} />
	{#if isHistoryOpen}
	  <div on:click={() => isHistoryOpen = false} on:keydown={() => isHistoryOpen = false}>
		<MatchHistory matches={matches} />
	  </div>
	{/if}
	{#if isProfileOpen}
	  <div on:click={() => isProfileOpen = false} on:keydown={() => isProfileOpen = false}>
		<Profile username="Alice" wins={10} losses={5} is2faEnabled={false} />
	  </div>
	{/if}
</main>

<style>
</style>