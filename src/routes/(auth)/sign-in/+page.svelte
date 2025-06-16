<script lang="ts">
	const data = $props();
	const { form } = data;

	import SocialAuthButton from '$lib/components/auth/SocialAuthButton.svelte';
	import { Mail, Lock, Eye, EyeOff, AlertCircle } from '@lucide/svelte';

	let showPassword = $state(false);
</script>

<div class="flex min-h-screen">
	<div class="flex w-full justify-center p-5">
		<div class="w-full max-w-md space-y-10">
			<div class="py-5 text-center">
				<a href="/" class="text-2xl font-bold md:text-4xl">HiREHERO</a>
				<p class="pt-2.5 text-[#6c757d]">Welcome! Sign in to continue</p>
			</div>

			<SocialAuthButton provider="google">Google</SocialAuthButton>

			<div class="relative">
				<hr class="border-[#272829]" />
				<span
					class="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-[#0f0f0f] px-2.5 text-sm text-[#272829]"
				>
					or
				</span>
			</div>

			<form method="POST" class="space-y-5">
				<div
					class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
				>
					<Mail class="mr-5 h-4 w-4 text-[#454545]" />
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						required
						class="w-full bg-transparent placeholder:text-[#454545] focus:outline-none"
					/>
				</div>

				<div
					class="flex items-center rounded-[10px] border border-[#272829] bg-[#191919] px-5 py-2.5"
				>
					<Lock class="mr-5 h-4 w-4 text-[#454545]" />
					<input
						type={showPassword ? 'text' : 'password'}
						name="password"
						id="password"
						placeholder="Password"
						required
						class="w-full bg-transparent placeholder:text-[#454545] focus:outline-none"
					/>
					<button
						type="button"
						class="ml-5 cursor-pointer text-[#454545]"
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
					class="w-full cursor-pointer rounded-full border border-[#14C38E] bg-[#00FFAB] px-5 py-2.5 font-medium text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
				>
					Sign In
				</button>
			</form>

			<div class="space-y-2.5">
				<div class="text-center text-[#6c757d]">
					<p>
						Don't have an account?
						<a href="/sign-up" class="pl-2.5 hover:text-[#00FFAB] hover:underline"> Sign Up </a>
					</p>
				</div>

				{#if form?.errorMessage}
					<div
						class="rounded-[10px] border border-red-400
						bg-red-400/10 px-5 py-2.5 text-red-400 transition-colors duration-200"
					>
						<p class="flex items-center">
							<span><AlertCircle class="mr-5 h-4 w-4 text-[#D84040]" /></span>
							{form.errorMessage}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
