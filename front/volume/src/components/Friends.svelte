<script lang="ts" context="module">
  export interface Friend {
    username: string;
    status: "online" | "offline" | "in a game";
    ftId: number;
  }
  export async function addFriend(event: any) {
    console.log(typeof event);

    event.preventDefault();
    const username = event.target
      ? event.target.querySelector('input[type="text"]').value
      : event.detail;

    const response = await fetch(API_URL + "/invit/" + username, {
      credentials: "include",
      mode: "cors",
    });
    if (response.ok) {
      alert("Invitation send.");
    } else {
      const error = (await response.json()).message
      alert("Invitation failed: " +  error);;
    }
  }
</script>

<script lang="ts">
  import { API_URL } from "../Auth";

  export let friends: Friend[];
  export let invits: Friend[];
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
      {#if invits.length > 0}
        <h2>Monkey invits</h2>
        {#each invits.slice(0, 10) as invit}
          <li>
            <span>{invit.username} invited you to be friend.</span>
          </li>
        {/each}
      {:else}
        <p>No invitations to display</p>
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
