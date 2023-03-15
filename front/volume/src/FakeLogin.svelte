<script>
  import { API_URL } from "./Auth";

  export let username;
  export let ftId;

  async function doPost() {
    await fetch(API_URL + "/users/" + ftId, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ftId,
        username,
        socketKey: ftId,
        avatar: "no avatar",
      }),
    });
  }
</script>

<div>
  <input bind:value={username} />
  <input bind:value={ftId} />
  <button type="button" on:click={doPost}> Post it. </button>
</div>
