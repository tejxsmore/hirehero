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
</script>

<div class="flex min-h-screen bg-gray-50 text-[#343131]">
	{#if hasEmployerProfile}
		<Dashboard employer={employerProfile} />
	{:else}
		<div class="flex w-full justify-center">
			<div class="w-full max-w-lg space-y-10 p-5">
				<div class="space-y-2.5 py-5 text-center">
					<p class="text-xl font-semibold">Join as an Employer</p>
					<p class="text-gray-400">Connect with top talent and grow your team</p>
				</div>

				<!-- Registration Form -->
				<form method="post" action="?/register" class="space-y-8">
					<!-- Company Name -->
					<div class="space-y-1">
						<label for="name" class="block text-sm"> Company Name * </label>
						<div
							class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-5 py-2 text-[#343131] focus-within:ring-2 focus-within:ring-[#D0DDD0]"
						>
							<Building2 class="mr-5 h-4 w-4 " />
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
						<label for="description" class="block text-sm"> Company Description * </label>
						<div
							class="flex resize-none items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-5 py-2 text-[#343131] focus-within:ring-2 focus-within:ring-[#D0DDD0]"
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
						<p class="text-xs text-gray-400">Minimum 50 characters recommended</p>
					</div>

					<!-- Company Website -->
					<div class="space-y-1">
						<label for="website" class="block text-sm"> Company Website </label>
						<div
							class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-5 py-2 text-[#343131] focus-within:ring-2 focus-within:ring-[#D0DDD0]"
						>
							<Globe class="mr-5 h-4 w-4" />
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
						<label for="email" class="block text-sm"> Contact Email * </label>
						<div
							class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-5 py-2 text-[#343131] focus-within:ring-2 focus-within:ring-[#D0DDD0]"
						>
							<Mail class="mr-5 h-4 w-4" />
							<input
								type="email"
								name="email"
								id="email"
								required
								placeholder="hr@yourcompany.com"
								class="w-full bg-transparent focus:outline-none"
							/>
						</div>
						<p class="text-xs text-gray-500">This will be used for candidate communications</p>
					</div>

					<!-- Location -->
					<div class="space-y-1">
						<label for="location" class="block text-sm"> Location </label>
						<div
							class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-5 py-2 text-[#343131] focus-within:ring-2 focus-within:ring-[#D0DDD0]"
						>
							<MapPin class="mr-5 h-4 w-4 " />
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

					<!-- Terms and Conditions -->
					<div class="flex items-start space-x-2.5">
						<input
							type="checkbox"
							name="terms"
							id="terms"
							required
							class="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF4C29] focus:ring-[#FF4C29]"
						/>
						<label for="terms" class="text-sm text-gray-600">
							I agree to the <a href="/terms" class="text-[#FF4C29] hover:underline"
								>Terms of Service</a
							>
							and
							<a href="/privacy" class="text-[#FF4C29] hover:underline">Privacy Policy</a>
						</label>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full cursor-pointer rounded-full border border-[#E6521F] bg-[#FF4C29] px-5 py-2 font-medium text-white transition-all duration-100 hover:bg-[#EA2F14] focus:outline-none"
					>
						Create Employer Profile
					</button>
				</form>

				<!-- Help Text -->
				<div class="mt-5">
					<h3 class="mb-2.5 text-sm font-medium text-gray-700">Need Help?</h3>
					<p class="text-xs text-gray-600">
						Contact our support team at <a
							href="mailto:support@hirehero.com"
							class="text-[#FF4C29] hover:underline">support@hirehero.com</a
						>
						or check our <a href="/help" class="text-[#FF4C29] hover:underline">help center</a> for more
						information.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
