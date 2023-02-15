<script>
    export let username = '';
    export let wins = 0;
    export let losses = 0;
    export let elo = 0;
    export let rank = -1;
    export let is2faEnabled = false;
    function toggle2fa() {
        is2faEnabled = !is2faEnabled;
    }
</script>

<div class="overlay">
    <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="profile-header">
        <img class="profile-img" src="img/profileicon.png" alt="Profile Icon">
        <h3>{username}</h3>
        <button>Upload avatar</button>
        </div>
        <div class="profile-body">
        <p>Wins: {wins}</p>
        <p>Losses: {losses}</p>
        <p>Winrate: {wins / (wins + losses) * 100}%</p>
        <p>Elo : {elo}</p>
        <p>Rank: {rank}</p>
        <div class="two-factor-auth">
            <button on:click={toggle2fa}>
            {#if is2faEnabled}
                Disable 2FA
            {:else}
                Enable 2FA
            {/if}
        </div>
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

    .profile {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 1rem;
        width: 300px;
    }

    .profile-header {
        display: flex;
        align-items: center;
    }

    .profile-img {
        width: 50px;
        height: 50px;
        margin-right: 1rem;
    }

    .two-factor-auth {
        margin-top: 1rem;
    }
</style>