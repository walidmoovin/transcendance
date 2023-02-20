<script lang="ts">
	import Navbar from './components/NavBar.svelte';
	import Profile from './components/Profile.svelte';
	import MatchHistory from './components/MatchHistory.svelte';
	import type { Match } from './components/MatchHistory.svelte';
	import Friends from './components/Friends.svelte';
	import type { Friend } from './components/Friends.svelte';
	import Spectate from './components/Spectate.svelte';
	import type { SpectateType } from './components/Spectate.svelte';
	import Play from './components/Play.svelte';
	import Pong from './components/Pong/Pong.svelte';

	let isProfileOpen = false;
	function clickProfile() {
		isProfileOpen = true;
	}
	let isHistoryOpen = false;
	function clickHistory() {
		isHistoryOpen = true;
	}
	let matches: Array<Match> = [
		{ winner: 'Alice', loser: 'Bob', points: -5, rank: '22' },
		{ winner: 'Alice', loser: 'Bob', points: 10, rank: '24' },
		{ winner: 'Alice', loser: 'Bob', points: 10, rank: '24' },
		{ winner: 'Alice', loser: 'Bob', points: 7, rank: '23' },
		{ winner: 'Alice', loser: 'Bob', points: 10, rank: '24' },
		{ winner: 'Alice', loser: 'Bob', points: 10, rank: '24' }
	];
	let isFriendOpen = false;
	function clickFriends() {
		isFriendOpen = true;
	}
	let friends: Array<Friend> = [
		{ username: 'Alice', status: 'online' },
		{ username: 'Bob', status: 'online' },
		{ username: 'Charlie', status: 'offline' },
		{ username: 'Dave', status: 'offline' },
		{ username: 'Eve', status: 'in a game' },
		{ username: 'Frank', status: 'online' }
	];
	let isSpectateOpen = false;
	function clickSpectate() {
		isSpectateOpen = true;
	}
	let spectate: Array<SpectateType> = [
		{ player1: 'Alice', player2: 'Bob', id: '1' },
		{ player1: 'Alice', player2: 'Bob', id: '4' },
		{ player1: 'Alice', player2: 'Bob', id: '6' },
		{ player1: 'Alice', player2: 'Bob', id: '8' },
		{ player1: 'Alice', player2: 'Bob', id: '2' },
		{ player1: 'Alice', player2: 'Bob', id: '3' }
	];
</script>

<main>
	<Navbar {clickProfile} {clickHistory} {clickFriends} {clickSpectate} />
	{#if isSpectateOpen}
		<div on:click={() => (isSpectateOpen = false)} on:keydown={() => (isSpectateOpen = false)}>
			<Spectate {spectate} />
		</div>
	{/if}
	{#if isFriendOpen}
		<div on:click={() => (isFriendOpen = false)} on:keydown={() => (isFriendOpen = false)}>
			<Friends {friends} />
		</div>
	{/if}
	{#if isHistoryOpen}
		<div on:click={() => (isHistoryOpen = false)} on:keydown={() => (isHistoryOpen = false)}>
			<MatchHistory {matches} />
		</div>
	{/if}
	{#if isProfileOpen}
		<div on:click={() => (isProfileOpen = false)} on:keydown={() => (isProfileOpen = false)}>
			<Profile username="Alice" wins={10} losses={5} elo={256} rank={23} is2faEnabled={false} />
		</div>
	{/if}
	<Play />
	<Pong />
</main>

<style>
</style>