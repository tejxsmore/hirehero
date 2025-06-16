<script lang="ts">
	import { Mail, Globe, Building2, MapPin, AlertCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	const { data } = $props();
	const { employerProfile, hasEmployerProfile, jobsPosted, applications } = data;

	import { userStore } from '$lib/stores/user.js';
	import Dashboard from './Dashboard.svelte';
	if (!$userStore) {
		goto('/sign-in');
	}
	let isChecked = $state(false);
</script>

<div class="flex min-h-screen bg-black">
	{#if hasEmployerProfile}
		<Dashboard employer={employerProfile} jobs={jobsPosted} {applications} />
	{:else}
		<div class="flex w-full justify-center p-5">
			<div
				class="w-full max-w-md space-y-10 rounded-[15px] border border-[#272829] bg-[#0f0f0f] p-5"
			>
				<div class="space-y-2.5 py-5 text-center">
					<p class="text-xl font-semibold">Join as an Employer</p>
					<p class="text-[#6c757d]">Connect with top talent and grow your team</p>
				</div>
				<form method="post" action="?/register" class="space-y-10">
					<div class="space-y-1">
						<label for="name" class="block text-sm font-medium text-[#6c757d]">
							Company Name <span class="text-[#00FFAB]">*</span></label
						>
						<div
							class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
						>
							<Building2 class="mr-5 h-4 w-4 text-[#454545]" />
							<input
								type="text"
								name="name"
								id="name"
								placeholder="Enter your company name"
								required
								class="w-full bg-transparent placeholder:text-[#454545] focus:outline-none"
							/>
						</div>
					</div>

					<!-- Company Description -->
					<div class="space-y-1">
						<label for="description" class="block text-sm font-medium text-[#6c757d]">
							Company Description <span class="text-[#00FFAB]">*</span>
						</label>
						<div
							class="flex resize-none items-center rounded-[10px] border border-[#272829] bg-[#191919] p-5"
						>
							<textarea
								name="description"
								id="description"
								rows="4"
								required
								placeholder="Tell us about your company, mission, and what makes you unique..."
								class="w-full resize-none bg-transparent placeholder:text-[#454545] focus:outline-none"
							></textarea>
						</div>
						<p class="text-xs tracking-wide text-[#454545]">Minimum 50 characters recommended</p>
					</div>

					<!-- Company Website -->
					<div class="space-y-1">
						<label for="website" class="block text-sm font-medium text-[#6c757d]">
							Company Website
						</label>
						<div
							class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
						>
							<Globe class="mr-5 h-4 w-4 text-[#454545]" />
							<input
								type="url"
								name="website"
								id="website"
								placeholder="https://www.yourcompany.com"
								class="w-full placeholder:text-[#454545] focus:outline-none"
							/>
						</div>
					</div>

					<!-- Contact Email -->
					<div class="space-y-1">
						<label for="email" class="block text-sm font-medium text-[#6c757d]">
							Contact Email
							<span class="text-[#00FFAB]">*</span>
						</label>
						<div
							class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
						>
							<Mail class="mr-5 h-4 w-4 text-[#454545]" />
							<input
								type="email"
								name="email"
								id="email"
								required
								placeholder="hr@yourcompany.com"
								class="w-full bg-transparent placeholder:text-[#454545] focus:outline-none"
							/>
						</div>
						<p class="text-xs tracking-wide text-[#454545]">
							This will be used for candidate communications
						</p>
					</div>

					<!-- Location -->
					<div class="space-y-1">
						<label for="location" class="block text-sm font-medium text-[#6c757d]">
							Location <span class="text-[#00FFAB]">*</span></label
						>
						<div
							class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
						>
							<MapPin class="mr-5 h-4 w-4 text-[#454545]" />
							<input
								type="text"
								name="location"
								id="location"
								required
								placeholder="City, Country"
								class="w-full bg-transparent placeholder:text-[#454545] focus:outline-none"
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
									? 'border-[#14C38E] bg-[#00FFAB] shadow-md'
									: 'border-[#272829] bg-[#0f0f0f] hover:border-[#14C38E] hover:shadow-sm'}"
							>
								{#if isChecked}
									<svg
										class="h-3 w-3 text-[#0f0f0f]"
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

						<label for="terms" class="cursor-pointer text-sm leading-relaxed text-[#6c757d]">
							I agree to the
							<a
								href="/terms"
								class="font-medium text-[#00FFAB] transition-colors duration-200 hover:text-[#14C38E] hover:underline"
							>
								Terms of Service
							</a>
							and
							<a
								href="/privacy"
								class="font-medium text-[#00FFAB] transition-colors duration-200 hover:text-[#14C38E] hover:underline"
							>
								Privacy Policy
							</a>
						</label>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-5 py-2.5 font-medium text-[#0f0f0f] transition-all duration-100 hover:bg-[#15F5BA] focus:outline-none"
					>
						Create Employer Profile
					</button>
				</form>

				<!-- Help Text -->
				<div class="mt-5 text-sm">
					<h3 class="mb-2.5 font-medium text-[#6c757d]">Need Help?</h3>
					<p class="text-[#6c757d]">
						Contact our support team at <a
							href="mailto:support@hirehero.com"
							class="font-medium text-[#00FFAB] hover:underline">support@hirehero.com</a
						>
						or check our
						<a href="/help" class="font-medium text-[#00FFAB] hover:underline">help center</a> for more
						information.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
