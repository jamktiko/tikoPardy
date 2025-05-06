<script lang="ts">
	import Button from '../../lib/components/GameButton.svelte';
	import Modal from '../../lib/components/GameModal.svelte';
	import AudioSlider from '$lib/components/AudioSlider.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Volume2, VolumeX, Volume1, MoveLeft } from '@lucide/svelte';
	import kurssitData from '../../lib/kurssit.json';
	import Timer from '../../lib/components/Timer.svelte';
	import { ajastinPaalla, sDeath, harkka } from '$lib/states.svelte';

	let audioVolume = $state(0.2); // Initial volume set to match the prop in AudioSlider
	let isMuted = $state(false);

	let otsikko: string = $state('');
	let resetCounter = $state(0); // Counter for resetting the timer

	function handleVolumeChange(event: CustomEvent) {
		audioVolume = event.detail.volume;
		isMuted = audioVolume === 0;
	}

	interface Kysymys {
		kysymys: string;
		vastaus: string;
		lyhenne?: string;
	}

	function getInitialLives() {
		if (harkka.on) return 999; // Harjoitusmoodi: lähes "rajaton" määrä elämiä
		if (sDeath.on) return 1; // Sudden Death: vain yksi elämä
		return 3; // Normaalimoodi: 3 elämää
	}

	let kysymykset: Kysymys[] = [];
	let kurssiId = $state(0); // Kurssin ID otetaan suoraan URL-parametrista
	let timerPaused = $state(false);

	onMount(async () => {
		try {
			// Haetaan kurssin ID URL-parametrista
			kurssiId = parseInt($page.url.searchParams.get('kurssi') || '0', 10);

			const selectedCourse = kurssitData.find((course) => course.id === kurssiId);
			if (selectedCourse) {
				otsikko = selectedCourse.nimi;
			} else {
				console.error('Kurssia ei löytynyt ID:llä:', kurssiId);
				otsikko = 'Tuntematon kurssi';
			}

			// Ladataan kaikki kysymykset yhdestä JSON-tiedostosta
			const jsonData = await import('../../lib/kysymykset.json');

			// Suodatetaan kysymykset kurssin ID:n perusteella
			if (Array.isArray(jsonData.default)) {
				kysymykset = jsonData.default
					.filter((item) => item.kurssi === kurssiId) // Suodatetaan ID:n perusteella
					.map((item) => ({
						kysymys: item.selitys,
						vastaus: item.sana,
						lyhenne: item?.lyhenne // Voi olla undefined jossakin tiedostoissa
					}));
				console.log('Ladatut kysymykset:', kysymykset);
			} else {
				console.error('Virheellinen dataformaatti:', jsonData.default);
				kysymykset = [];
			}

			lives = getInitialLives(); // Elämien määrä, oletuksena 3

			// Alustetaan ensimmäinen kysymys
			randomKysymys = randomQuestion();
			shuffledAnswers = randomizeAnswers();
		} catch (error) {
			console.error('Virhe datan lataamisessa:', error);
			openModal('Virhe', 'Kysymysten lataaminen epäonnistui!');
		}
	});

	let usedQuestionIndices: number[] = $state([]);
	let lives = $state(sDeath.on ? 1 : 3); // Elämien määrä, oletuksena 3
	let score = $state(0);

	let showModal = $state(false);
	let modalMessage = $state('');
	let modalTitle = $state('');

	let correctEffect: any = $state();
	let wrongEffect: any = $state();

	function correctSound() {
		correctEffect.play();
	}

	function wrongSound() {
		wrongEffect.play();
	}

	function openModal(title: string, message: string) {
		modalTitle = title;
		modalMessage = message;
		showModal = true;
	}

	function toggleMute() {
		if (isMuted) {
			audioVolume = 0.3;
			isMuted = false;
		} else {
			audioVolume = 0;
			isMuted = true;
		}
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

	function getRandomWrongAnswers(correctAnswer: string, count: number = 3) {
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
				wrongAnswers: ['', '', '']
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

		return { ...kysymys, wrongAnswers };
	}

	let randomKysymys = $state({
		kysymys: 'Ladataan kysymyksiä...',
		vastaus: '',

		wrongAnswers: ['', '', '']
	});

	let vastaus = $derived(randomKysymys.vastaus);
	let wrongAnswers = $derived(randomKysymys.wrongAnswers || ['', '', '']);

	function tarkistusVastaus(valinta: string) {
		// Pysäytä ajastin heti kun käyttäjä vastaa
		timerPaused = true;

		if (valinta === randomKysymys.vastaus) {
			openModal('Tulokset', 'Oikein!');
			increaseScore();
			correctSound();
		} else {
			openModal('Tulokset', 'Väärin! Oikea vastaus on: ' + randomKysymys.vastaus);
			lives -= 1;
			resetStreak();
			wrongSound();
		}
	}

	function newQuestion() {
		closeModal();
		if (lives > 0) {
			randomKysymys = randomQuestion();
			shuffledAnswers = randomizeAnswers();

			// Nollaa ajastimen tila ja käynnistä se uudelleen
			timerPaused = false;
			resetTimer();
		}
	}

	function resetGame() {
		lives = getInitialLives();
		score = 0;
		streak = 0;
		lastPoints = 100;
		usedQuestionIndices = [];
		randomKysymys = randomQuestion();
		shuffledAnswers = randomizeAnswers();
		closeModal();
		showVictoryModal = false;
		resetTimer();
		timerPaused = false;
	}

	function mainMenu() {
		goto('/');
	}

	function randomizeAnswers() {
		const answers = [
			{ text: vastaus, isCorrect: true },

			{ text: wrongAnswers[0], isCorrect: false },
			{ text: wrongAnswers[1], isCorrect: false },
			{ text: wrongAnswers[2], isCorrect: false }
		].filter((a) => a.text);

		return answers.sort(() => Math.random() - 0.5);
	}

	let shuffledAnswers = $state<{ text: string; isCorrect: boolean }[]>([]);

	function handleTimeout() {
		lives -= 1;
		resetStreak();
		openModal('Aika loppui!', 'Vastausaika loppui ennen kuin ehdit vastata.');
	}

	function resetTimer() {
		resetCounter++;
	}
</script>

<button class="goBack" onclick={mainMenu}><MoveLeft /></button>
<h1 class="">TikoPardy - {otsikko}</h1>

{#if ajastinPaalla.on}
	<div>
		<Timer duration={15000} reset={resetCounter} pause={timerPaused} on:timeout={handleTimeout} />
	</div>
{/if}

<div class="game-info-side">
	{#if !harkka.on}
		<div class="info lives">❤️ {lives}</div>
	{/if}
	<div class="info score">⭐ {score}</div>
	<div class="info streak">🔥 {streak}</div>
</div>

<div class="audio-slider-container">
	<button class="volume-button" onclick={toggleMute}>
		{#if audioVolume <= 0}
			<VolumeX class="volume-icon" />
		{:else if audioVolume <= 0.5}
			<Volume1 class="volume-icon" />
		{:else}
			<Volume2 class="volume-icon" />
		{/if}
	</button>

	<AudioSlider
		setVolume={audioVolume}
		Mplay={false}
		audioSrc="millionaireBackground.mp3"
		on:volumechange={handleVolumeChange}
	/>
</div>

<div class="main-content">
	<div class="question-box">
		<h3 class="question-label">Kysymys</h3>
		<h2>{randomKysymys.kysymys}</h2>
	</div>

	{#each shuffledAnswers as answer}
		<Button onclick={() => tarkistusVastaus(answer.text)} text={answer.text} />
	{/each}
</div>

{#if showModal}
	<Modal>
		<header style="font-weight: bold;">{modalTitle}</header>
		<div>{modalMessage}</div>
		<footer class="modal-buttons">
			<Button onclick={() => newQuestion()} text="Seuraava kysymys" />
		</footer>
	</Modal>
{/if}

{#if lives <= 0}
	<Modal>
		<header style="font-weight: bold;">Game Over</header>
		<div>Hävisit pelin!</div>
		<div>Pisteet: {score}</div>
		<footer class="modal-buttons">
			<Button onclick={() => resetGame()} text="Yritä Uudelleen" type="retry" />
			<Button onclick={() => mainMenu()} text="Alkuruutuun" type="main" />
		</footer>
	</Modal>
{/if}

{#if showVictoryModal}
	<Modal>
		<header style="font-weight: bold;">Voitit Pelin!</header>
		<div>Onneksi olkoon, selvisit kaikki kysymykset!</div>
		<div>Pisteet: {score}</div>
		<footer class="modal-buttons">
			<Button onclick={() => resetGame()} text="Pelaa Uudelleen" />
			<Button onclick={() => mainMenu()} text="Alkuruutuun" />
		</footer>
	</Modal>
{/if}

<audio src="correct.mp3" bind:this={correctEffect} volume="1"></audio>
<audio src="wrong.mp3" bind:this={wrongEffect} volume="1"></audio>

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

	:global(.main-content) {
		padding-right: 70px; /* Leaves space so text doesn't overlap fixed boxes */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.modal-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	h1 {
		text-align: center;
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 30px;
		color: #7b1e1e;
		margin-top: -2rem;
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 2rem;
		background: #fff;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
		color: #333;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin: 0 auto;
		max-width: 950px;
	}

	.question-box {
		text-align: center;
		margin-bottom: 0rem;
	}

	.question-label {
		font-size: 1.2rem;
		color: #555;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: -2rem;
		letter-spacing: 0.05em;
	}

	.game-info-side {
		position: fixed;
		top: 70%;
		right: 35px; /* Match the slider's right value */
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

	.audio-slider-container {
		position: fixed;
		top: 40%;
		right: 15px;
		transform: translateY(-50%);
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		z-index: 11;
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
		font-size: 2.5rem;
		text-align: center;
	}

	.info.score {
		background-color: #e8f5e9;
		color: #2e7d32;
		font-size: 2.5rem;
		text-align: center;
	}

	.info.streak {
		background-color: #e3f2fd;
		color: #1565c0;
		font-size: 2.5rem;
		text-align: center;
	}

	:global(.volume-icon) {
		width: 1.6rem;
		height: 1.6rem;
		color: rgb(89, 89, 89);
		flex-shrink: 0; /* Prevent icon from shrinking */
	}

	.volume-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
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
