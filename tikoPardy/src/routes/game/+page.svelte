<script lang="ts">
        import Button from '../../lib/components/GameButton.svelte';
        import Modal from '../../lib/components/GameModal.svelte';
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
            kurssi = $page.url.searchParams.get('kurssi') || 'Pilvipalveluiden perusteet';
            
            // Valitaan oikea JSON-tiedosto kurssin perusteella
            let jsonData;
            switch(kurssi) {
              case 'Pilvipalveluiden perusteet':
                jsonData = await import('../../lib/pilvi_sanat.json');
                break;
              case 'Tietoturvan perusteet':
                jsonData = await import('../../lib/tietoturva_sanat.json');
                break;
              case 'Web Perusteet':
                jsonData = await import('../../lib/web_sanat.json');
                break;
              default:
                jsonData = await import('../../lib/pilvi_sanat.json'); // Oletus
            }
            
            // Muodosta kysymykset kun data on ladattu
            if (Array.isArray(jsonData.default)) {
              kysymykset = jsonData.default.map(item => ({
                kysymys: item.selitys,
                vastaus: item.sana,
                vaara: "", 
                lyhenne: item?.lyhenne // Voi olla undefined jossakin tiedostoissa
              }));
            } else {
              console.error("Virheellinen dataformaatti:", jsonData.default);
              kysymykset = [];
            }
            
            // Alusta ensimmäinen kysymys
            randomKysymys = randomQuestion();
            shuffledAnswers = randomizeAnswers();
          } catch (error) {
            console.error("Virhe datan lataamisessa:", error);
            openModal("Virhe", "Kysymysten lataaminen epäonnistui!");
          }
        });
      
        let usedQuestionIndices: number[] = [];
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
      
        function getRandomWrongAnswers(correctAnswer: string, count: number = 2) {
          // Suodatetaan pois nykyinen oikea vastaus duplikaattien välttämiseksi
          const otherAnswers = kysymykset
            .filter(q => q.vastaus !== correctAnswer)
            .map(q => q.vastaus);
          
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
          // Tarkistetaan onko kaikki kysymykset käytetty
          if (usedQuestionIndices.length >= kysymykset.length) {
            // Nollataan käytetyt kysymykset, jos kaikki kysymykset on näytetty
            usedQuestionIndices = [];
          }
          
          // Lisätään turvatarkistus virheiden estämiseksi, jos taulukko on tyhjä
          if (kysymykset.length === 0) {
            return { 
              kysymys: "Ei kysymyksiä saatavilla", 
              vastaus: "", 
              vaara: "",
              extraWrongAnswers: ["", ""]
            };
          }

          // Haetaan satunnainen indeksi, jota ei ole vielä käytetty
          let randomIndex: number;
          do {
            randomIndex = Math.floor(Math.random() * kysymykset.length);
          } while (usedQuestionIndices.includes(randomIndex) && usedQuestionIndices.length < kysymykset.length);
          
          // Merkitään tämä kysymys käytetyksi
          usedQuestionIndices.push(randomIndex);
          
          const kysymys = kysymykset[randomIndex];
          
          // Generoidaan satunnaiset väärät vastaukset
          const wrongAnswers = getRandomWrongAnswers(kysymys.vastaus, 3);
          const vaara = wrongAnswers[0] || "Ei vastausta";
          const extraWrongAnswers = wrongAnswers.slice(1);
          
          return { ...kysymys, vaara, extraWrongAnswers };
        }
      
        // Alusta tyhjillä arvoilla kunnes data on ladattu
        let randomKysymys = $state({
          kysymys: "Ladataan kysymyksiä...",
          vastaus: "",
          vaara: "",
          extraWrongAnswers: ["", ""]
        });
      
        let vastaus = $derived(randomKysymys.vastaus);
        let vaara = $derived(randomKysymys.vaara);
        let extraWrongAnswers = $derived(randomKysymys.extraWrongAnswers || ["", ""]);
        
        function tarkistusVastaus(valinta: string) {
          if (valinta === randomKysymys.vastaus) {
            openModal('Tulokset', 'Oikein!');
            score += 100;
          } else {
            openModal('Tulokset', 'Väärin! Oikea vastaus on: ' + randomKysymys.vastaus);
            lives -= 1; 
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
          usedQuestionIndices = [];
          randomKysymys = randomQuestion();
          shuffledAnswers = randomizeAnswers();
          closeModal();
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
          ].filter(a => a.text); // Suodatetaan tyhjät vastaukset
          
          // Sekoitetaan järjestys satunnaisvertailulla
          return answers.sort(() => Math.random() - 0.5);
        }

        let shuffledAnswers = $state<{ text: string; isCorrect: boolean }[]>([]);
</script>

<h1>TikoPardy - {kurssi}</h1>
<div class="lives">Elämät: {lives}</div>
<div class="score">Pisteet: {score}</div>

<h2>{randomKysymys.kysymys}</h2>

<div>
  {#each shuffledAnswers as answer}
    <Button
      onclick={() => tarkistusVastaus(answer.text)}
      text={answer.text}
    />
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
      <div>Peli on päättynyt!</div>
      <div>Pisteet: {score}</div>

      <footer>
        <Button onclick={() => resetGame()} text="Yritä Uudelleen" />
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
</style>