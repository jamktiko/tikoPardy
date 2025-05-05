<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	let { duration, reset = 0 } = $props();
	let remaining = $state(duration);
	const dispatch = createEventDispatcher();
	let frame: number;
	let startingDelay = 500; // 500ms = 0.5 sekuntia

	// Seuraa reset-parametria ja käynnistä ajastin uudelleen kun se muuttuu
	$effect(() => {
		if (reset) {
			// Peruuta nykyinen animaatiokehys jos sellainen on
			if (frame) {
				cancelAnimationFrame(frame);
			}

			// Resetoi jäljellä oleva aika
			remaining = duration;

			// Käynnistä ajastin uudelleen pienen viiveen jälkeen
			setTimeout(() => {
				startTimer();
			}, startingDelay);
		}
	});

	// Funktio ajastimen käynnistämiseen
	function startTimer() {
		let last_time = performance.now();

		frame = requestAnimationFrame(function update(time) {
			frame = requestAnimationFrame(update);

			remaining = Math.max(remaining - (time - last_time), 0);
			last_time = time;

			// Stop the animation when the countdown reaches 0
			if (remaining <= 0) {
				cancelAnimationFrame(frame);
				dispatch('timeout');
			}
		});
	}

	onMount(() => {
		setTimeout(() => {
			startTimer();
		}, startingDelay);

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<div>
	<label for="ajastin">Aikaa vastata:</label>
	<progress id="ajastin" value={remaining / duration}></progress>
	{(remaining / 1000).toFixed(1)}s
</div>
