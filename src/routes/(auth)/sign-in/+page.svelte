<script lang="ts">
	const data = $props();
	const { form } = data;

	import SocialAuthButton from '$lib/components/auth/SocialAuthButton.svelte';
	import { Mail, Lock, Eye, EyeOff, AlertCircle } from '@lucide/svelte';

	let showPassword = $state(false);
</script>

<div class="flex min-h-screen">
	<div class="hidden bg-black md:block md:w-1/2"></div>

	<div class="flex w-full justify-center p-8 md:w-1/2">
		<div class="w-full max-w-md space-y-8">
			<div class="py-8 text-center text-gray-800">
				<a href="/" class="text-4xl font-bold">Hirehero</a>
				<p class="pt-4 text-lg text-gray-600">Welcome! Sign in to continue</p>
			</div>

			<SocialAuthButton provider="google">Google</SocialAuthButton>

			<div class="relative">
				<hr class="border-gray-300" />
				<span
					class="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-[#DDDDDD]"
				>
					or
				</span>
			</div>

			<form method="POST" class="space-y-4">
				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<Mail class="mr-4 h-4 w-4 text-gray-400" />
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						required
						class="w-full bg-transparent focus:outline-none"
					/>
				</div>

				<div class="flex items-center rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] px-4 py-2">
					<Lock class="mr-4 h-4 w-4 text-gray-400" />
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
						class="ml-2 text-gray-400 hover:text-gray-600"
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
					class="w-full cursor-pointer rounded-full border border-[#604CC3] bg-[#6256CA] p-2 text-white transition-colors duration-200 hover:bg-[#5C2FC2]"
				>
					Sign In
				</button>
			</form>

			<div class="text-center text-gray-600">
				<p>
					Don't have an account?
					<a href="/sign-up" class="font-medium text-black hover:text-[#6256CA] hover:underline">
						Sign Up
					</a>
				</p>
			</div>

			{#if form?.errorMessage}
				<div class="rounded-[8px] border border-[#B82132] bg-[#D84040]/50 px-4 py-2">
					<p class="flex gap-4">
						<span><AlertCircle class="mt-1 h-4 w-4" /></span>
						{form.errorMessage}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
