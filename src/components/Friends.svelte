<script>
    export let friends = [];
</script>

<div class="overlay">
    <div class="friends" on:click|stopPropagation on:keydown|stopPropagation>
        <div>
            {#if friends.length > 0}
                {#each friends.slice(0, 10) as friends}
                    <li>
                        <span>{friends.username} is {friends.status}</span>
                    </li>
                {/each}
            {:else}
                <p>No friends to display</p>
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

    .friends {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 1rem;
        width: 300px;
    }
</style>