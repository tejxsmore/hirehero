<script lang="ts">
	import { Mail, Globe, Building2, Users, MapPin, AlertCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	const { data } = $props();
	const { employerProfile, hasEmployerProfile } = data;

	import { userStore } from '$lib/stores/user.js';
	import Dashboard from './Dashboard.svelte';
	if (!$userStore) {
		goto('/sign-in');
	}
	let isChecked = $state(false);
</script>

<div class="flex min-h-screen bg-gray-50">
	{#if hasEmployerProfile}
		<Dashboard employer={employerProfile} />
	{:else}
		<div class="flex w-full justify-center">
			<div class="w-full max-w-lg space-y-10 p-5">
				<div class="space-y-2.5 py-5 text-center">
					<p class="text-xl font-semibold">Join as an Employer</p>
					<p class="text-gray-400">Connect with top talent and grow your team</p>
				</div>

				<form method="post" action="?/register" class="space-y-10">
					<div class="space-y-1">
						<label for="name" class="block text-sm font-medium text-gray-700">
							Company Name <span class="text-[#FF4C29]">*</span></label
						>
						<div
							class="flex items-center rounded-[10px] border border-[#DDDDDD] bg-[#EEEEEE] px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#DDDDDD]"
						>
							<Building2 class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="text"
								name="name"
								id="name"
								placeholder="Enter your company name"
								required
								class="w-full bg-transparent focus:outline-none"
							/>
						</div>
					</div>

					<!-- Company Description -->
					<div class="space-y-1">
						<label for="description" class="block text-sm font-medium text-gray-700">
							Company Description <span class="text-[#FF4C29]">*</span>
						</label>
						<div
							class="flex resize-none items-center rounded-[10px] border border-[#DDDDDD] bg-[#EEEEEE] px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#DDDDDD]"
						>
							<textarea
								name="description"
								id="description"
								rows="4"
								required
								placeholder="Tell us about your company, mission, and what makes you unique..."
								class="w-full resize-none bg-transparent placeholder:text-gray-400 focus:outline-none"
							></textarea>
						</div>
						<p class="text-xs tracking-wide text-gray-400">Minimum 50 characters recommended</p>
					</div>

					<!-- Company Website -->
					<div class="space-y-1">
						<label for="website" class="block text-sm font-medium text-gray-700">
							Company Website
						</label>
						<div
							class="flex items-center rounded-[10px] border border-[#DDDDDD] bg-[#EEEEEE] px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#DDDDDD]"
						>
							<Globe class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="url"
								name="website"
								id="website"
								placeholder="https://www.yourcompany.com"
								class="w-full focus:outline-none"
							/>
						</div>
					</div>

					<!-- Contact Email -->
					<div class="space-y-1">
						<label for="email" class="block text-sm font-medium text-gray-700">
							Contact Email
							<span class="text-[#FF4C29]">*</span>
						</label>
						<div
							class="flex items-center rounded-[10px] border border-[#DDDDDD] bg-[#EEEEEE] px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#DDDDDD]"
						>
							<Mail class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="email"
								name="email"
								id="email"
								required
								placeholder="hr@yourcompany.com"
								class="w-full bg-transparent focus:outline-none"
							/>
						</div>
						<p class="text-xs tracking-wide text-gray-400">
							This will be used for candidate communications
						</p>
					</div>

					<!-- Location -->
					<div class="space-y-1">
						<label for="location" class="block text-sm font-medium text-gray-700">
							Location <span class="text-[#FF4C29]">*</span></label
						>
						<div
							class="flex items-center rounded-[10px] border border-[#DDDDDD] bg-[#EEEEEE] px-5 py-2.5 focus-within:ring-2 focus-within:ring-[#DDDDDD]"
						>
							<MapPin class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="text"
								name="location"
								id="location"
								required
								placeholder="City, Country"
								class="w-full bg-transparent focus:outline-none"
							/>
						</div>
					</div>

					<div class="flex items-center gap-5">
						<div class="relative mt-0.5 flex-shrink-0">
							<input
								type="checkbox"
								name="terms"
								id="terms"
								required
								bind:checked={isChecked}
								class="sr-only"
							/>
							<label
								for="terms"
								class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200 ease-in-out {isChecked
									? 'border-[#FF4C29] bg-[#FF4C29] shadow-md'
									: 'border-gray-300 bg-white hover:border-[#FF4C29] hover:shadow-sm'}"
							>
								{#if isChecked}
									<svg
										class="h-3 w-3 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width={3}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{/if}
							</label>
						</div>

						<label for="terms" class="cursor-pointer text-sm leading-relaxed text-gray-700">
							I agree to the
							<a
								href="/terms"
								class="font-medium text-[#FF4C29] transition-colors duration-200 hover:text-[#e63e26] hover:underline"
							>
								Terms of Service
							</a>
							and
							<a
								href="/privacy"
								class="font-medium text-[#FF4C29] transition-colors duration-200 hover:text-[#e63e26] hover:underline"
							>
								Privacy Policy
							</a>
						</label>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full cursor-pointer rounded-full border border-[#E6521F] bg-[#FF4C29] px-5 py-2.5 font-medium text-white transition-all duration-100 hover:bg-[#EA2F14] focus:outline-none"
					>
						Create Employer Profile
					</button>
				</form>

				<!-- Help Text -->
				<div class="mt-5 text-sm">
					<h3 class="mb-2.5 font-medium text-gray-700">Need Help?</h3>
					<p class="text-gray-700">
						Contact our support team at <a
							href="mailto:support@hirehero.com"
							class="font-medium text-[#FF4C29] hover:underline">support@hirehero.com</a
						>
						or check our
						<a href="/help" class="font-medium text-[#FF4C29] hover:underline">help center</a> for more
						information.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
