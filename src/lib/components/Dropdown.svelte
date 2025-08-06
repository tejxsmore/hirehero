<script lang="ts">
	import { ChevronDown, Check, type Icon } from '@lucide/svelte';

	let {
		label,
		options,
		value = $bindable(), // Make value bindable
		placeholder,
		icon: IconComponent,
		name
	} = $props<{
		label: string;
		options: string[];
		value: string;
		placeholder: string;
		icon?: typeof Icon; // Optional Lucide icon component
		name: string;
	}>();

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;
	let listboxId = `listbox-${name}`; // Unique ID for the listbox

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectOption(option: string) {
		value = option; // Update the bound value
		isOpen = false;
	}

	// Close dropdown when clicking outside
	$effect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

<div class="relative" bind:this={dropdownRef}>
	<button
		type="button"
		id={name}
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-label={label.replace('*', '').trim()}
		aria-controls={listboxId}
		onclick={toggleDropdown}
		class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 transition-all duration-300 focus:outline-none"
	>
		<div class="flex items-center">
			{#if IconComponent}
				<IconComponent class="mr-2 h-4 w-4 text-gray-400" />
			{/if}
			<span class="w-full {value ? 'text-[#212121]' : 'text-[#57564F]'}">
				{value || placeholder}
			</span>
		</div>
		<ChevronDown
			class="ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 {isOpen
				? 'rotate-180'
				: ''}"
		/>
	</button>

	{#if isOpen}
		<ul
			id={listboxId}
			role="listbox"
			aria-labelledby={name}
			class="absolute z-10 mt-1 max-h-60 w-full space-y-1 overflow-auto rounded-[15px] border border-[#D4D7DD] bg-[#e8e8e8] p-1 shadow-xs focus:outline-none"
		>
			{#each options as option}
				<button
					type="button"
					role="option"
					aria-selected={value === option}
					onclick={() => selectOption(option)}
					class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-4.5 py-1.5 transition-all duration-300 hover:bg-[#DDDDDD] focus:outline-none {value ===
					option
						? 'bg-[#DDDDDD]'
						: ''}"
				>
					<span class="text-[#212121]">{option}</span>
					{#if value === option}
						<Check size="14" class="text-[#212121]" />
					{/if}
				</button>
			{/each}
		</ul>
	{/if}
	<!-- Hidden input to ensure value is submitted with the form -->
	<input type="hidden" {name} {value} />
</div>
