<script lang="ts">
	const data = $props();
	const { form } = data;

	import SocialAuthButton from '$lib/components/auth/SocialAuthButton.svelte';
	import { Eye, EyeOff, ArrowLeft } from '@lucide/svelte';

	let showPassword = $state(false);
</script>

<div class="flex min-h-screen">
	<div class="flex w-full items-center justify-center p-4.5">
		<div class="w-full max-w-md space-y-12">
			<div class="space-y-1.5 text-center">
				<div><a href="/" class="text-xl font-semibold">Hirehero</a></div>
				<p class="font-medium text-[#57564F]">Create a new account</p>
			</div>

			<SocialAuthButton provider="google">Google</SocialAuthButton>

			<div class="relative w-full">
				<div
					class="h-px w-full bg-gradient-to-r from-transparent via-[#D4D7DD] to-transparent"
				></div>
				<span
					class="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-[#F6F6F6] px-2.5 text-sm tracking-wide text-[#D4D7DD]"
				>
					or
				</span>
			</div>

			<form method="POST" class="space-y-3">
				<div class="grid grid-cols-2 gap-3">
					<input
						type="text"
						name="firstname"
						id="firstname"
						placeholder="First name"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="text"
						name="lastname"
						id="lastname"
						placeholder="Last name"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
				</div>

				<input
					type="email"
					name="email"
					id="email"
					placeholder="Email"
					required
					class="w-full rounded-[12px] border border-[#D4D7DD]
					bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
				/>

				<div class="relative w-full">
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						id="password"
						placeholder="Password"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<button
						type="button"
						class="absolute top-1/2 right-4.5 -translate-y-1/2 cursor-pointer text-[#7A7A73] hover:text-[#57564F] focus:outline-none"
						onclick={() => (showPassword = !showPassword)}
						tabindex="-1"
					>
						{#if showPassword}
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<button
					type="submit"
					class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
				>
					Sign Up
				</button>
			</form>

			<div class="space-y-3">
				<div class="text-center text-[#7A7A73]">
					<p>
						Already have an account?
						<a href="/login" class="pl-3 hover:text-[#57564F]">Login</a>
					</p>
				</div>

				{#if form?.errorMessage}
					<div
						class="rounded-[12px] border border-red-400/30
						bg-red-400/30 px-4.5 py-1.5 text-center text-red-600/80"
					>
						{form.errorMessage}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
