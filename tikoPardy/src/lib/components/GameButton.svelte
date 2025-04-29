<script lang="ts">
	interface Props {
		text: string;
		onclick: () => void;
		disabled?: boolean;
		type?: 'primary' | 'secondary';
	}

	let { type, text, onclick, disabled = false }: Props = $props();
</script>

<button class={type} {onclick} {disabled}>{text}</button>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

	button {
		padding: 1.2rem 1.9rem;
		font-family: 'Cascadia Mono', sans-serif;
		font-size: 1.4rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition:
			transform 0.2s,
			background-color 0.2s;
		font-weight: bold;
	}

	button:hover {
		transform: scale(1.05);
	}

	.primary {
		background-color: #7b1e1e; /* Dark Red */
		color: white;
	}

	.primary:hover {
		background-color: #5c1515; /* Darker Red on hover */
	}

	.secondary {
		background-color: #0ba4eb; /* Light Neutral */
		color: #000;
	}

	.secondary:hover {
		background-color: #888888; /* Slightly darker neutral */
	}
</style>
