<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	let { duration, reset = 0, pause = false } = $props();
	let remaining = $state(duration);
	const dispatch = createEventDispatcher();
	let frame: number | undefined;
	let startingDelay = 500; // 500ms = 0.5 sekuntia
	let isRunning = $state(false);
	let lastTime = 0;

	$effect(() => {
		if (reset) {
			stopTimer();
			remaining = duration;
			setTimeout(() => {
				startTimer();
			}, startingDelay);
		}
	});

	$effect(() => {
		if (pause && isRunning) {
			stopTimer();
		} else if (!pause && !isRunning && remaining > 0) {
			setTimeout(() => {
				startTimer();
			}, 50);
		}
	});

	function startTimer() {
		if (isRunning) return;
		isRunning = true;
		lastTime = 0;

		frame = requestAnimationFrame(function update(time) {
			if (lastTime === 0) {
				lastTime = time;
				frame = requestAnimationFrame(update);
				return;
			}
			const elapsed = time - lastTime;
			lastTime = time;
			remaining = Math.max(remaining - elapsed, 0);

			if (remaining <= 0) {
				stopTimer();
				dispatch('timeout');
				return;
			}
			frame = requestAnimationFrame(update);
		});
	}

	function stopTimer() {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = undefined;
		}
		isRunning = false;
		lastTime = 0;
	}

	onMount(() => {
		if (!pause) {
			setTimeout(() => {
				startTimer();
			}, startingDelay);
		}
		return () => {
			stopTimer();
		};
	});
</script>

<label for="ajastin" class="timer-label">Aikaa vastata:</label>
<progress id="ajastin" class="timer-progress" value={remaining / duration}></progress>
<div class="timer-time">{(remaining / 1000).toFixed(1)}s</div>

<style>
	.timer-label {
		font-size: 1rem; /* Pienennetty fonttikoko entisestään */
		font-weight: 600;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.timer-progress {
		width: 150%;
		height: 5px; /* Pienennetty korkeus entisestään */
		border-radius: 5px; /* Pienennetty pyöristys entisestään */
		accent-color: #7b1e1e;
		border: 1px solid #c8b8ae;
	}

	/* Webkit-selaimille (Chrome, Safari) */
	.timer-progress::-webkit-progress-bar {
		background-color: #f5f0ec;
		border-radius: 5px; /* Pienennetty pyöristys */
	}

	.timer-progress::-webkit-progress-value {
		background-color: #7b1e1e;
		border-radius: 5px; /* Pienennetty pyöristys */
		transition: width 0.1s linear;
	}

	/* Firefoxille */
	.timer-progress::-moz-progress-bar {
		background-color: #7b1e1e;
		border-radius: 5px; /* Pienennetty pyöristys */
		transition: width 0.1s linear;
	}

	.timer-time {
		font-size: 1.2rem; /* Pienennetty fonttikoko entisestään */
		font-weight: 700;
		color: #7b1e1e;
	}
</style>
