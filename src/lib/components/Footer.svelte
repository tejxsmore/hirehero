<script>
	let currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-[#EAE9E9] bg-white p-4.5 lg:px-20 xl:px-40">
	<div class="mx-auto flex flex-col justify-between gap-6 md:flex-row">
		<!-- Branding -->
		<div class="space-y-1.5">
			<h2 class="text-xl font-semibold">HireHero</h2>
			<p class="text-sm text-[#57564F]">Find your dream job faster.</p>
		</div>

		<!-- Links -->
		<div class="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#57564F]">
			<a href="/jobs" class="transition-all duration-300 hover:text-[#212121]">Jobs</a>
			<a href="/companies" class="transition-all duration-300 hover:text-[#212121]">Companies</a>
			<a href="/salary" class="transition-all duration-300 hover:text-[#212121]">Salary</a>
			<a href="/resources" class="transition-all duration-300 hover:text-[#212121]">Resources</a>
			<a href="/privacy" class="transition-all duration-300 hover:text-[#212121]">Privacy Policy</a>
			<a href="/terms" class="transition-all duration-300 hover:text-[#212121]">Terms</a>
		</div>

		<!-- Socials -->
		<div class="flex gap-4">
			<a
				href="https://x.com/tejxsmore"
				target="_blank"
				aria-label="Twitter"
				class="text-[#7A7A73] transition-all duration-300 hover:text-[#57564F]"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
					class="h-5 w-5"
				>
					<path
						d="M22.46 6c-.77.35-1.6.58-2.46.69a4.23 4.23 0 001.85-2.33 8.49 8.49 0 01-2.69 1.03 4.21 4.21 0 00-7.17 3.84A11.93 11.93 0 013 4.9a4.21 4.21 0 001.3 5.62 4.18 4.18 0 01-1.9-.52v.05a4.21 4.21 0 003.38 4.12 4.27 4.27 0 01-1.89.07 4.22 4.22 0 003.94 2.93A8.45 8.45 0 012 19.54 11.91 11.91 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.36 8.36 0 0022.46 6z"
					/>
				</svg>
			</a>
			<a
				href="https://linkedin.com/in/tejxsmore"
				target="_blank"
				aria-label="LinkedIn"
				class="text-[#7A7A73] transition-all duration-300 hover:text-[#57564F]"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
					class="h-5 w-5"
				>
					<path
						d="M4.98 3.5a2.5 2.5 0 110 5.001 2.5 2.5 0 010-5.001zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.08 8.65 21 10.85 21 14.15V21h-4v-6c0-1.45-.03-3.3-2.01-3.3-2.01 0-2.32 1.57-2.32 3.19V21H9z"
					/>
				</svg>
			</a>
		</div>
	</div>

	<!-- Bottom text -->
	<div
		class="mt-6 border-t border-[#EAE9E9] pt-4.5 text-center text-sm
    text-[#7A7373]"
	>
		© {currentYear} HireHero. All rights reserved.
	</div>
</footer>
