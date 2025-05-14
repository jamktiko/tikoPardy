<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '../lib/components/Button.svelte';
	import Modal from '../lib/components/Modal.svelte';
	import kurssitData from '../lib/kurssit.json';
	import { Coffee, HelpCircle, ArrowRight, ChevronDown, X, Cog } from '@lucide/svelte';
	import { ajastinPaalla, sDeath, harkka, musiikkiMuted } from '$lib/states.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import type { CourseHighscore } from '../lib/interfaces';

	let showModal = $state(false);

	let highscores: CourseHighscore[] = $state([]);

	let kurssit: number = $state(1); // Default value

	let showInstructionsModal = $state(false);

	function toggleModal() {
		showModal = !showModal;
	}

	function getAllHighscores(): CourseHighscore[] {
		if (!browser) return [];

		return kurssitData.map((course) => {
			const score = localStorage.getItem(`tikoPardy_highScore_${course.id}`);
			return {
				id: course.id,
				name: course.nimi,
				score: score ? parseInt(score, 10) : 0
			};
		});
	}
	onMount(() => {
		highscores = getAllHighscores();
	});

	afterNavigate(() => {
		highscores = getAllHighscores();
	});

	function toggleInstructions() {
		showInstructionsModal = !showInstructionsModal;
	}

	let showSettingsModal = $state(false);
	function toggleSettings() {
		showSettingsModal = !showSettingsModal;
	}
	function startGame() {
		goto(`/game?kurssi=${encodeURIComponent(kurssit)}`);
	}

	function settingsChange() {
		// Jos harjoittelutila on päällä, varmista että muut ovat pois päältä
		if (harkka.on) {
			sDeath.on = false;
			ajastinPaalla.on = false;
		}
	}

	function asetusMuutos() {
		if (sDeath.on || ajastinPaalla.on) {
			harkka.on = false;
		}
	}
</script>

<main>
	<div class="game-container">
		<div class="top-left-button">
			<Button
				text="Buy Me A Coffee"
				onclick={() =>
					window.open(
						'https://qr.mobilepay.fi/box/d95cf72b-2b55-4494-acc4-3ab617b0418f/pay-in',
						'_blank'
					)}
				type="secondary"
			>
				<svelte:fragment slot="icon">
					<Coffee size={20} />
				</svelte:fragment>
			</Button>
		</div>

		<div class="top-right-button">
			<Button text=" 🏆 Parhaat Tuloksesi" onclick={toggleModal} type="secondary" />
		</div>

		<div class="game-content">
			<h1>TikoPardy</h1>
			<p>Tervetuloa testaamaan tietojenkäsittelyn tietämystäsi!</p>
		</div>

		<p>Valitse kurssi:</p>
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

			<Button text="Asetukset" onclick={toggleSettings} type="secondary">
				<svelte:fragment slot="icon">
					<Cog size={20} />
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
				<li>
					Kasvatat oikeilla vastauksilla streakkiasi 🔥, joka vastaavasti kasvattaa pistesaldoasi ⭐
				</li>
				<li>
					Näet parhaat tuloksesi kursseittain alkuruudun napista. Pelissä näet valitsemasi kurssin
					parhaan tuloksesi sivun oikealta. 🏆
				</li>
				<li>Peli loppuu, kun elämät ovat loppu</li>
			</ol>

			<div class="button-center">
				<Button text="Sulje" onclick={toggleInstructions} type="primary">
					<svelte:fragment slot="icon">
						<X size={24} />
					</svelte:fragment>
				</Button>
			</div>
		</div>
	</Modal>
{/if}

{#if showModal}
	<Modal>
		<div class="instructions">
			<div class="modal-header">
				<h2>🏆 Parhaat tuloksesi</h2>
			</div>
			{#if highscores.length >= 0}
				{#each highscores as course}
					<div class="highscore-item">
						<strong>{course.name}:</strong>
						{course.score} pistettä ⭐
					</div>
				{/each}
			{/if}

			<div class="button-center">
				<Button text="Sulje" onclick={toggleModal} type="primary">
					<svelte:fragment slot="icon">
						<X size={24} />
					</svelte:fragment>
				</Button>
			</div>
		</div></Modal
	>
{/if}

{#if showSettingsModal}
	<Modal>
		<div class="instructions">
			<div class="modal-header">
				<h2>Asetukset</h2>
			</div>

			<div class="settings-option">
				<br />
				<label class="checkbox-wrapper">
					<input type="checkbox" bind:checked={ajastinPaalla.on} onchange={asetusMuutos} />
					<span class="custom-checkbox"></span>
					<strong>Ajastin ⏰:</strong> 15s aikaa vastata.
				</label>

				<label class="checkbox-wrapper">
					<input type="checkbox" bind:checked={sDeath.on} onchange={asetusMuutos} />
					<span class="custom-checkbox"></span>
					<strong>Sudden Death ☠️:</strong> Vain yksi elämä.
				</label>

				<label class="checkbox-wrapper">
					<input type="checkbox" bind:checked={harkka.on} onchange={settingsChange} />
					<span class="custom-checkbox"></span>
					<strong>Harjoittelu 📖:</strong> Loputtomat elämät, ei ajastinta. Highscore ei tallennu harjoittelussa.
				</label>
				<label class="checkbox-wrapper">
					<input type="checkbox" bind:checked={musiikkiMuted.on} onchange={settingsChange} />
					<span class="custom-checkbox"></span>
					<strong>Taustamusiikki 🎶:</strong> Taustamusiikki päälle tai pois.
				</label>
			</div>

			<div class="button-center">
				<Button text="Sulje" onclick={toggleSettings} type="primary">
					<svelte:fragment slot="icon">
						<X size={24} />
					</svelte:fragment>
				</Button>
			</div>
		</div></Modal
	>
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

	.highscore-item {
		font-size: 1.25rem;
		font-family: 'Cascadia Mono', sans-serif;
		padding: 3px;
	}

	.top-left-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		transform: scale(0.8);
	}

	.top-right-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
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
		margin-top: -2rem;
		margin-bottom: 5rem;
		appearance: none;
	}

	select:focus {
		outline: none;
		border-color: #a83232;
	}

	:global(.dropdown-icon) {
		position: absolute;
		right: 0.8rem;
		top: 8%;
		transform: translateY(-50%);
		pointer-events: none;
		color: #7b1e1e;
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

	/* Checkbox tyylitys */
	.checkbox-wrapper {
		position: relative;
		padding-left: 32px;
		cursor: pointer;
		user-select: none;
		display: block;
		margin-bottom: 0.5rem;
		font-family: 'Cascadia Mono', sans-serif;
	}

	.checkbox-wrapper input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	.custom-checkbox {
		position: absolute;
		left: 0;
		top: 2px;
		height: 20px;
		width: 20px;
		background-color: white;
		border: 2px solid #888;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.checkbox-wrapper input:checked ~ .custom-checkbox {
		background-color: #4caf50;
		border-color: #4caf50;
	}

	.custom-checkbox::after {
		content: '';
		position: absolute;
		display: none;
		left: 6px;
		top: 2px;
		width: 5px;
		height: 10px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.checkbox-wrapper input:checked ~ .custom-checkbox::after {
		display: block;
	}

	@media (max-width: 1024px) {
		h1 {
			font-size: 82px;
			line-height: 2;
		}

		p {
			font-size: 2.6rem;
		}

		li {
			font-size: 1.5rem;
		}

		.top-left-button {
			transform: scale(1.1);
			top: 2rem;
			left: 2.5rem;
		}

		.top-right-button {
			transform: scale(1.1);
			top: 2rem;
			right: 2.5rem;
		}

		.button-container {
			gap: 4rem;
			transform: scale(1.4);
		}

		select {
			font-size: 2.2rem;
		}

		:global(.dropdown-icon) {
			position: absolute;
			right: 1rem;
			top: 2%;
		}
	}

	/* ===== Responsive ===== */
	@media (max-width: 768px) {
		h1 {
			font-size: 48px;
		}

		p {
			font-size: 1.8rem;
			margin-bottom: 20px;
		}

		select {
			font-size: 1.1rem;
			padding: 0.6rem 2rem 0.5rem 1rem;
		}

		.button-container {
			flex-direction: column;
			align-items: center;
			transform: scale(1);
			gap: 1.5rem;
		}

		.top-left-button {
			transform: scale(0.7);
			top: 0.25rem;
			left: -0.5rem;
		}

		.top-right-button {
			transform: scale(0.7);
			top: 0.1rem;
			right: -0.5rem;
		}

		:global(.select-wrapper) {
			position: relative;
			display: inline-block;
		}

		@media (max-width: 480px) {
			h1 {
				line-height: 2;
			}

			p {
				font-size: 1.8rem;
			}

			li {
				font-size: 1rem;
			}

			select {
				font-size: 1.1rem;
				padding: 0.6rem 2rem 0.5rem 1rem;
				margin-top: 0px;
			}

			:global(.dropdown-icon) {
				position: absolute;
				margin-top: 20px;
				right: 0.8rem;
				transform: translateY(-50%);
				pointer-events: none;
				color: #7b1e1e;
			}
		}

		@media (max-width: 400px) {
			h1 {
				font-size: 42px;
			}

			p {
				font-size: 1.4rem;
				padding-top: 15px;
			}

			li {
				font-size: 1.1rem;
			}

			select {
				font-size: 1.1rem;
				padding: 0.6rem 2rem 0.5rem 1rem;
				margin-top: 10px;
			}

			.top-left-button {
				transform: scale(0.6);
				top: 0.2rem;
				left: -0.5rem;
			}

			.top-right-button {
				transform: scale(0.6);
				top: 0.1rem;
				right: -0.5rem;
			}

			:global(.dropdown-icon) {
				position: absolute;
				margin-top: 30px;
				right: 0.8rem;
				transform: translateY(-50%);
				pointer-events: none;
				color: #7b1e1e;
			}
		}
	}
</style>
