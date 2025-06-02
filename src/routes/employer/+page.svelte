<script lang="ts">
	import { AtSign, Globe, Mail, Building2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	const { data } = $props();
	const { employerProfile, hasEmployerProfile } = data;
	console.log(employerProfile);

	import { userStore } from '$lib/stores/user.js';
	if (!$userStore) {
		goto('/sign-in');
	}
</script>

<div class="flex p-4">
	{#if hasEmployerProfile}
		<div></div>
	{:else}
		<div class="w-full space-y-8">
			<h2 class="">Register as an Employer</h2>
			<form method="post" action="?/register" class="space-y-4">
				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<Building2 class="mr-4 h-4 w-4 text-gray-400" />
					<input
						type="text"
						name="name"
						placeholder="Company name"
						class="w-full bg-transparent focus:outline-none"
					/>
				</div>

				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<textarea
						name="description"
						rows="4"
						required
						placeholder="Company description"
						class="w-full resize-none bg-transparent focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<Globe class="mr-4 h-4 w-4 text-gray-400" />
					<input
						type="url"
						name="website"
						placeholder="Company website"
						class="w-full bg-transparent focus:outline-none"
					/>
				</div>

				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<Mail class="mr-4 h-4 w-4 text-gray-400" />
					<input
						type="email"
						name="email"
						required
						placeholder="Contact email"
						class="w-full bg-transparent focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] p-2 text-white transition-colors duration-200 hover:bg-[#5C2FC2]"
				>
					Submit
				</button>
			</form>
		</div>
	{/if}
</div>
