<script lang="ts" context="module">
	export interface Match {
		winner: string;
		loser: string;
		points: number;
		rank: string;
	}
</script>

<script lang="ts">
	export let matches: Array<Match> = [];
</script>

<div class="overlay">
	<div class="history" on:click|stopPropagation on:keydown|stopPropagation>
		<div>
			{#if matches.length > 0}
				<h2>Last 10 monkey games</h2>
				{#each matches.slice(0, 10) as match}
					<li>
						<span>{match.winner} 1 - 0 {match.loser}</span>
						{#if match.points > 0}
							<span>+{match.points}</span>
						{:else}
							<span>{match.points}</span>
						{/if}
						<span>MP | rank #{match.rank}</span>
					</li>
				{/each}
			{:else}
				<p>No matches to display</p>
			{/if}
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

	.history {
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 1rem;
		width: 300px;
	}
</style>
