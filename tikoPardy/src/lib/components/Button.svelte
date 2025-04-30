<script lang="ts">
  // Button.svelte
  export let text: string;
  export let onclick: () => void;
  export let type: 'primary' | 'secondary' = 'primary';
</script>

<button class={type} on:click={onclick}>
  {#if $$slots.icon}
    <span class="icon-container">
      <slot name="icon" />
    </span>
  {/if}
  {text}
</button>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-family: 'Cascadia Mono', sans-serif;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .primary {
    background-color: #7b1e1e;
    color: white;
  }

  .primary:hover {
    background-color: #9a2929;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .secondary {
    background-color: white;
    color: #7b1e1e;
    border: 2px solid #7b1e1e;
  }

  .secondary:hover {
    background-color: #f5f0ec;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .icon-container {
    display: inline-flex;
    margin-right: 8px;
  }
</style>