<script lang="ts">
	const data = $props();
	const { form } = data;

	import SocialAuthButton from '$lib/components/auth/SocialAuthButton.svelte';
	import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from '@lucide/svelte';

	let showPassword = $state(false);
</script>

<div class="flex min-h-screen">
	<div class="hidden bg-gradient-to-br from-[#A04747] to-[#FF4C29] md:block md:w-1/2"></div>

	<div class="flex w-full justify-center p-5 md:w-1/2">
		<div class="w-full max-w-md space-y-10">
			<div class="p-5 text-center">
				<a href="/" class="text-4xl font-black">HIREHERO</a>
				<p class="pt-2.5 text-lg">Welcome! Sign up to continue</p>
			</div>

			<SocialAuthButton provider="google">Google</SocialAuthButton>

			<div class="relative">
				<hr class="border-[#6c6849]" />
				<span
					class="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-[#343131] px-2 text-sm text-[#6c6849]"
				>
					or
				</span>
			</div>

			<form method="POST" class="space-y-5">
				<div class="flex gap-5">
					<div
						class="flex flex-1 items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-4 py-2 text-[#343131] focus-within:ring-2
					focus-within:ring-[#D0DDD0]"
					>
						<User class="mr-4 h-4 w-4" />
						<input
							type="text"
							name="firstname"
							id="firstname"
							placeholder="First name"
							required
							class="w-full bg-transparent focus:outline-none"
						/>
					</div>
					<div
						class="flex flex-1 items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-4 py-2 text-[#343131] focus-within:ring-2
					focus-within:ring-[#D0DDD0]"
					>
						<User class="mr-4 h-4 w-4" />
						<input
							type="text"
							name="lastname"
							id="lastname"
							placeholder="Last name"
							required
							class="w-full bg-transparent focus:outline-none"
						/>
					</div>
				</div>

				<div
					class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-4 py-2 text-[#343131] focus-within:ring-2
					focus-within:ring-[#D0DDD0]"
				>
					<Mail class="mr-4 h-4 w-4" />
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						required
						class="w-full bg-transparent focus:outline-none"
					/>
				</div>

				<div
					class="flex items-center rounded-[10px] border border-[#D0DDD0] bg-[#F5F5F5] px-4 py-2 text-[#343131] focus-within:ring-2
					focus-within:ring-[#D0DDD0]"
				>
					<Lock class="mr-4 h-4 w-4" />
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						id="password"
						placeholder="Password"
						required
						class="w-full bg-transparent focus:outline-none"
					/>
					<button
						type="button"
						class="ml-2"
						onclick={() => (showPassword = !showPassword)}
						tabindex="-1"
					>
						{#if showPassword}
							<EyeOff class="h-4 w-4 cursor-pointer" />
						{:else}
							<Eye class="h-4 w-4 cursor-pointer" />
						{/if}
					</button>
				</div>

				<button
					type="submit"
					class="w-full cursor-pointer rounded-full border border-[#E6521F]
						bg-[#FF4C29] px-5 py-2 text-white transition-colors duration-200 hover:bg-[#EA2F14]"
				>
					Sign Up
				</button>
			</form>

			<div class="space-y-2.5">
				<div class="text-center text-gray-400">
					<p>
						Already have an account?
						<a href="/sign-in" class="pl-2 font-medium hover:text-[#FF4C29] hover:underline">
							Sign In
						</a>
					</p>
				</div>

				{#if form?.errorMessage}
					<div
						class="rounded-[10px] border border-red-400 bg-red-400/40
				px-4 py-2"
					>
						<p class="flex gap-4">
							<span><AlertCircle class="mt-1 h-4 w-4" /></span>
							{form.errorMessage}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
