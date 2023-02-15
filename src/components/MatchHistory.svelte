<script>
    export let matches = [];
</script>

<div class="overlay">
    <div class="history" on:click|stopPropagation on:keydown|stopPropagation>
        <div>
            {#if matches.length > 0}
                {#each matches.slice(0, 10) as match}
                    <li>
                        <span>{match.winner} vs {match.loser}</span>
                        <span>{match.winner} won 1-0</span>
                        <span>points won : {match.points}</span>
                        <span>rank #{match.rank}</span>
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