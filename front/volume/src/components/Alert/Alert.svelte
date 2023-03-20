<script lang="ts">
  export let message;
  export let form = true;
  export let onCancel = () => {};
  export let onOkay = () => {};
  import { content, popup } from "./content";

  let value = '';

  let _onChange = () => {
    content.set('')
  };

  function _onCancel() {
    $content = ''
    content.set('')
    popup.set(null);
  }

  function _onOkay() {
    if (form) {$content = value;}
    else {content.set("ok")
    }
    popup.set(null);
  }

  $: _onChange();
</script>

<div>
  <h2>{message}</h2>
  {#if form === true}
    <input
      required
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
    font-size: 1rem;
    text-align: center;
  }

  input {
    width: 100%;
    text-align: center;
    word-wrap:break-word;

  }

  .buttons {
    display: flex;
    justify-content: space-between;
  }
</style>
