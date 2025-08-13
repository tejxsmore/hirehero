<script lang="ts">
	const { employer, jobs, applications } = $props();

	import { Plus, Search } from '@lucide/svelte';
	let search = $state(false);
	let searchInputRef: HTMLInputElement;

	function closeSearch() {
		search = false;
	}

	$effect(() => {
		if (search && searchInputRef) {
			searchInputRef.focus();
		}
	});
</script>

<nav class="relative z-10">
	<div class="flex items-center justify-between border border-[#EAE9E9] bg-white p-4.5">
		<div class="flex items-center gap-3 text-xl font-normal">
			<div><a href="/" class="font-semibold">Hirehero</a></div>
			<p class="text-[#57564F]">/</p>
			<p class="truncate text-[#57564F]">
				{employer.companyName.length > 10
					? employer.companyName.slice(0, 10) + '..'
					: employer.companyName}
			</p>
		</div>
		<div class="flex items-center gap-4.5">
			<button
				onclick={() => (search = true)}
				class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#EAE9E9] p-[11px] transition-colors duration-300 hover:bg-[#EAE9E9] lg:px-4.5 lg:py-1.5"
			>
				<Search size="14" />
				<span class="hidden lg:inline">Search</span>
			</button>
			<div>
				<a
					href="/employer/post-job"
					class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#323232] bg-[#212121] p-[11px] text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232] lg:px-4.5 lg:py-1.5"
				>
					<Plus size="14" class="flex-shrink-0" />
					<span class="hidden lg:inline">Post Job</span>
				</a>
			</div>
		</div>
	</div>
</nav>

{#if search}
	<div
		role="button"
		aria-label="Close search"
		tabindex="0"
		class="fixed inset-0 z-20 bg-black/60 transition-opacity"
		onclick={closeSearch}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				closeSearch();
			}
		}}
	></div>
{/if}

<div
	class="absolute left-1/2 z-30 w-full max-w-lg -translate-x-1/2
         p-4.5 transition-all duration-300 ease-in-out
         {search
		? 'pointer-events-auto top-18 opacity-100'
		: 'pointer-events-none top-0 opacity-0'}"
>
	<input
		type="text"
		name="search"
		placeholder="Search candidates"
		bind:this={searchInputRef}
		class="w-full resize-none rounded-[15px] border
		border-[#EAE9E9] bg-white px-4.5 py-3
		placeholder:text-[#57564F] focus:outline-none"
		onkeydown={(e) => {
			if (e.key === 'Escape') closeSearch();
		}}
	/>
</div>
