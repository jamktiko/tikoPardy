<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { linear } from 'svelte/easing';

	let { duration, reset = 0, pause = false } = $props();
	const dispatch = createEventDispatcher();

	const tween = new Tween(1, {
		delay: 200,
		duration: duration,
		easing: linear
	});

	// Using $derived to track the current tween value
	let remaining = $derived(Math.round(tween.current * duration));
	let isRunning = $state(false);

	$effect(() => {
		if (reset) {
			resetTimer();
		}
	});

	$effect(() => {
		if (pause && isRunning) {
			pauseTimer();
		} else if (!pause && !isRunning && remaining > 0) {
			setTimeout(() => {
				resumeTimer();
			}, 50);
		}
	});

	$effect(() => {
		if (tween.current <= 0 && isRunning) {
			isRunning = false;
			dispatch('timeout');
		}
	});

	function startTimer() {
		if (isRunning) return;
		isRunning = true;

		// Set the target to 0 (empty) with animation
		tween.set(0, {
			duration: duration,
			easing: linear
		});
	}

	function pauseTimer() {
		if (!isRunning) return;
		isRunning = false;

		// Immediately set tween's target to its current value to pause animation
		const currentValue = tween.current;
		tween.set(currentValue, { duration: 0 });
	}

	function resumeTimer() {
		if (isRunning) return;
		isRunning = true;

		// Calculate remaining duration based on current progress
		const remainingDuration = tween.current * duration;

		// Continue animation to target (0)
		tween.set(0, {
			duration: remainingDuration,
			easing: linear
		});
	}

	function resetTimer() {
		isRunning = false;

		// Reset immediately to full
		tween.set(1, { duration: 0 });
	}

	onMount(() => {
		if (!pause) {
		}

		return () => {
			isRunning = false;
		};
	});
</script>

<label for="ajastin" class="timer-label">Aikaa vastata:</label>
<progress id="ajastin" class="timer-progress" value={tween.current}></progress>
<div class="timer-time">{(remaining / 1000).toFixed(1)}s</div>

<style>
	.timer-label {
		font-size: 1rem;
		font-weight: 600;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.timer-progress {
		width: 150%;
		height: 5px;
		border-radius: 5px;
		accent-color: #7b1e1e;
		border: 1px solid #c8b8ae;
	}

	/* Webkit-selaimille (Chrome, Safari) */
	.timer-progress::-webkit-progress-bar {
		background-color: #f5f0ec;
		border-radius: 5px;
	}

	.timer-progress::-webkit-progress-value {
		background-color: #7b1e1e;
		border-radius: 5px;
		transition: width 0.1s linear;
	}

	/* Firefoxille */
	.timer-progress::-moz-progress-bar {
		background-color: #7b1e1e;
		border-radius: 5px;
		transition: width 0.1s linear;
	}

	.timer-time {
		font-size: 1.2rem;
		font-weight: 700;
		color: #7b1e1e;
	}
</style>
