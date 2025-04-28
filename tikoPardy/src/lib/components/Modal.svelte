<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let { header, children, footer }: Props = $props();

	import { fly } from 'svelte/transition';
</script>

<div class="backdrop">
	<div class="modal" transition:fly={{ y: -300, delay: 50, duration: 500 }}>
		<header>
			{@render header?.()}
		</header>

		{@render children()}

		<footer>
			{@render footer?.()}
		</footer>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background: rgba(0, 0, 0, 0.75);
		z-index: 10;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.modal {
		padding: 1.5rem;
		position: fixed;
		background-color: #F5F5F5;
		border-radius: 0.5rem;
		width: 90%;
		max-width: 600px;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
		z-index: 100;
		color: black;
	}
</style>
