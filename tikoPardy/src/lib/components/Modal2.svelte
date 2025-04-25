<script>
  export let isOpen = false;
  export let title = "";
  
  function closeModal() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close-button" on:click={closeModal}>×</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 5rem;
    z-index: 100;
  }
  
  .modal-content {
    background-color: #1a1a5f;
    border: 2px solid #ffcc00;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #ffcc00;
  }
  
  .modal-header h2 {
    color: #ffcc00;
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 1.5rem;
    color: white;
  }
</style>