<script lang="ts">
	import {
		Briefcase,
		MapPin,
		IndianRupee,
		Users,
		GraduationCap,
		Tag,
		Clock,
		Building2,
		Globe,
		Plus
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { X } from '@lucide/svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';

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
	const currencies = ['INR', 'USD', 'EUR', 'GBP'];

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

		// Add skills manually to FormData (if not already handled by hidden inputs)
		// Note: The hidden inputs in Dropdown.svelte handle their values automatically.
		// This part is for skills, which are dynamic.
		formData.skills.forEach((skill, index) => {
			formDataObj.append(`skills[${index}]`, skill);
		});

		// Add published status
		formDataObj.append('isPublished', isPublished.toString());

		// Log FormData for debugging
		for (const [key, value] of formDataObj.entries()) {
			console.log(`${key}: ${value}`);
		}

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

<div class="min-h-screen">
	<div class="flex w-full justify-center p-4.5 lg:px-20 xl:px-40">
		<div class="w-full max-w-xl space-y-12">
			<div class="space-y-3 py-9 text-center">
				<p class="text-xl font-semibold">Create Job Listing</p>
				<p class="text-[#7A7A73]">Find the perfect candidate for your open position</p>
			</div>

			<form method="post" action="?/post" class="space-y-12" onsubmit={handleSubmit}>
				<!-- Job Basic Information -->
				<div class="space-y-3">
					<h2 class="pb-6 text-center font-semibold">Basic Information</h2>
					<!-- Job Title -->
					<input
						type="text"
						name="title"
						id="title"
						bind:value={formData.title}
						placeholder="Job Title"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<!-- Job Type -->
					<Dropdown
						label="Job Type *"
						options={jobTypes}
						bind:value={formData.type}
						placeholder="Job Type"
						name="type"
					/>
					<!-- Category -->
					<Dropdown
						label="Category"
						options={jobCategories}
						bind:value={formData.category}
						placeholder="Category"
						name="category"
					/>
					<!-- Job Description -->
					<div>
						<textarea
							id="description"
							name="description"
							bind:value={formData.description}
							rows="6"
							required
							placeholder="Job Description (Markdown)"
							class="w-full resize-none rounded-[12px] border
						border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						></textarea>
						<p class="text-xs text-[#7A7A73]">Minimum 100 characters recommended</p>
					</div>
				</div>
				<!-- Compensation -->
				<div class="space-y-3">
					<h2 class="pb-3 text-center font-semibold">Compensation</h2>
					<div class="grid gap-3 md:grid-cols-3">
						<!-- Salary Range -->
						<input
							type="number"
							name="salaryMin"
							id="salaryMin"
							required
							bind:value={formData.salaryMin}
							placeholder="Minimum Salary"
							class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
						<input
							type="number"
							name="salaryMax"
							id="salaryMax"
							required
							bind:value={formData.salaryMax}
							placeholder="Maximum Salary"
							class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
						<Dropdown
							label="Currency"
							options={currencies}
							bind:value={formData.salaryCurrency}
							placeholder="Currency"
							name="salaryCurrency"
						/>
						<div class="md:col-span-3">
							<Dropdown
								label="Salary Type *"
								options={salaryTypes}
								bind:value={formData.salaryType}
								placeholder="Select salary type"
								name="salaryType"
							/>
						</div>
					</div>
				</div>
				<!-- Requirements -->
				<div class="space-y-3">
					<h2 class="pb-3 text-center font-semibold">Requirements</h2>
					<div class="grid gap-3 md:grid-cols-2">
						<!-- Experience Level -->
						<Dropdown
							label="Experience Level"
							options={experienceLevels}
							bind:value={formData.experienceLevel}
							placeholder="Experience level"
							name="experienceLevel"
						/>
						<!-- Education Level -->
						<Dropdown
							label="Education Level"
							options={educationLevels}
							bind:value={formData.educationLevel}
							placeholder="Education level"
							name="educationLevel"
						/>
					</div>
					<!-- Skills -->
					<div class="space-y-3">
						<div class="flex gap-3">
							<input
								type="text"
								id="skills-input"
								bind:value={skillInput}
								placeholder="Skills"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
							/>
							<button
								type="button"
								onclick={addSkill}
								class="cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] p-[11px] text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
							>
								<Plus size="14" />
							</button>
						</div>
						<p class="text-xs text-[#7A7A73]">Press Enter or click + to add each skill</p>
						{#if formData.skills.length > 0}
							<div class="flex flex-wrap gap-3">
								{#each formData.skills as skill}
									<span
										class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
									>
										<span class="text-[#212121]">{skill}</span>
										<button
											type="button"
											onclick={() => removeSkill(skill)}
											class="cursor-pointer rounded p-0.5 transition-all duration-300 hover:text-red-500"
										>
											<X size="14" />
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
				<div class="space-y-3">
					<h2 class="pb-3 text-center font-semibold">Location</h2>
					<div class="grid gap-3 md:grid-cols-2">
						<!-- Location Type -->
						<div class="md:col-span-2">
							<Dropdown
								label="Location Type *"
								options={locationTypes}
								bind:value={formData.locationType}
								placeholder="Select location type"
								name="locationType"
							/>
						</div>
						{#if formData.locationType !== 'Remote'}
							<!-- City -->
							<input
								type="text"
								name="city"
								id="city"
								bind:value={formData.city}
								placeholder="City"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							/>
							<!-- Country -->
							<input
								type="text"
								name="country"
								id="country"
								bind:value={formData.country}
								placeholder="Country"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							/>
							<!-- Address -->
							<input
								type="text"
								name="address"
								id="address"
								bind:value={formData.address}
								placeholder="Complete address (optional)"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none md:col-span-2"
							/>
						{/if}
					</div>
				</div>
				<!-- Job Settings -->
				<div class="space-y-3">
					<h2 class="pb-3 text-center font-semibold">Job Settings</h2>
					<div class="space-y-5">
						<!-- Expiry Date -->
						<div>
							<DatePicker
								name="expiresAt"
								bind:value={formData.expiresAt}
								placeholder="Application Deadline"
							/>
							<p class="mt-1 text-xs text-[#7A7A73]">Leave empty if no deadline</p>
						</div>

						<!-- Publish Status -->
						<div class="flex items-center gap-3">
							<button
								type="button"
								onclick={togglePublished}
								class="relative mt-0.5 flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-300 ease-in-out {isPublished
									? 'border-[#323232] bg-[#212121] shadow-sm'
									: 'border-[#D4D7DD] hover:border-[#323232] hover:shadow-sm'}"
								aria-pressed={isPublished}
								aria-label="Publish this job listing immediately"
							>
								{#if isPublished}
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
							</button>
							<button
								type="button"
								onclick={togglePublished}
								class="cursor-pointer text-sm leading-relaxed text-[#7A7A73]"
							>
								Publish this job listing immediately
							</button>
						</div>
					</div>
				</div>
				<!-- Hidden input for isPublished status -->
				<input type="hidden" name="isPublished" value={isPublished.toString()} />
				<!-- Submit Buttons -->
				<div class="flex gap-3">
					<button
						type="button"
						class="cursor-pointer rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 text-center transition-colors duration-300 hover:bg-[#EAE9E9] focus:outline-none"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232] focus:outline-none"
					>
						{isPublished ? 'Create & Publish Job' : 'Save as Draft'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
