<script>
  import { API_URL } from "./Auth";

  export let username;
  export let ftId;
  let result = null;

  async function doPost() {
    const res = await fetch(API_URL + "/" + ftId, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ftId,
        username,
        socketKey: "42",
        avatar: "no avatar",
      }),
    });

    const json = await res.json();
    result = JSON.stringify(json);
    console.log(result);
  }
</script>

<div>
  <input bind:value={username} />
  <input bind:value={ftId} />
  <button type="button" on:click={doPost}> Post it. </button>
  <p>Result: {result}</p>
</div>
