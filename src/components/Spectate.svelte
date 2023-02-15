<script>
    export let spectate = [];
    export let watch = () => {};
</script>

<div class="overlay">
    <div class="spectate">
        <div>
            {#if spectate.length > 0}
                {#each spectate.slice(0, 10) as spectate}
                    <li>
                        <span>{spectate.player1} VS {spectate.player2}</span>
                        <button on:click={() => watch(spectate.id)}>Spectate</button>
                    </li>
                {/each}
            {:else}
                <p>No matches to spectate</p>
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

    .spectate {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 1rem;
        width: 300px;
    }
</style>