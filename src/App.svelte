<script>
	import Navbar from './components/NavBar.svelte';
	import Profile from './components/Profile.svelte';
	import MatchHistory from './components/MatchHistory.svelte';
	const matches = [
		{ winner: 'Alice', loser: 'Bob', time: new Date('2023-02-13T15:30:00Z') },
		{ winner: 'Charlie', loser: 'David', time: new Date('2023-02-12T18:45:00Z') },
		{ winner: 'Alice', loser: 'Charlie', time: new Date('2023-02-11T21:15:00Z') },
	]
	let isProfileOpen = false; 
	function clickProfile() {
	  isProfileOpen = true;
	}
</script>

<main>
	<Navbar clickProfile={clickProfile} />
	{#if isProfileOpen}
	  <div on:click={() => isProfileOpen = false} on:keydown={() => isProfileOpen = false}>
		<Profile username="Alice" wins={10} losses={5} is2faEnabled={false} />
	  </div>
	{/if}
	<MatchHistory matches={matches} />
</main>

<style>
</style>