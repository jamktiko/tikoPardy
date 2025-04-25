<script>
  import Button from '../lib/components/OhjeetButton.svelte';
  import Modal from '../lib/components/Modal2.svelte';
  
  let showInstructionsModal = false;
  
  function toggleInstructions() {
    showInstructionsModal = !showInstructionsModal;
  }
  
  function startGame() {
    console.log("Game started!");
    // Add your game start logic here
  }
</script>

<main>
  <div class="game-container">
    <h1>TikoPardy</h1>
    <p>Welcome to the ultimate quiz challenge!</p>
    
    <div class="button-container">
      <Button text="Ohjeet" onClick={toggleInstructions} type="secondary" />
      <Button text="Aloita peli" onClick={startGame} type="primary" />
    </div>
  </div>
</main>

<Modal isOpen={showInstructionsModal} title="Ohjeet">
  <div class="instructions">
    <h3>How to Play TikoPardy:</h3>
    <ol>
      <li>Select a category and point value</li>
      <li>Answer the question correctly to earn points</li>
      <li>If you answer incorrectly, you lose points</li>
      <li>The player with the most points at the end wins!</li>
    </ol>
    
    <div class="button-center">
      <Button text="Close" onClick={toggleInstructions} type="primary" />
    </div>
  </div>
</Modal>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a5f, #3a3a8c);
    font-family: 'Arial', sans-serif;
    color: white;
  }
  
  .game-container {
    text-align: center;
    padding: 2rem;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 1rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    max-width: 800px;
  }
  
  h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #ffcc00;
    text-shadow: 3px 3px 0 #000;
  }
  
  p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .button-container {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .instructions {
    text-align: left;
  }
  
  .instructions h3 {
    color: #ffcc00;
    margin-bottom: 1rem;
  }
  
  .instructions ol {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .instructions li {
    margin-bottom: 0.5rem;
  }
  
  .button-center {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }
</style>