<script lang="ts">
	import Button from '../../lib/components/GameButton.svelte';
	import Modal from '../../lib/components/GameModal.svelte';
	import AudioSlider from '$lib/components/AudioSlider.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Oletuksena käytettävä data
	interface Kysymys {
		kysymys: string;
		vastaus: string;
		vaara?: string;
		lyhenne?: string;
	}

	let kysymykset: Kysymys[] = [];
	let kurssi = $state('');

	// Lataa data URL-parametrin perusteella
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

			// Alusta ensimmäinen kysymys
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

	// Modal control
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

		// Näytetään käyttäjälle palautetta
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
		// Suodatetaan pois nykyinen oikea vastaus duplikaattien välttämiseksi
		const otherAnswers = kysymykset
			.filter((q) => q.vastaus !== correctAnswer)
			.map((q) => q.vastaus);

		// Vaihtoehtoinen lähestymistapa: valitaan vastaukset suoraan satunnaisesti
		const result = [];
		const availableAnswers = [...otherAnswers]; // Kopioidaan alkuperäistä muuttamatta

		for (let i = 0; i < count && availableAnswers.length > 0; i++) {
			const randomIndex = Math.floor(Math.random() * availableAnswers.length);
			result.push(availableAnswers[randomIndex]);
			// Poistetaan duplikaattien välttämiseksi
			availableAnswers.splice(randomIndex, 1);
		}

		return result;
	}

	function randomQuestion() {
		// Lisätään turvatarkistus virheiden estämiseksi, jos taulukko on tyhjä
		if (kysymykset.length === 0) {
			return {
				kysymys: 'Ei kysymyksiä saatavilla',
				vastaus: '',
				vaara: '',
				extraWrongAnswers: ['', '']
			};
		} else if (usedQuestionIndices.length === kysymykset.length) {
			// Näytetään voittomodal
			showVictoryModal = true;
		}
		// Haetaan satunnainen indeksi, jota ei ole vielä käytetty
		let randomIndex: number;
		do {
			randomIndex = Math.floor(Math.random() * kysymykset.length);
		} while (
			usedQuestionIndices.includes(randomIndex) &&
			usedQuestionIndices.length < kysymykset.length
		);

		// Merkitään tämä kysymys käytetyksi
		usedQuestionIndices.push(randomIndex);

		const kysymys = kysymykset[randomIndex];

		// Generoidaan satunnaiset väärät vastaukset
		const wrongAnswers = getRandomWrongAnswers(kysymys.vastaus, 3);
		const vaara = wrongAnswers[0] || 'Ei vastausta';
		const extraWrongAnswers = wrongAnswers.slice(1);

		return { ...kysymys, vaara, extraWrongAnswers };
	}

	// Alusta tyhjillä arvoilla kunnes data on ladattu
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

	// Vaihtoehtoinen tapa sekoittaa vastaukset
	function randomizeAnswers() {
		const answers = [
			{ text: vastaus, isCorrect: true },
			{ text: vaara, isCorrect: false },
			{ text: extraWrongAnswers[0], isCorrect: false },
			{ text: extraWrongAnswers[1], isCorrect: false }
		].filter((a) => a.text); // Suodatetaan tyhjät vastaukset

		// Sekoitetaan järjestys satunnaisvertailulla
		return answers.sort(() => Math.random() - 0.5);
	}

	let shuffledAnswers = $state<{ text: string; isCorrect: boolean }[]>([]);
</script>

<h1>TikoPardy - {kurssi}</h1>
<div class="lives">Elämät: {lives}</div>
<div class="score">Pisteet: {score}</div>
<div class="streak">Streak: {streak}</div>
<div class="audio-slider">
	<AudioSlider setVolume={0.3} Mplay={true} audioSrc="millionaireBackground.mp3" />
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
	@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

	.lives {
		position: fixed;
		top: 10px;
		right: 10px;
		width: 10%;
		font-size: 1.5rem;
		color: red;
		border-radius: 5px;
	}

	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
		background: #f5f0ec; /* Same soft neutral */
		font-family: 'Cascadia Mono', sans-serif;
		color: #333;
	}

	h1 {
		text-align: center;
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 64px;
		color: #7b1e1e; /* Dark red */
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

	.score {
		position: fixed;
		top: 50px;
		right: 10px;
		width: 10%;
		font-size: 1.5rem;
		color: green;
		border-radius: 5px;
	}
	.streak {
		position: fixed;
		top: 90px;
		right: 10px;
		width: 10%;
		font-size: 1.5rem;
		color: blue;
		border-radius: 5px;
	}
</style>
