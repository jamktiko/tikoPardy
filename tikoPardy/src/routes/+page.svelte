<script lang="ts">
  import Button from '../lib/components/Button.svelte';
  import Modal from '../lib/components/Modal.svelte';
import sanatData from '../lib/sanat.json';

  // Use the imported data directly but map it differently
  let kysymykset = sanatData.map(item => ({
      kysymys: item.selitys,
      vastaus: item.sana,
      vaara: "", // We'll generate this randomly later
      lyhenne: item.lyhenne // Keep the lyhenne field in case needed
  }));
  
  // Keep track of used questions
  let usedQuestionIndices: number[] = [];

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
          // Filter out the current correct answer to avoid duplicates
          const otherAnswers = kysymykset
                  .filter(q => q.vastaus !== correctAnswer)
                  .map(q => q.vastaus);
          
          // Alternative approach: pick random answers directly
          const result = [];
          const availableAnswers = [...otherAnswers]; // Copy to avoid modifying original
          
          for (let i = 0; i < count && availableAnswers.length > 0; i++) {
                  const randomIndex = Math.floor(Math.random() * availableAnswers.length);
                  result.push(availableAnswers[randomIndex]);
                  // Remove to avoid duplicates
                  availableAnswers.splice(randomIndex, 1);
          }
          
          return result;
  }
  
  function randomQuestion() {
          // Check if all questions have been used
          if (usedQuestionIndices.length >= kysymykset.length) {
                  // Reset used questions if all questions have been shown
                  usedQuestionIndices = [];
                  openModal('Huomio', 'Kaikki kysymykset on käyty läpi. Aloitetaan alusta!');
          }
          
          // Add safety check to prevent errors if array is empty
          if (kysymykset.length === 0) {
                  return { 
                          kysymys: "Ei kysymyksiä saatavilla", 
                          vastaus: "", 
                          vaara: "",
                          extraWrongAnswers: ["", ""]
                  };
          }

          // Get a random index that hasn't been used yet
          let randomIndex: number;
          do {
                  randomIndex = Math.floor(Math.random() * kysymykset.length);
          } while (usedQuestionIndices.includes(randomIndex) && usedQuestionIndices.length < kysymykset.length);
          
          // Track this question as used
          usedQuestionIndices.push(randomIndex);
          
          const kysymys = kysymykset[randomIndex];
          
          // Generate random wrong answer
          if (!kysymys.vaara) {
              const wrongAnswers = getRandomWrongAnswers(kysymys.vastaus, 3);
              kysymys.vaara = wrongAnswers[0] || "Ei vastausta";
              const extraWrongAnswers = wrongAnswers.slice(1);
              
              return { ...kysymys, extraWrongAnswers };
          }
          
          // Get two random wrong answers from other questions
          const extraWrongAnswers = getRandomWrongAnswers(kysymys.vastaus);
          
          return { ...kysymys, extraWrongAnswers };
  }



  // Initialize with the random question
  let randomKysymys = $state(randomQuestion());

  let vastaus = $derived(randomKysymys.vastaus);
  let vaara = $derived(randomKysymys.vaara);
  let extraWrongAnswers = $derived(randomKysymys.extraWrongAnswers || ["", ""]);

  function tarkistusVastaus(valinta: string) {
          if (valinta === randomKysymys.vastaus) {
                  openModal('Tulokset', 'Oikein!');
          } else {
                  openModal('Tulokset', 'Väärin! Oikea vastaus on: ' + randomKysymys.vastaus);
          }
  }
  
  // Add a function to get a new question
  function newQuestion() {
          randomKysymys = randomQuestion();
          vastaus = randomKysymys.vastaus;
          vaara = randomKysymys.vaara;
          extraWrongAnswers = randomKysymys.extraWrongAnswers || ["", ""];
          closeModal()
  }

  // Alternative approach to shuffle answers without shuffleArray
  function randomizeAnswers() {
          const answers = [
                  { text: vastaus, isCorrect: true },
                  { text: vaara, isCorrect: false },
                  { text: extraWrongAnswers[0], isCorrect: false },
                  { text: extraWrongAnswers[1], isCorrect: false }
          ];
          
          // Randomize the order by sorting with random comparison
          return answers.sort(() => Math.random() - 0.5);
  }

  let shuffledAnswers = $state(randomizeAnswers());

  // Re-randomize whenever we get a new question
  $effect(() => {
          if (randomKysymys) {
                  shuffledAnswers = randomizeAnswers();
          }
  });
</script>

<h1>AWS Kysymyspeli</h1>

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

      <footer><Button onclick={() => newQuestion()} text="Seuraava kysymys" /></footer>
  </Modal>
{/if}