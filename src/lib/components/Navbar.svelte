<script lang="ts">
	import { userStore } from '$lib/stores/user';
	import { page } from '$app/state';

	const activeTab = $derived.by(() => {
		if (page.url.pathname === '/') return 'home';
		if (page.url.pathname === '/jobs') return 'jobs';
		if (page.url.pathname === '/jobs/companies') return 'companies';
		if (page.url.pathname === '/jobs/salary') return 'salary';
		if (page.url.pathname === '/jobs/resources') return 'resources';

		return '';
	});

	let mobileMenu = $state(false);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		const nav = document.querySelector('nav');
		if (nav && !nav.contains(target)) {
			mobileMenu = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileMenu) {
			mobileMenu = false;
		}
	}

	$effect(() => {
		if (mobileMenu) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function closeMobileMenu() {
		mobileMenu = false;
	}
</script>

<nav class="relative">
	<div class="flex items-center justify-between p-4.5 lg:px-20 xl:px-40">
		<div class="flex items-center gap-4.5 lg:gap-9 xl:gap-18">
			<div class="flex focus:outline-none">
				<a href="/" class="mb-1 text-xl font-semibold">Hirehero</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden gap-1 rounded-[15px] border border-[#EAE9E9] bg-[#EAE9E9] p-1 md:flex">
				<a
					href="/jobs"
					class="rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab === 'jobs'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}">Jobs</a
				>
				<a
					href="/companies"
					class="rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'companies'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}">Companies</a
				>
				<a
					href="/salary"
					class="rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab === 'salary'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}">Salary</a
				>
				<a
					href="/resources"
					class="rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'resources'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}">Resources</a
				>
			</div>
		</div>

		<!-- Desktop User Actions -->
		<div class="hidden items-center md:flex">
			{#if $userStore}
				<div class="flex gap-4.5">
					<a
						href="/employer"
						class="cursor-pointer rounded-[12px] border border-[#EAE9E9] bg-transparent px-4.5 py-1.5 transition-colors duration-300 hover:bg-[#EAE9E9]"
					>
						Employer
					</a>
					<a
						href="/user/profile"
						class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
						>Profile</a
					>
				</div>
			{:else}
				<a
					href="/login"
					class="cursor-pointer rounded-[12px] border border-[#323232]
					bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
				>
					Login
				</a>
			{/if}
		</div>

		<!-- Mobile Menu Button -->
		<button
			onclick={() => (mobileMenu = !mobileMenu)}
			class="cursor-pointer transition-colors focus:outline-none md:hidden"
			aria-label="Toggle mobile menu"
			aria-expanded={mobileMenu}
		>
			<svg
				class="h-4 w-4"
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

	<!-- Mobile Menu Overlay with Slide Down Animation -->
	<div
		class="absolute top-full right-0 left-0 z-50 overflow-hidden border-b
		border-[#EAE9E9] bg-[#F6F6F6] shadow-sm transition-all duration-500
		ease-in-out md:hidden {mobileMenu
			? 'max-h-[500px] translate-y-0 opacity-100'
			: 'max-h-0 -translate-y-2 opacity-0'}"
		role="menu"
		aria-orientation="vertical"
	>
		<div class="space-y-4.5 p-4.5 pt-0 transition-all duration-500 ease-in-out">
			<div
				class="flex flex-col space-y-1 rounded-[15px] border
			border-[#EAE9E9] bg-[#EAE9E9] p-1 transition-all duration-300 ease-in-out"
			>
				<!-- Mobile Navigation Links -->
				<a
					href="/jobs"
					onclick={closeMobileMenu}
					class="block rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'jobs'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}"
					role="menuitem"
				>
					Jobs
				</a>
				<a
					href="/companies"
					onclick={closeMobileMenu}
					class="block rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'companies'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}"
					role="menuitem"
				>
					Companies
				</a>
				<a
					href="/salary"
					onclick={closeMobileMenu}
					class="block rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'salary'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}"
					role="menuitem"
				>
					Salary
				</a>
				<a
					href="/resources"
					onclick={closeMobileMenu}
					class="block rounded-[12px] px-4.5 py-1.5 transition-colors duration-300 {activeTab ===
					'resources'
						? 'bg-[#F6F6F6]'
						: 'hover:bg-[#F6F6F6]'}"
					role="menuitem"
				>
					Resources
				</a>
			</div>
			<!-- Mobile User Actions -->
			<div class="space-y-4.5">
				{#if $userStore}
					<a
						onclick={closeMobileMenu}
						href="/employer"
						class="block w-full cursor-pointer rounded-[12px] border border-[#EAE9E9] bg-transparent px-4.5 py-1.5 text-center transition-colors duration-300 hover:bg-[#EAE9E9]"
						role="menuitem"
					>
						Employer
					</a>
					<a
						onclick={closeMobileMenu}
						href="/user/profile"
						class="block w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
						role="menuitem">Profile</a
					>
				{:else}
					<a
						onclick={closeMobileMenu}
						href="/login"
						class="block w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
						role="menuitem"
					>
						Login
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
