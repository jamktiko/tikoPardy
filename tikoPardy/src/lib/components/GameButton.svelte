<script lang="ts">
type ButtonType = 'primary' | 'secondary' | 'retry' | 'main';

interface Props {
	text: string;
	onclick: () => void;
	disabled?: boolean;
	type?: ButtonType;
}

let { type = 'primary', text, onclick, disabled = false }: Props = $props();
</script>

<button class={`btn ${type}`} {onclick} {disabled}>{text}</button>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

.btn {
	width: 75%;
	max-width: 500px;
	min-width: 200px;
	white-space: normal;
	text-align: center;
	padding: 1.2rem 1.8rem;
	font-family: 'Cascadia Mono', sans-serif;
	font-size: 1.4rem;
	border: none;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: transform 0.2s, background-color 0.2s;
	font-weight: bold;
}

.btn:hover {
	transform: scale(1.05);
}

/* Types */
.btn.primary {
	background-color: #7b1e1e;
	color: white;
}
.btn.primary:hover {
	background: #9a2929;
}

.btn.retry {
	background-color: #7b1e1e;
	color: white;
}
.btn.retry:hover {
	background-color: #9a2929;
	transform: translateY(-2px);
	box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.btn.main {
	background-color: white;
	color: #7b1e1e;
	border: 2px solid #7b1e1e;
}
.btn.main:hover {
	background-color: #f5f0ec;
	transform: translateY(-2px);
	box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive styles */
@media (max-width: 768px) {
	.btn {
		font-size: 1.2rem;
		padding: 1rem 1.4rem;
		width: 85%;
	}
}

@media (max-width: 480px) {
	.btn {
		font-size: 1rem;
		padding: 0.8rem 1.2rem;
		width: 90%;
	}
}
</style>
