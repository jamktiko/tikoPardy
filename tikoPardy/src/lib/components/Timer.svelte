<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let { duration, reset = 0, pause = false } = $props(); // Lisää pause-prop
	let remaining = $state(duration);
	const dispatch = createEventDispatcher();
	let frame: number;
	let isRunning = $state(false);

	// Seuraa reset-parametria ja käynnistä ajastin uudelleen kun se muuttuu
	$effect(() => {
		if (reset) {
			// Peruuta nykyinen animaatiokehys jos sellainen on
			stopTimer();

			// Resetoi jäljellä oleva aika
			remaining = duration;
		}
	});

	// Seuraa pause-parametria ja pysäytä/käynnistä ajastin sen mukaan
	$effect(() => {
		if (pause && isRunning) {
			stopTimer();
		} else if (!pause && !isRunning && remaining > 0) {
			startTimer();
		}
	});

	// Funktio ajastimen käynnistämiseen
	function startTimer() {
		if (isRunning) return; // Älä käynnistä jos jo käynnissä

		isRunning = true;
		let last_time = performance.now();

		frame = requestAnimationFrame(function update(time) {
			frame = requestAnimationFrame(update);

			// Vähennä jäljellä olevaa aikaa vain jos ajastin on käynnissä
			if (isRunning) {
				remaining = Math.max(remaining - (time - last_time), 0);

				// Pysäytä animaatio kun laskuri saavuttaa 0
				if (remaining <= 0) {
					stopTimer();
					dispatch('timeout');
				}
			}

			last_time = time;
		});
	}

	// Funktio ajastimen pysäyttämiseen
	function stopTimer() {
		if (frame) {
			cancelAnimationFrame(frame);
		}
		isRunning = false;
	}
</script>

<div>
	<label for="ajastin">Aikaa vastata:</label>
	<progress id="ajastin" value={remaining / duration}></progress>
	{(remaining / 1000).toFixed(1)}s
</div>
