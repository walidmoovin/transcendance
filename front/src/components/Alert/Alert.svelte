<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { content, popup } from "./content";

  export let message: string;
  export let form = true;
  export let passwordInput = false;
  export let onCancel = () => {};
  export let onOkay = () => {};

  let value = "";

  onMount(() => {
    $content = "";
  });

  onDestroy(() => {
    popup.set(null);
  });

  function _onCancel() {
    onCancel();
    $content = "";
    popup.set(null);
  }

  function _onOkay() {
    onOkay();
    if (form) $content = value;
    else $content = "ok";
    popup.set(null);
  }
</script>

<div>
  <h2>{message}</h2>
  {#if form === true}
    {#if passwordInput === true}
      <input
        required
        type="password"
        bind:value
        on:keydown={(e) => e.which === 13 && _onOkay()}
      />
    {:else}
      <input
        required
        type="text"
        bind:value
        on:keydown={(e) => e.which === 13 && _onOkay()}
      />
    {/if}
  {/if}

  <div class="buttons">
    <button on:click={_onCancel}> Cancel </button>
    <button on:click={_onOkay}> Okay </button>
  </div>
</div>

<style>
  h2 {
    font-size: 1rem;
    text-align: center;
  }

  input {
    width: 100%;
    text-align: center;
    word-wrap: break-word;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
  }
</style>
