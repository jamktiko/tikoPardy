<script lang="ts">
	import Button from '../../lib/components/GameButton.svelte';
	import Modal from '../../lib/components/GameModal.svelte';
	import AudioSlider from '$lib/components/AudioSlider.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Volume2, VolumeX, Volume1, MoveLeft } from '@lucide/svelte';

	// All your existing code remains the same...

	// Add this new state variable to track volume
	let audioVolume = $state(0.3); // Initial volume set to match the prop in AudioSlider

	function handleVolumeChange(event: CustomEvent) {
		audioVolume = event.detail.volume;
	}
	interface Kysymys {
		kysymys: string;
		vastaus: string;
		vaara?: string;
		lyhenne?: string;
	}

	let kysymykset: Kysymys[] = [];
	let kurssi = $state('');

	onMount(async () => {
		try {
			kurssi = $page.url.searchParams.get('kurssi') || '';
			// Ladataan kaikki kysymykset yhdestä JSON-tiedostosta
			const jsonData = await import('../../lib/kysymykset.json');

			// Haetaan kurssin ID kurssin nimen perusteella
			const kurssit = await import('../../lib/kurssit.json');

			const selectedCourse = kurssit.default.find(
				(course) => course.nimi.toLowerCase() === kurssi.toLowerCase()
			);

			if (!selectedCourse) {
				alert('Kurssia ei löytynyt: ' + kurssi);
				kysymykset = [];
				return;
			}

			// Suodatetaan kysymykset kurssin ID:n perusteella
			const courseId = selectedCourse.id;
			if (Array.isArray(jsonData.default)) {
				kysymykset = jsonData.default
					.filter((item) => item.id === courseId)
					.map((item) => ({
						kysymys: item.selitys,
						vastaus: item.sana,
						vaara: '',
						lyhenne: item?.lyhenne // Voi olla undefined jossakin tiedostoissa
					}));
			} else {
				console.error('Virheellinen dataformaatti:', jsonData.default);
				kysymykset = [];
			}

			randomKysymys = randomQuestion();
			shuffledAnswers = randomizeAnswers();
		} catch (error) {
			console.error('Virhe datan lataamisessa:', error);
			openModal('Virhe', 'Kysymysten lataaminen epäonnistui!');
		}
	});

	let usedQuestionIndices: number[] = $state([]);
	let lives = $state(3);
	let score = $state(0);

	let showModal = $state(false);
	let modalMessage = $state('');
	let modalTitle = $state('');

	function openModal(title: string, message: string) {
		modalTitle = title;
		modalMessage = message;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	let streak = $state(0);
	let lastPoints = $state(100);
	let showVictoryModal = $state(false);

	function increaseScore() {
		streak++;
		if (streak === 1) {
			score += 100;
			lastPoints = 100;
		} else {
			const newPoints = Math.round(lastPoints * 1.3);
			score += newPoints;
			lastPoints = newPoints;
		}
		return {
			points: lastPoints,
			streak: streak
		};
	}

	function resetStreak() {
		streak = 0;
		lastPoints = 100;
	}

	function getRandomWrongAnswers(correctAnswer: string, count: number = 2) {
		const otherAnswers = kysymykset
			.filter((q) => q.vastaus !== correctAnswer)
			.map((q) => q.vastaus);

		const result = [];
		const availableAnswers = [...otherAnswers];

		for (let i = 0; i < count && availableAnswers.length > 0; i++) {
			const randomIndex = Math.floor(Math.random() * availableAnswers.length);
			result.push(availableAnswers[randomIndex]);
			availableAnswers.splice(randomIndex, 1);
		}

		return result;
	}

	function randomQuestion() {
		if (kysymykset.length === 0) {
			return {
				kysymys: 'Ei kysymyksiä saatavilla',
				vastaus: '',
				vaara: '',
				extraWrongAnswers: ['', '']
			};
		} else if (usedQuestionIndices.length === kysymykset.length) {
			showVictoryModal = true;
		}

		let randomIndex: number;
		do {
			randomIndex = Math.floor(Math.random() * kysymykset.length);
		} while (
			usedQuestionIndices.includes(randomIndex) &&
			usedQuestionIndices.length < kysymykset.length
		);

		usedQuestionIndices.push(randomIndex);

		const kysymys = kysymykset[randomIndex];
		const wrongAnswers = getRandomWrongAnswers(kysymys.vastaus, 3);
		const vaara = wrongAnswers[0] || 'Ei vastausta';
		const extraWrongAnswers = wrongAnswers.slice(1);

		return { ...kysymys, vaara, extraWrongAnswers };
	}

	let randomKysymys = $state({
		kysymys: 'Ladataan kysymyksiä...',
		vastaus: '',
		vaara: '',
		extraWrongAnswers: ['', '']
	});

	let vastaus = $derived(randomKysymys.vastaus);
	let vaara = $derived(randomKysymys.vaara);
	let extraWrongAnswers = $derived(randomKysymys.extraWrongAnswers || ['', '']);

	function tarkistusVastaus(valinta: string) {
		if (valinta === randomKysymys.vastaus) {
			openModal('Tulokset', 'Oikein!');
			increaseScore();
		} else {
			openModal('Tulokset', 'Väärin! Oikea vastaus on: ' + randomKysymys.vastaus);
			lives -= 1;
			resetStreak();
		}
	}

	function newQuestion() {
		closeModal();
		if (lives > 0) {
			randomKysymys = randomQuestion();
			shuffledAnswers = randomizeAnswers();
		}
	}

	function resetGame() {
		lives = 3;
		score = 0;
		streak = 0;
		lastPoints = 100;
		usedQuestionIndices = [];
		randomKysymys = randomQuestion();
		shuffledAnswers = randomizeAnswers();
		closeModal();
		showVictoryModal = false;
	}

	function mainMenu() {
		goto('/');
	}

	function randomizeAnswers() {
		const answers = [
			{ text: vastaus, isCorrect: true },
			{ text: vaara, isCorrect: false },
			{ text: extraWrongAnswers[0], isCorrect: false },
			{ text: extraWrongAnswers[1], isCorrect: false }
		].filter((a) => a.text);

		return answers.sort(() => Math.random() - 0.5);
	}

	let shuffledAnswers = $state<{ text: string; isCorrect: boolean }[]>([]);
</script>

<button class="goBack" onclick={mainMenu}><MoveLeft /></button>
<h1>TikoPardy - {kurssi}</h1>

<div class="game-info-side">
	<div class="info lives">❤️ {lives}</div>
	<div class="info score">⭐ {score}</div>
	<div class="info streak">🔥 {streak}</div>
</div>

<div class="audio-slider-container">
	{#if audioVolume <= 0}
		<VolumeX class="volume-icon" />
	{:else if audioVolume <= 0.5}
		<Volume1 class="volume-icon" />
	{:else}
		<Volume2 class="volume-icon" />
	{/if}
	<AudioSlider
		setVolume={audioVolume}
		Mplay={false}
		audioSrc="millionaireBackground.mp3"
		on:volumechange={handleVolumeChange}
	/>
</div>

<h2>{randomKysymys.kysymys}</h2>

<div>
	{#each shuffledAnswers as answer}
		<Button onclick={() => tarkistusVastaus(answer.text)} text={answer.text} />
	{/each}
</div>

{#if showModal}
	<Modal>
		<header style="font-weight: bold;">{modalTitle}</header>
		<div>{modalMessage}</div>
		<div>Elämiä jäljellä: {lives}</div>
		<footer><Button onclick={() => newQuestion()} text="Seuraava kysymys" /></footer>
	</Modal>
{/if}

{#if lives <= 0}
	<Modal>
		<header style="font-weight: bold;">Game Over</header>
		<div>Hävisit pelin!</div>
		<div>Pisteet: {score}</div>
		<footer>
			<Button onclick={() => resetGame()} text="Yritä Uudelleen" />
			<Button onclick={() => mainMenu()} text="Alkuruutuun" />
		</footer>
	</Modal>
{/if}

{#if showVictoryModal}
	<Modal>
		<header style="font-weight: bold;">Voitit Pelin!</header>
		<div>Onneksi olkoon, selvisit kaikki kysymykset!</div>
		<div>Pisteet: {score}</div>
		<footer>
			<Button onclick={() => resetGame()} text="Pelaa Uudelleen" />
			<Button onclick={() => mainMenu()} text="Alkuruutuun" />
		</footer>
	</Modal>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono&family=Roboto:wght@400;700&display=swap');

	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
		background: #f5f0ec;
		font-family: 'Cascadia Mono', sans-serif;
		color: #333;
	}

	h1 {
		text-align: center;
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 64px;
		color: #7b1e1e;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	h2 {
		text-align: center;
		font-size: 2rem;
		color: #333;
		margin-bottom: 2rem;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin: 0 auto;
		max-width: 600px;
	}

	.game-info-side {
		position: fixed;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		background-color: rgba(255, 255, 255, 0.85);
		padding: 0.6rem;
		border-radius: 10px;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
		gap: 0.3rem;
		min-width: 110px;
		z-index: 10;
	}

	.info {
		font-size: 1rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
		width: 85%;
		text-align: right;
	}

	.info.lives {
		background-color: #ffe5e5;
		color: #c62828;
	}

	.info.score {
		background-color: #e8f5e9;
		color: #2e7d32;
	}

	.info.streak {
		background-color: #e3f2fd;
		color: #1565c0;
	}

	.audio-slider-container {
		display: flex;
		flex-direction: row; /* Ensure items are laid out horizontally */
		align-items: center; /* Align icon and slider vertically */
		gap: 1rem; /* Adjust gap between icon and slider */
		justify-content: center; /* Center the container horizontally */
		margin: 1rem auto; /* Add some margin and center it */
		width: fit-content; /* Make container only as wide as needed */
	}

	:global(.volume-icon) {
		width: 1.5rem; /* Adjust size of the icon */
		height: 1.5rem; /* Adjust size of the icon */
		color: rgb(89, 89, 89); /* Icon color */
		flex-shrink: 0; /* Prevent icon from shrinking */
	}

	.goBack {
		background-color: #f5f0ec;
		border: none;
		padding: 0.5rem 1rem;
	}
	.goBack:hover {
		background-color: #e0d5d1;
		cursor: pointer;
		transform: scale(1.3);
		border-radius: 0.5rem;
	}
</style>
