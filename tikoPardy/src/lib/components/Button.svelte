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
	button {
		padding: 0.8rem 1.5rem;
		font-size: 1.2rem;
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
		background-color: #ffcc00;
		color: #000;
	}

	.primary:hover {
		background-color: #ffdd33;
	}

	.secondary {
		background-color: #3355ff;
		color: white;
	}

	.secondary:hover {
		background-color: #4466ff;
	}
</style>
