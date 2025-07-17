<script lang="ts">
	import {
		Briefcase,
		MapPin,
		IndianRupee,
		Users,
		GraduationCap,
		Calendar,
		Tag,
		Clock,
		Building2,
		Globe,
		ChevronDown,
		X
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

	// Form state
	let formData = $state({
		title: '',
		description: '',
		type: '',
		category: '',
		salaryMin: '',
		salaryMax: '',
		salaryCurrency: '₹ INR',
		salaryType: '',
		experienceLevel: '',
		educationLevel: '',
		skills: [] as string[],
		locationType: '',
		country: '',
		city: '',
		address: '',
		applicationUrl: '',
		applicationEmail: '',
		expiresAt: ''
	});

	let skillInput = $state('');
	let isPublished = $state(false);

	// Enum options
	const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
	const salaryTypes = ['Per Year', 'Per Month', 'Per Week', 'Per Day', 'Per Hour'];
	const locationTypes = ['Remote', 'On-site', 'Hybrid'];
	const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];
	const educationLevels = [
		'High School',
		'Diploma',
		"Bachelor's Degree",
		"Master's Degree",
		'PhD',
		'Not Required'
	];
	const jobCategories = [
		'Technology',
		'Marketing',
		'Sales',
		'Design',
		'Finance',
		'Human Resources',
		'Operations',
		'Customer Service',
		'Engineering',
		'Healthcare',
		'Education',
		'Legal',
		'Other'
	];
	const currencies = ['₹ INR', '$ USD', '€ EUR', '£ GBP'];

	function addSkill() {
		if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
			formData.skills = [...formData.skills, skillInput.trim()];
			skillInput = '';
		}
	}

	function removeSkill(skillToRemove: string) {
		formData.skills = formData.skills.filter((skill) => skill !== skillToRemove);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addSkill();
		}
	}

	function togglePublished() {
		isPublished = !isPublished;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		const form = event.target as HTMLFormElement;
		const formDataObj = new FormData(form);

		// Add skills manually to FormData
		formData.skills.forEach((skill, index) => {
			formDataObj.append(`skills[${index}]`, skill);
		});

		// Add published status
		formDataObj.append('isPublished', isPublished.toString());

		// Submit to your backend
		fetch('?/post', {
			method: 'POST',
			body: formDataObj
		})
			.then((response) => {
				if (response.ok) {
					console.log('Job posted successfully');
					goto('/employer');
				} else {
					console.error('Failed to post job');
					alert('Failed to post job. Please try again.');
				}
			})
			.catch((error) => {
				console.error('Error posting job:', error);
			});
	}
</script>

<div class="flex min-h-screen">
	<div class="flex w-full justify-center">
		<div class="w-full max-w-4xl space-y-10 p-5">
			<div class="space-y-2.5 py-5 text-center">
				<p class="text-xl font-semibold">Create Job Listing</p>
				<p class="text-gray-600">Find the perfect candidate for your open position</p>
			</div>

			<form method="post" action="?/post" class="space-y-10" onsubmit={handleSubmit}>
				<!-- Job Basic Information -->
				<div class="rounded-[15px] border border-gray-300 bg-white p-5">
					<h3 class="mb-5 text-lg font-semibold">Basic Information</h3>

					<div class="grid gap-5 md:grid-cols-2">
						<!-- Job Title -->
						<div class="space-y-1 md:col-span-2">
							<label for="title" class="block text-sm font-medium text-gray-600">
								Job Title <span class="text-[#FF4F0F]">*</span>
							</label>
							<div
								class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
							>
								<Briefcase class="mr-5 h-4 w-4 text-gray-400" />
								<input
									type="text"
									id="title"
									name="title"
									bind:value={formData.title}
									placeholder="e.g. Senior Software Engineer"
									required
									class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
								/>
							</div>
						</div>

						<!-- Job Type -->
						<div class="space-y-1">
							<label for="type" class="block text-sm font-medium text-gray-600">
								Job Type <span class="text-[#FF4F0F]">*</span>
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<Clock class="mr-5 h-4 w-4 text-gray-400" />
									<select
										id="type"
										name="type"
										bind:value={formData.type}
										required
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select job type</option>
										{#each jobTypes as jobType}
											<option class="bg-white" value={jobType}>{jobType}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>

						<!-- Category -->
						<div class="space-y-1">
							<label for="category" class="block text-sm font-medium text-gray-600">
								Category
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<Tag class="mr-5 h-4 w-4 text-gray-400" />
									<select
										id="category"
										name="category"
										bind:value={formData.category}
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select category</option>
										{#each jobCategories as category}
											<option class="bg-white" value={category}>{category}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					<!-- Job Description -->
					<div class="mt-5 space-y-1">
						<label for="description" class="block text-sm font-medium text-gray-600">
							Job Description (Markdown) <span class="text-[#FF4F0F]">*</span>
						</label>
						<div class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 p-5">
							<textarea
								id="description"
								name="description"
								bind:value={formData.description}
								rows="6"
								required
								placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
								class="w-full resize-none bg-transparent placeholder:text-gray-400 focus:outline-none"
							></textarea>
						</div>
						<p class="text-xs tracking-wide text-gray-400">Minimum 100 characters recommended</p>
					</div>
				</div>

				<!-- Compensation -->
				<div class="rounded-[15px] border border-gray-300 bg-white p-5">
					<h3 class="mb-5 text-lg font-semibold">Compensation</h3>

					<div class="grid gap-5 md:grid-cols-3">
						<!-- Salary Range -->
						<div class="space-y-1">
							<label for="salaryMin" class="block text-sm font-medium text-gray-600">
								Minimum Salary <span class="text-[#FF4F0F]">*</span>
							</label>
							<div
								class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
							>
								<IndianRupee class="mr-5 h-4 w-4 text-gray-400" />
								<input
									type="number"
									id="salaryMin"
									name="salaryMin"
									required
									bind:value={formData.salaryMin}
									placeholder="50000"
									class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
								/>
							</div>
						</div>

						<div class="space-y-1">
							<label for="salaryMax" class="block text-sm font-medium text-gray-600">
								Maximum Salary <span class="text-[#FF4F0F]">*</span>
							</label>
							<div
								class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
							>
								<IndianRupee class="mr-5 h-4 w-4 text-gray-400" />
								<input
									type="number"
									id="salaryMax"
									name="salaryMax"
									required
									bind:value={formData.salaryMax}
									placeholder="80000"
									class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
								/>
							</div>
						</div>

						<div class="space-y-1">
							<label for="salaryCurrency" class="block text-sm font-medium text-gray-600">
								Currency
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<select
										id="salaryCurrency"
										name="salaryCurrency"
										bind:value={formData.salaryCurrency}
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										{#each currencies as currency}
											<option class="bg-white" value={currency}>{currency}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>

						<div class="space-y-1 md:col-span-3">
							<label for="salaryType" class="block text-sm font-medium text-gray-600">
								Salary Type <span class="text-[#FF4F0F]">*</span>
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<select
										id="salaryType"
										name="salaryType"
										required
										bind:value={formData.salaryType}
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select salary type</option>
										{#each salaryTypes as salaryType}
											<option class="bg-white" value={salaryType}>{salaryType}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Requirements -->
				<div class="rounded-[15px] border border-gray-300 bg-white p-5">
					<h3 class="mb-5 text-lg font-semibold">Requirements</h3>

					<div class="grid gap-5 md:grid-cols-2">
						<!-- Experience Level -->
						<div class="space-y-1">
							<label for="experienceLevel" class="block text-sm font-medium text-gray-600">
								Experience Level
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<Users class="mr-5 h-4 w-4 text-gray-400" />
									<select
										id="experienceLevel"
										name="experienceLevel"
										bind:value={formData.experienceLevel}
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select experience level</option>
										{#each experienceLevels as level}
											<option class="bg-white" value={level}>{level}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>

						<!-- Education Level -->
						<div class="space-y-1">
							<label for="educationLevel" class="block text-sm font-medium text-gray-600">
								Education Level
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<GraduationCap class="mr-5 h-4 w-4 text-gray-400" />
									<select
										id="educationLevel"
										name="educationLevel"
										bind:value={formData.educationLevel}
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select education level</option>
										{#each educationLevels as level}
											<option class="bg-white" value={level}>{level}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					<!-- Skills -->
					<div class="mt-5 space-y-1">
						<label for="skillInput" class="block text-sm font-medium text-gray-600">
							Required Skills
						</label>
						<div class="flex items-center gap-5">
							<!-- Input container with border and padding -->
							<div class="flex-1 rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5">
								<input
									type="text"
									id="skillInput"
									name="skillInput"
									bind:value={skillInput}
									onkeydown={handleKeyDown}
									placeholder="Type a skill and press Add"
									class="w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none"
								/>
							</div>

							<!-- Add button, outside the input container -->
							<button
								type="button"
								onclick={addSkill}
								class="cursor-pointer rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 font-medium text-[#FF4F0F] transition hover:opacity-80"
							>
								Add
							</button>
						</div>

						{#if formData.skills.length > 0}
							<div class="mt-3 flex flex-wrap gap-2">
								{#each formData.skills as skill}
									<span
										class="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600"
									>
										{skill}
										<button
											type="button"
											onclick={() => removeSkill(skill)}
											class="ml-3 cursor-pointer text-gray-400 hover:text-gray-600"
										>
											<X size="16" />
										</button>
									</span>
								{/each}
							</div>
						{/if}

						<!-- Hidden inputs for skills to be included in form submission -->
						{#each formData.skills as skill, index}
							<input type="hidden" name="skills[{index}]" value={skill} />
						{/each}
					</div>
				</div>

				<!-- Location -->
				<div class="rounded-[15px] border border-gray-300 bg-white p-5">
					<h3 class="mb-5 text-lg font-semibold">Location</h3>

					<div class="grid gap-5 md:grid-cols-2">
						<!-- Location Type -->
						<div class="space-y-1 md:col-span-2">
							<label for="locationType" class="block text-sm font-medium text-gray-600">
								Location Type <span class="text-[#FF4F0F]">*</span>
							</label>
							<div class="relative">
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<MapPin class="mr-5 h-4 w-4 text-gray-400" />
									<select
										id="locationType"
										name="locationType"
										bind:value={formData.locationType}
										required
										class="w-full appearance-none bg-transparent focus:outline-none"
									>
										<option class="bg-white" value="">Select location type</option>
										{#each locationTypes as locationType}
											<option class="bg-white" value={locationType}>{locationType}</option>
										{/each}
									</select>
									<ChevronDown class="pointer-events-none ml-5 h-4 w-4 text-gray-400" />
								</div>
							</div>
						</div>

						{#if formData.locationType !== 'Remote'}
							<!-- City -->
							<div class="space-y-1">
								<label for="city" class="block text-sm font-medium text-gray-600"> City </label>
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<Building2 class="mr-5 h-4 w-4 text-gray-400" />
									<input
										type="text"
										id="city"
										name="city"
										bind:value={formData.city}
										placeholder="e.g. Mumbai"
										class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
									/>
								</div>
							</div>

							<!-- Country -->
							<div class="space-y-1">
								<label for="country" class="block text-sm font-medium text-gray-600">
									Country
								</label>
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<Globe class="mr-5 h-4 w-4 text-gray-400" />
									<input
										type="text"
										id="country"
										name="country"
										bind:value={formData.country}
										placeholder="e.g. India"
										class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
									/>
								</div>
							</div>

							<!-- Address -->
							<div class="space-y-1 md:col-span-2">
								<label for="address" class="block text-sm font-medium text-gray-600">
									Address
								</label>
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<MapPin class="mr-5 h-4 w-4 text-gray-400" />
									<input
										type="text"
										id="address"
										name="address"
										bind:value={formData.address}
										placeholder="Complete address (optional)"
										class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
									/>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Job Settings -->
				<div class="rounded-[15px] border border-gray-300 bg-white p-5">
					<h3 class="mb-5 text-lg font-semibold">Job Settings</h3>

					<div class="space-y-5">
						<!-- Expiry Date -->
						<div class="space-y-1">
							<label for="expiresAt" class="block text-sm font-medium text-gray-600">
								Application Deadline
							</label>
							<div
								class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
							>
								<Calendar class="mr-5 h-4 w-4 text-gray-400" />
								<input
									type="datetime-local"
									id="expiresAt"
									name="expiresAt"
									bind:value={formData.expiresAt}
									class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
								/>
							</div>
							<p class="mt-1 text-xs text-gray-400">Leave empty if no deadline</p>
						</div>

						<!-- Publish Status -->
						<div class="flex items-center gap-5">
							<button
								type="button"
								onclick={togglePublished}
								class="relative mt-0.5 flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200 ease-in-out {isPublished
									? 'border-[#E6521F] bg-[#FF4F0F] shadow-md'
									: 'border-gray-300 hover:border-[#E6521F] hover:shadow-sm'}"
								aria-pressed={isPublished}
								aria-label="Publish this job listing immediately"
							>
								{#if isPublished}
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
							</button>
							<button
								type="button"
								onclick={togglePublished}
								class="cursor-pointer text-sm leading-relaxed text-gray-600"
							>
								Publish this job listing immediately
							</button>
						</div>
					</div>
				</div>

				<!-- Hidden input for isPublished status -->
				<input type="hidden" name="isPublished" value={isPublished.toString()} />

				<!-- Submit Buttons -->
				<div class="flex gap-5">
					<button
						type="button"
						class="cursor-pointer rounded-full border border-gray-300 bg-white px-5 py-2.5 text-gray-600 transition-colors
						duration-200 hover:bg-gray-100 focus:outline-none"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 cursor-pointer rounded-full border border-[#E6521F] bg-[#FF4F0F] px-5 py-2.5 font-medium text-white transition-all duration-100 hover:bg-[#F14A00] focus:outline-none"
					>
						{isPublished ? 'Create & Publish Job' : 'Save as Draft'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
