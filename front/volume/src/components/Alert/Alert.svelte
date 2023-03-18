<script>
  export let message;
  export let form = true;
  export let onCancel = () => {};
  export let onOkay = () => {};
  import { content, popup } from "./content";

  let value;
  let onChange = () => {
    $content = "";
  };

  function _onCancel() {
    onCancel();
    $content = "";
    popup.set(null);
  }

  function _onOkay() {
    onOkay();
    $content = value;
    popup.set(null);
  }

  $: onChange();
</script>

<div class="overlay">
  <h2>{message}</h2>
  {#if form === true}
    <input
      type="text"
      bind:value
      on:keydown={(e) => e.which === 13 && _onOkay()}
    />
  {/if}

  <div class="buttons">
    <button on:click={_onCancel}> Cancel </button>
    <button on:click={_onOkay}> Okay </button>
  </div>
</div>

<style>
  h2 {
    font-size: 2rem;
    text-align: center;
  }

  input {
    width: 100%;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
  }
</style>
