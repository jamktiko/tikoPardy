<script lang="ts">
	// original code: https://svelte.dev/playground/7guis-timer?version=5.28.2#H4sIAAAAAAAACn1TwY6bMBD9FdettKAukFSqKrGAtJe97a23UlUGhsSKsV17nE2F-PfaEEIbVb1ge-bNe2_GZqSSDUBz-pUPYEgEHUfoYvpIey7A0vzbSPGXDogQ8PEr_lnr1J5BYIg1zMK_4q2SCBI9DS3eJQk5ImqbZxm4A8gTtzY9cDy6JuUq-3Jw3GbI7Mm-x9lMklS1rGVhW8M1hr2Pa2WQjETJV-Ukkon0Rg3kYZF8eAoFNQpAAoJpCx0pyQeLDCHaxU9rrnOGIVdyS37e7Za8R1y5oygmZUXGEFrKBLP4I3jzdRpMr8zAZAupVG_RWrwge8NmlIGfDiw-Sz7Mgi8hHvVOtrO8010QD5TxKlTj_4uXmk2uxrXTjyV5ZXhMBy5nSpJsjh-3npN1NMs8Zst_NBaWa2LaVAygM5L8NZIa29C-uO8ufFfuaV5noiLbLlIWgjUg5jtd7QfhPAQKbdTBgLXkzISDclwR2a2JqSqyFVUF6hudLDp-rsZoq9mHq01RvfALdNE-nmyRBcydjZV6scCldkjCyy9rapg8QE1Jw2WXXz3dnBA_bo_Z-_zALn73yevt_Cm7N9Y49G_LP91W8PZUjsswo-2h7uKp8h0BFtmC9XX-L0K4IM3ROJi--xPj4s0boXnPhIXpNwD2aS7CAwAA

	import { onMount } from 'svelte';

	let { duration } = $props(); // Duration is passed as a prop
	let remaining = $state(duration); // Remaining time starts at the full duration

	onMount(() => {
		let last_time = performance.now();

		let frame = requestAnimationFrame(function update(time) {
			frame = requestAnimationFrame(update);

			// Decrease the remaining time
			remaining = Math.max(remaining - (time - last_time), 0);
			last_time = time;

			// Stop the animation when the countdown reaches 0
			if (remaining <= 0) {
				cancelAnimationFrame(frame);
			}
		});

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
