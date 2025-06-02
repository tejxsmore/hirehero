<script lang="ts">
	import { userStore } from '$lib/stores/user';

	let mobileMenu = $state(false);
</script>

<nav class="relative bg-white">
	<div class="flex items-center justify-between p-4 text-gray-800">
		<div class="flex">
			<a href="/" class="text-2xl font-bold"> Hirehero</a>
		</div>

		<div class="hidden gap-8 md:flex">
			<a href="/jobs" class="transition-colors hover:text-[#6256CA]">Jobs</a>
			<a href="/jobs/companies" class="transition-colors hover:text-[#6256CA]">Companies</a>
			<a href="/jobs/salary" class="transition-colors hover:text-[#6256CA]">Salary</a>
			<a href="/jobs/resources" class="transition-colors hover:text-[#6256CA]">Resources</a>
		</div>

		<div class="hidden items-center gap-8 md:flex">
			{#if $userStore}
				<a
					href="/employer"
					class="cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#5C2FC2]"
					>Employer</a
				>
			{:else}
				<a
					href="/sign-in"
					class="cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#5C2FC2]"
					>Sign In</a
				>
			{/if}
		</div>

		<!-- Mobile Menu Button with Animated SVG -->
		<button
			onclick={() => (mobileMenu = !mobileMenu)}
			class="cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-100 focus:outline-none md:hidden"
			aria-label="Toggle mobile menu"
		>
			<svg
				class="h-6 w-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<!-- Top line -->
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16"
					style="transform-origin: 12px 6px"
					class="transition-transform duration-300 ease-in-out {mobileMenu
						? 'translate-y-1.5 rotate-45'
						: 'translate-y-0 rotate-0'}"
				/>
				<!-- Middle line -->
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 12h16"
					class="transition-opacity duration-300 ease-in-out {mobileMenu
						? 'opacity-0'
						: 'opacity-100'}"
				/>
				<!-- Bottom line -->
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 18h16"
					style="transform-origin: 12px 18px"
					class="transition-transform duration-300 ease-in-out {mobileMenu
						? '-translate-y-1.5 -rotate-45'
						: 'translate-y-0 rotate-0'}"
				/>
			</svg>
		</button>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if mobileMenu}
		<div
			class="animate-in slide-in-from-top-4 absolute top-full right-0 left-0 z-50 bg-white shadow-lg duration-300 ease-out md:hidden"
		>
			<div class="flex flex-col space-y-4 p-4">
				<!-- Mobile Navigation Links -->
				<a href="/jobs" onclick={() => (mobileMenu = false)} class=""> Jobs </a>
				<a href="/jobs/companies" onclick={() => (mobileMenu = false)} class=""> Companies </a>
				<a href="/jobs/salary" onclick={() => (mobileMenu = false)} class=""> Salary </a>
				<a href="/jobs/resources" onclick={() => (mobileMenu = false)} class=""> Resources </a>

				<!-- Mobile User Actions -->
				<div class="">
					{#if $userStore}
						<a
							onclick={() => (mobileMenu = false)}
							href="/employer"
							class="block w-full cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] px-4 py-2 text-center text-white transition-colors duration-200
							hover:bg-[#5C2FC2]">Employer</a
						>
					{:else}
						<a
							onclick={() => (mobileMenu = false)}
							href="/sign-in"
							class="block w-full cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] px-4 py-2 text-center text-white transition-colors duration-200
							hover:bg-[#5C2FC2]"
						>
							Sign In
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</nav>
