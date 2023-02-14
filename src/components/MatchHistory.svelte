<script lang="ts">
    export let matches: Match[] = [];
    interface Match {
        winner: string;
        loser: string;
        time: Date;
    }
</script>
  
<main>
    {#if matches.length > 0}
        <ul>
            {#each matches as match}
                <li>
                <span>{match.winner} vs {match.loser}</span>
                <span>{match.winner} won 1-0</span>
                <span>{match.time.toLocaleString()}</span>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No matches to display</p>
    {/if}
</main>