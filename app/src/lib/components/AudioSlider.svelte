<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	interface Props {
		setVolume: number;
		Mplay: boolean;
		audioSrc: string;
	}

	let { setVolume, Mplay, audioSrc }: Props = $props();
	
	// Create event dispatcher
	const dispatch = createEventDispatcher();
	
	// Function to handle volume changes
	function handleVolumeChange() {
		dispatch('volumechange', { volume: setVolume });
	}
</script>

<audio autoplay loop bind:volume={setVolume} bind:paused={Mplay}>
	<source src={audioSrc} />
	Your browser doesn't support the audio.
</audio>

<input 
	type="range" 
	min="0" 
	max="1" 
	step="0.01" 
	bind:value={setVolume} 
	oninput={handleVolumeChange}
/>

<style>
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background-color: #f5f0ec;
		cursor: pointer;
		width: 7.5rem;
	}

	input[type='range']:focus {
		outline: none;
	}

	input[type='range']::-webkit-slider-runnable-track {
		background-color: #872121;
		border-radius: 0.5rem;
		height: 0.5rem;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		margin-top: -4px;
		background-color: #6f6f6f;
		border-radius: 0.5rem;
		height: 1rem;
		width: 1rem;
	}

	input[type='range']:focus::-webkit-slider-thumb {
		outline: 3px solid #6f6f6f;
		outline-offset: 0.125rem;
	}

	input[type='range']::-moz-range-track {
		background-color: #872121;
		border-radius: 0.5rem;
		height: 0.5rem;
	}

	input[type='range']::-moz-range-thumb {
		background-color: #aeaeae;
		border: none;
		border-radius: 0.5rem;
		height: 1rem;
		width: 1rem;
	}

	input[type='range']:focus::-moz-range-thumb {
		outline: 3px solid #aeaeae;
		outline-offset: 0.125rem;
	}
</style>
