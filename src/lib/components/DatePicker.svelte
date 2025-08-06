<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	// Props
	interface Props {
		value?: string; // YYYY-MM format
		placeholder?: string;
		disabled?: boolean;
		name?: string;
	}

	let { value = $bindable(''), placeholder = '', disabled = false, name = '' }: Props = $props();

	// State using runes
	let showPicker = $state(false);
	let pickerElement = $state<HTMLDivElement>();

	// Initialize with current date or provided value
	const initialDate = value ? new Date(value + '-01') : new Date();
	let currentYear = $state(initialDate.getFullYear());
	let currentMonthIndex = $state(initialDate.getMonth()); // 0-11

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	// Format the displayed value for the input field
	const formattedValue = $derived(() => {
		if (!value) return '';
		try {
			return new Date(value + '-01').toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short'
			});
		} catch {
			return '';
		}
	});

	// Handle month selection - Fixed the issue
	function handleMonthSelect(monthIndex: number) {
		// Create date using the selected year and month
		const selectedDate = new Date(currentYear, monthIndex, 1);

		// Format as YYYY-MM
		const year = selectedDate.getFullYear();
		const month = String(selectedDate.getMonth() + 1).padStart(2, '0');

		value = `${year}-${month}`;
		showPicker = false;
	}

	// Handle year navigation
	function handleYearChange(direction: 'prev' | 'next') {
		if (direction === 'prev') {
			currentYear -= 1;
		} else {
			currentYear += 1;
		}
	}

	// Handle click outside to close the picker
	function handleClickOutside(event: MouseEvent) {
		if (pickerElement && !pickerElement.contains(event.target as Node)) {
			showPicker = false;
		}
	}

	// Add and remove event listeners
	onMount(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});

	// Check if a month is the currently selected one - Fixed comparison
	function isSelectedMonth(year: number, monthIndex: number): boolean {
		if (!value) return false;

		try {
			// Parse the current value (YYYY-MM format)
			const [valueYear, valueMonth] = value.split('-').map(Number);

			// Compare year and month (valueMonth is 1-12, monthIndex is 0-11)
			return valueYear === year && valueMonth - 1 === monthIndex;
		} catch {
			return false;
		}
	}
</script>

<div class="relative" bind:this={pickerElement}>
	<input
		{name}
		{placeholder}
		value={formattedValue()}
		readonly
		onclick={() => !disabled && (showPicker = true)}
		class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none {disabled
			? 'cursor-not-allowed opacity-50'
			: 'cursor-pointer'}"
		{disabled}
	/>

	<!-- Hidden input to store the actual value for form submission -->
	<input type="hidden" {name} {value} />

	{#if showPicker}
		<div
			class="absolute z-10 mt-1 w-64 rounded-[15px] border border-[#D4D7DD] bg-white p-4.5 shadow-lg"
		>
			<div class="mb-4 flex items-center justify-between">
				<button
					type="button"
					onclick={() => handleYearChange('prev')}
					class="cursor-pointer rounded-[9px] p-1 transition-colors duration-300 hover:bg-[#f2f2f2]"
				>
					<ChevronLeft size="16" />
				</button>
				<span class="text-lg font-semibold">{currentYear}</span>
				<button
					type="button"
					onclick={() => handleYearChange('next')}
					class="cursor-pointer rounded-[9px] p-1 transition-colors duration-300 hover:bg-[#f2f2f2]"
				>
					<ChevronRight size="16" />
				</button>
			</div>

			<div class="grid grid-cols-3 gap-3">
				{#each months as month, index}
					<button
						type="button"
						class="w-full cursor-pointer rounded-[12px] py-1.5 transition-all duration-300 {isSelectedMonth(
							currentYear,
							index
						)
							? 'bg-[#212121] text-[#F6F6F6]'
							: 'hover:bg-[#f2f2f2]'}"
						onclick={() => handleMonthSelect(index)}
					>
						{month}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
