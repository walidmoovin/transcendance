<script>
    export let username = '';
    export let realname = '';
    export let wins = 0;
    export let losses = 0;
    export let elo = 0;
    export let rank = -1;
    export let is2faEnabled = false;
    async function handleSubmit (event) {
        event.preventDefault();
        // const response = await fetch('', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         username
        //     })
        // });
        // if (response.ok) {
        //     console.log('username updated');
        // }
        // else {
        //     console.log('username update failed');
        // }
        alert('Trying to update username to ' + username);
    }
    async function handleAvatarUpload (event) {
        event.preventDefault();
        alert('Trying to upload avatar');
    }
    async function handle2fa (event) {
        event.preventDefault();
        alert('Trying to ' + (is2faEnabled ? 'disable' : 'enable') + ' 2FA');
    }
</script>

<div class="overlay">
    <div class="profile" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="profile-header">
            <img class="profile-img" src="img/profileicon.png" alt="Profile Icon">
            <h3>{realname}</h3>
            <form on:submit={handleAvatarUpload}>
                <button type="submit">Upload Avatar</button>
            </form>
        </div>
        <div class="profile-body">
            <form on:submit={handleSubmit}>
                <div class="username">
                    <label for="username">Username</label>
                    <input type="text" id="username" bind:value={username} />
                </div>
                <button type="submit">Submit</button>
            </form>
            <p>Wins: {wins}</p>
            <p>Losses: {losses}</p>
            <p>Winrate: {wins / (wins + losses) * 100}%</p>
            <p>Elo : {elo}</p>
            <p>Rank: {rank}</p>
            <form class="two-factor-auth" on:submit={handle2fa}>
                <button type="submit">
                    {#if is2faEnabled}
                        Disable 2FA
                    {:else}
                        Enable 2FA
                    {/if}
                </button>
            </form>
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