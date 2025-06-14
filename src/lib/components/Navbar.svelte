<script lang="ts">
	import { userStore } from '$lib/stores/user';

	let mobileMenu = $state(false);

	// Close mobile menu when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		const nav = document.querySelector('nav');
		if (nav && !nav.contains(target)) {
			mobileMenu = false;
		}
	}

	// Close mobile menu on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileMenu) {
			mobileMenu = false;
		}
	}

	// Add/remove event listeners when mobile menu state changes
	$effect(() => {
		if (mobileMenu) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		}

		// Cleanup on component destroy
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
	<div class="flex items-center justify-between border-b border-[#272829] p-5">
		<div class="flex focus:outline-none">
			<a href="/" class="mb-1 text-2xl font-bold md:text-4xl">HiREHERO</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="hidden gap-10 md:flex">
			<a href="/jobs" class="transition-colors hover:text-[#00FFAB]">Jobs</a>
			<a href="/jobs/companies" class="transition-colors hover:text-[#00FFAB]">Companies</a>
			<a href="/jobs/salary" class="transition-colors hover:text-[#00FFAB]">Salary</a>
			<a href="/jobs/resources" class="transition-colors hover:text-[#00FFAB]">Resources</a>
		</div>

		<!-- Desktop User Actions -->
		<div class="hidden items-center md:flex">
			{#if $userStore}
				<a
					href="/employer"
					class="cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-7.5 py-2.5 font-medium text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
				>
					Employer
				</a>
			{:else}
				<a
					href="/sign-in"
					class="cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-7.5 py-2.5 font-medium text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
				>
					Sign In
				</a>
			{/if}
		</div>

		<!-- Mobile Menu Button -->
		<button
			onclick={() => (mobileMenu = !mobileMenu)}
			class="cursor-pointer rounded-[10px] transition-colors focus:outline-none md:hidden"
			aria-label="Toggle mobile menu"
			aria-expanded={mobileMenu}
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
			class="absolute top-full right-0 left-0 z-50 border-b border-[#272829] bg-[#0f0f0f] shadow-sm transition-all duration-300 ease-out md:hidden"
			role="menu"
			aria-orientation="vertical"
		>
			<div class="flex flex-col space-y-5 p-5">
				<!-- Mobile Navigation Links -->
				<a
					href="/jobs"
					onclick={closeMobileMenu}
					class="block py-2.5 transition-colors hover:text-[#00FFAB]"
					role="menuitem"
				>
					Jobs
				</a>
				<a
					href="/jobs/companies"
					onclick={closeMobileMenu}
					class="block py-2.5 transition-colors hover:text-[#00FFAB]"
					role="menuitem"
				>
					Companies
				</a>
				<a
					href="/jobs/salary"
					onclick={closeMobileMenu}
					class="block py-2.5 transition-colors hover:text-[#00FFAB]"
					role="menuitem"
				>
					Salary
				</a>
				<a
					href="/jobs/resources"
					onclick={closeMobileMenu}
					class="block py-2.5 transition-colors hover:text-[#00FFAB]"
					role="menuitem"
				>
					Resources
				</a>

				<!-- Mobile User Actions -->
				<div class="pt-2">
					{#if $userStore}
						<a
							onclick={closeMobileMenu}
							href="/employer"
							class="block w-full cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-7.5 py-2.5 text-center font-medium text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
							role="menuitem"
						>
							Employer
						</a>
					{:else}
						<a
							onclick={closeMobileMenu}
							href="/sign-in"
							class="block w-full cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-7.5 py-2.5 text-center font-medium text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
							role="menuitem"
						>
							Sign In
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</nav>
