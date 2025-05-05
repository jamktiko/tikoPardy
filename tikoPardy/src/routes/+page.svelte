<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '../lib/components/Button.svelte';
	import Modal from '../lib/components/Modal.svelte';
	import kurssitData from '../lib/kurssit.json';
	import { Coffee, HelpCircle, ArrowRight, ChevronDown, X } from '@lucide/svelte';
	import { ajastinPaalla } from '$lib/states.svelte';

	let kurssit: number = $state(1); // Default value

	let showInstructionsModal = $state(false);

	function toggleInstructions() {
		showInstructionsModal = !showInstructionsModal;
	}

	function startGame() {
		goto(`/game?kurssi=${encodeURIComponent(kurssit)}`);
	}
</script>

<main>
	<div class="game-container">
		<div class="top-left-button">
			<Button
				text="Buy Me A Coffee"
				onclick={() => window.open('https://www.paypal.com/fi/home', '_blank')}
				type="secondary"
			>
				<svelte:fragment slot="icon">
					<Coffee size={20} />
				</svelte:fragment>
			</Button>
		</div>

		<div class="game-content">
			<h1>TikoPardy</h1>
			<p>Welcome to the ultimate quiz challenge!</p>
		</div>

		<div>
			Ajastin:
			<input type="checkbox" bind:checked={ajastinPaalla.on} id="ajastin" />
		</div>

		<p>Valitse Kurssi:</p>
		<div class="select-wrapper">
			<select bind:value={kurssit}>
				{#each kurssitData as kurssi}
					<option value={kurssi.id}>{kurssi.nimi}</option>
				{/each}
			</select>
			<ChevronDown class="dropdown-icon" size={20} />
		</div>

		<div class="button-container">
			<Button text="Ohjeet" onclick={toggleInstructions} type="secondary">
				<svelte:fragment slot="icon">
					<HelpCircle size={20} />
				</svelte:fragment>
			</Button>
			<Button text="Aloita peli" onclick={startGame} type="primary">
				<svelte:fragment slot="icon">
					<ArrowRight size={20} />
				</svelte:fragment>
			</Button>
		</div>
	</div>
</main>

{#if showInstructionsModal}
	<Modal>
		<div class="instructions">
			<div class="modal-header">
				<h2>Ohjeet</h2>
			</div>
			<h3>Näin sinä pelaat TikoPardy peliä:</h3>
			<ol>
				<li>Valitse haluamasi kurssi</li>
				<li>Aloita peli</li>
				<li>Valitse selitystä vastaava käsite</li>
				<li>Saat pisteitä oikeasta vastauksesta ⭐, väärästä vastauksesta menetät elämän ❤️</li>
				<li>Kasvatat oikeilla vastauksilla streakkiasi 🔥, jonka kasvattaa pisteesi saamista ⭐</li>
				<li>Peli loppuu, kun elämät ovat loppu</li>
			</ol>

			<div class="button-center">
				<Button text="Close" onclick={toggleInstructions} type="primary">
					<svelte:fragment slot="icon">
						<X size={24} />
					</svelte:fragment>
				</Button>
			</div>
		</div>
	</Modal>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&display=swap');

	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
		background: #f5f0ec;
		overflow-x: hidden;
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		background: #f5f0ec;
		font-family: 'Arial', sans-serif;
		color: #333;
		box-sizing: border-box;
	}

	.game-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		padding: 3rem;
		background-color: #f5f5f5;
		border-radius: 1.5rem;
		box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 1200px;
		min-height: 70vh;
		text-align: center;
		position: relative;
	}

	.game-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	h1 {
		color: #7b1e1e;
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 96px;
		font-style: normal;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 1px;
		margin: 0;
	}

	p {
		font-size: 1.5rem;
		font-family: 'Cascadia Mono', sans-serif;
		margin: 0;
	}

	li {
		font-size: 1rem;
		font-family: 'Cascadia Mono', sans-serif;
		padding: 3px;
	}

	.top-left-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		transform: scale(0.8);
	}

	:global(.select-wrapper) {
		position: relative;
		display: inline-block;
	}

	select {
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 1.25rem;
		padding: 0.5rem 2.5rem 0.5rem 1rem;
		border: 2px solid #7b1e1e;
		border-radius: 0.75rem;
		background-color: #fff;
		color: #333;
		cursor: pointer;
		margin-top: -3rem;
		margin-bottom: 1.5rem;
		appearance: none;
	}

	select:focus {
		outline: none;
		border-color: #a83232;
	}

	:global(.dropdown-icon) {
		position: absolute;
		right: 0.8rem; /* Adjust this value to move it further left or right */
		top: 17%; /* Move the icon higher (less than 50%) */
		transform: translateY(-50%); /* Fine-tune centering */
		pointer-events: none; /* Keeps it non-interactive */
		color: #7b1e1e; /* Icon color */
	}

	.button-container {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 8rem;
		margin-bottom: 2rem;
		transform: scale(1.2);
	}

	.instructions {
		text-align: left;
	}

	.instructions h3 {
		color: #7b1e1e;
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

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #7b1e1e;
		color: #7b1e1e;
	}

	/* ===== Responsive ===== */
	@media (max-width: 768px) {
		h1 {
			font-size: 48px;
		}

		p {
			font-size: 1rem;
		}

		select {
			font-size: 1rem;
			padding: 0.5rem 2rem 0.5rem 1rem;
		}

		.button-container {
			flex-direction: column;
			align-items: center;
			transform: scale(1);
			gap: 1.5rem;
		}

		.top-left-button {
			transform: scale(0.7);
			top: 0.5rem;
			left: 0.5rem;
		}
	}
</style>
