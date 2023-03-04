<script lang="ts" context="module">
  export interface Friend {
    username: string;
    status: "online" | "offline" | "in a game";
  }
</script>

<script lang="ts">
  let api = "http://" + import.meta.env.VITE_HOST + ":" + import.meta.env.VITE_BACK_PORT
  export let friends: Array<Friend>  
  fetch(api + "/friends").then((response) => response.json()).then((ret) => {friends = ret});
  async function addFriend(event: any) {
    console.log(typeof event);

    event.preventDefault();
    const usernameInput = event.target.querySelector('input[type="text"]');
    console.log(usernameInput);

    const username = usernameInput.value;
    let ftId: number
    fetch(api + "/user/" + username).then((response) => response.json()).then((ret) => {ftId = ret.ftID});

  fetch(api + "/friends").then((response) => response.json()).then((ret) => {friends = JSON.parse(ret)});
    const response = await fetch(api + "/invit/" + ftId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    if (response.ok) {
       console.log('Invitation send.');
    } else {
       console.log('Unknown user.');
    }
    usernameInput.value = '';
    alert("Trying to add friend" + username);
  }
</script>

<div class="overlay">
  <div class="friends" on:click|stopPropagation on:keydown|stopPropagation>
    <div>
      {#if friends.length > 0}
        <h2>Monkey friends</h2>
        {#each friends.slice(0, 10) as friend}
          <li>
            <span>{friend.username} is {friend.status}</span>
          </li>
        {/each}
      {:else}
        <p>No friends to display</p>
      {/if}
      <div>
        <h3>Add a friend</h3>
        <form on:submit={addFriend}>
          <input type="text" />
          <button type="submit">Add</button>
        </form>
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

  .friends {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1rem;
    width: 300px;
  }
</style>
