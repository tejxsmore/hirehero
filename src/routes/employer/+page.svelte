<script lang="ts">
	const { data } = $props();
	const { employerProfile, hasEmployerProfile, jobsPosted, applications } = data;
	import { goto } from '$app/navigation';

	import { userStore } from '$lib/stores/user.js';

	import DashNavbar from '$lib/components/nav/DashNavbar.svelte';
	import Dashboard from '$lib/components/employer/Dashboard.svelte';
	import Navbar from '$lib/components/nav/Navbar.svelte';

	if (!$userStore) {
		goto('/login');
	}
	let isChecked = $state(false);
</script>

<div class="min-h-screen">
	{#if hasEmployerProfile}
		<DashNavbar employer={employerProfile} jobs={jobsPosted} {applications} />
		<Dashboard employer={employerProfile} jobs={jobsPosted} {applications} />
	{:else}
		<Navbar />
		<div class="flex w-full justify-center p-4.5 lg:px-20 xl:px-40">
			<div class="w-full max-w-xl space-y-12">
				<div class="space-y-3 py-9 text-center">
					<p class="text-xl font-semibold">Join as an Employer</p>
					<p class="text-[#7A7A73]">Connect with top talent and grow your team</p>
				</div>
				<form method="post" action="?/register" class="space-y-12">
					<div class="space-y-3">
						<h2 class="pb-3 text-center font-semibold">Company Information</h2>
						<input
							type="text"
							name="name"
							id="name"
							placeholder="Company name"
							required
							class="w-full resize-none rounded-[12px] border
						border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<input
							type="text"
							name="industry"
							id="industry"
							required
							placeholder="Industry"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<textarea
							name="description"
							id="description"
							rows="4"
							required
							placeholder="Description / Mission"
							class="w-full resize-none rounded-[12px] border
						border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						></textarea>

						<input
							type="url"
							name="website"
							id="website"
							placeholder="Website"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<input
							type="text"
							name="location"
							id="location"
							required
							placeholder="Address"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
					</div>

					<div class="space-y-3">
						<h2 class="pb-3 text-center font-semibold">Verification</h2>
						<input
							type="text"
							name="registrationNumber"
							id="registrationNumber"
							required
							placeholder="Registration Number"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
						<input
							type="text"
							name="verificationDoc"
							id="verificationDoc"
							required
							placeholder="Verification Document URL"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
					</div>

					<div class="space-y-3">
						<h2 class="pb-3 text-center font-semibold">Contact Information</h2>
						<input
							type="text"
							name="representativeName"
							id="representativeName"
							required
							placeholder="Representative Name"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<input
							type="text"
							name="representativeTitle"
							id="representativeTitle"
							required
							placeholder="Representative Title"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<input
							type="email"
							name="email"
							id="email"
							required
							placeholder="Email"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>

						<input
							type="tel"
							name="phone"
							id="phone"
							required
							placeholder="Phone"
							class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
					</div>

					<div class="flex items-center gap-3">
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
								class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-md border transition-all duration-300 ease-in-out {isChecked
									? 'border-[#323232] bg-[#212121] shadow-sm'
									: 'border-[#D4D7DD] hover:border-[#323232] hover:shadow-sm'}"
							>
								{#if isChecked}
									<svg
										class="h-3 w-3 text-[#F6F6F6]"
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

						<label for="terms" class="cursor-pointer text-sm leading-relaxed text-[#7A7A73]">
							I agree to the
							<a
								href="/terms"
								class="font-medium text-[#323232] transition-colors duration-300 hover:underline"
							>
								Terms of Service
							</a>
							and
							<a
								href="/privacy"
								class="font-medium text-[#323232] transition-colors duration-300 hover:underline"
							>
								Privacy Policy
							</a>
						</label>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
					>
						Create Employer Profile
					</button>
				</form>

				<!-- Help Text -->
				<div class="space-y-3 pt-3 pb-6 text-sm text-[#7A7A73]">
					<h3 class="font-medium text-[#323232]">Need Help?</h3>
					<p class="">
						Contact our support team at <a
							href="mailto:support@hirehero.com"
							class="font-medium text-[#323232] hover:underline">support@hirehero.com</a
						>
						or check our
						<a href="/help" class="font-medium text-[#323232] hover:underline">help center</a> for more
						information.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
