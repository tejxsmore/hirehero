<script lang="ts">
	import { X, Plus, Trash2, ChevronLeft, ChevronRight, Check } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import DatePicker from '$lib/components/DatePicker.svelte';

	let currentStep = $state(1);
	let skillInput = $state('');
	let isSubmitting = $state(false);
	let resumeUpload = $state(false);
	let resumeName = $state('');
	let resumeSize = $state('');
	let formData = $state({
		// Basic Info
		fullName: '',
		email: '',
		phone: '',
		resumeUrl: '',
		location: '',
		headline: '',
		bio: '',
		// Social Links
		portfolio: '',
		github: '',
		linkedin: '',
		// Skills - explicitly type as string array
		skills: [] as string[],
		// Experience
		experience: [
			{
				id: crypto.randomUUID(),
				company: '',
				title: '',
				location: '',
				startDate: '',
				endDate: '',
				isCurrent: false,
				description: ''
			}
		],
		// Education
		education: [
			{
				id: crypto.randomUUID(),
				institution: '',
				degree: '',
				fieldOfStudy: '',
				startDate: '',
				endDate: '',
				grade: '',
				description: ''
			}
		],
		// Projects
		projects: [
			{
				id: crypto.randomUUID(),
				title: '',
				description: '',
				projectUrl: '',
				githubUrl: '',
				startDate: '',
				endDate: '',
				technologies: [] as string[]
			}
		],
		// Certifications
		certifications: [
			{
				id: crypto.randomUUID(),
				name: '',
				issuer: '',
				issueDate: '',
				expiryDate: '',
				certificateUrl: ''
			}
		]
	});

	const totalSteps = 6;
	const stepTitles = [
		'Basic Information',
		'Social Links',
		'Skills & Expertise',
		'Work Experience',
		'Education',
		'Projects & Certifications'
	];

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function addSkill() {
		if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
			formData.skills = [...formData.skills, skillInput.trim()];
			skillInput = '';
		}
	}

	function removeSkill(skill: string) {
		formData.skills = formData.skills.filter((s) => s !== skill);
	}

	function addExperience() {
		formData.experience = [
			...formData.experience,
			{
				id: crypto.randomUUID(),
				company: '',
				title: '',
				location: '',
				startDate: '',
				endDate: '',
				isCurrent: false,
				description: ''
			}
		];
	}

	function removeExperience(id: string) {
		formData.experience = formData.experience.filter((exp) => exp.id !== id);
	}

	function addEducation() {
		formData.education = [
			...formData.education,
			{
				id: crypto.randomUUID(),
				institution: '',
				degree: '',
				fieldOfStudy: '',
				startDate: '',
				endDate: '',
				grade: '',
				description: ''
			}
		];
	}

	function removeEducation(id: string) {
		formData.education = formData.education.filter((edu) => edu.id !== id);
	}

	function addProject() {
		formData.projects = [
			...formData.projects,
			{
				id: crypto.randomUUID(),
				title: '',
				description: '',
				projectUrl: '',
				githubUrl: '',
				startDate: '',
				endDate: '',
				technologies: [] as string[]
			}
		];
	}

	function removeProject(id: string) {
		formData.projects = formData.projects.filter((proj) => proj.id !== id);
	}

	function addCertification() {
		formData.certifications = [
			...formData.certifications,
			{
				id: crypto.randomUUID(),
				name: '',
				issuer: '',
				issueDate: '',
				expiryDate: '',
				certificateUrl: ''
			}
		];
	}

	function removeCertification(id: string) {
		formData.certifications = formData.certifications.filter((cert) => cert.id !== id);
	}

	async function handleResumeUpload(event: any) {
		const file = event.target.files[0];
		if (!file) return;
		// Add file validation
		const maxSize = 10 * 1024 * 1024; // 10MB
		const allowedTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		];
		if (file.size > maxSize) {
			alert('File size must be less than 10MB');
			return;
		}
		if (!allowedTypes.includes(file.type)) {
			alert('Please upload a PDF, DOC, or DOCX file');
			return;
		}
		try {
			console.log('Starting upload for:', file.name, file.type, file.size);
			resumeName = file.name;
			resumeSize = file.size;
			// Create FormData
			const uploadFormData = new FormData();
			uploadFormData.append('file', file);
			// Upload directly to your server
			const upload = await fetch('/api/upload-resume', {
				method: 'POST',
				body: uploadFormData
			});
			if (!upload.ok) {
				const errorText = await upload.text();
				throw new Error(`Upload failed: ${upload.status} ${errorText}`);
			}
			const { fileUrl, key, originalName, size } = await upload.json();
			formData.resumeUrl = fileUrl;
			console.log('Upload successful:', fileUrl);
			resumeUpload = true;
		} catch (err: any) {
			console.error('Upload error:', err);
			alert(`Resume upload failed: ${err.message}`);
		}
	}

	// Fixed handleSubmit function with proper form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (isSubmitting) return; // Prevent double submission
		// Basic validation before submission
		if (!formData.fullName || !formData.email || !formData.location || !formData.headline) {
			alert(
				'Please fill in all required fields (Full Name, Email, Location, Professional Headline)'
			);
			return;
		}
		if (!formData.resumeUrl) {
			alert('Please upload your resume before submitting');
			return;
		}
		if (formData.skills.length === 0) {
			alert('Please add at least one skill');
			return;
		}
		isSubmitting = true;
		try {
			console.log('Submitting form data:', formData);
			// Create FormData and submit to the register action
			const form = new FormData();
			form.append('data', JSON.stringify(formData));
			const response = await fetch('?/register', {
				method: 'POST',
				body: form
			});
			console.log('Response status:', response.status);
			if (response.ok) {
				// Check if it's a redirect response
				if (response.redirected) {
					window.location.href = response.url;
					return;
				}
				// Try to parse response
				const result = await response.json().catch(() => null);
				if (result?.type === 'success') {
					console.log('Profile registered successfully!');
				}
				// Navigate to jobs page
				goto('/jobs');
			} else {
				// Handle error response
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `Server error: ${response.status}`);
			}
		} catch (error: any) {
			console.error('Form submission error:', error);
			// More user-friendly error messages
			let errorMessage = 'Failed to register profile. ';
			if (error.message.includes('fetch') || error.message.includes('network')) {
				errorMessage += 'Please check your internet connection and try again.';
			} else if (error.message.includes('401')) {
				errorMessage += 'You are not logged in. Please sign in and try again.';
			} else if (error.message.includes('400')) {
				errorMessage += 'Please check your form data and try again.';
			} else if (error.message.includes('500')) {
				errorMessage += 'Server error. Please try again later.';
			} else {
				errorMessage += error.message;
			}
			alert(errorMessage);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex w-full justify-center p-4.5 lg:px-20 xl:px-40">
	<div class="w-full max-w-xl space-y-12">
		<!-- Progress Bar -->
		<div class="space-y-3 pt-9 pb-4.5">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Complete Your Profile</h2>
				<span class="text-sm text-[#7A7A73]">Step {currentStep} of {totalSteps}</span>
			</div>
			<div class="h-2 w-full rounded-full bg-white">
				<div
					class="h-2 rounded-full bg-[#212121] transition-all duration-300"
					style="width: {(currentStep / totalSteps) * 100}%"
				></div>
			</div>
			<!-- <p class="mt-2 text-center font-medium text-gray-600">{stepTitles[currentStep - 1]}</p> -->
		</div>

		<!-- Form Container -->
		<form onsubmit={handleSubmit}>
			{#if currentStep === 1}
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Tell us about yourself</h3>
					<p class="text-[#7A7A73]">Basic information to get started</p>
				</div>
				<!-- Step 1: Basic Information -->
				<div class="space-y-3">
					<input
						type="text"
						id="fullName"
						bind:value={formData.fullName}
						placeholder="Full Name"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						placeholder="Email"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="tel"
						id="phone"
						bind:value={formData.phone}
						placeholder="Phone"
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					{#if !resumeUpload}
						<div class="group relative">
							<div
								class="cursor-pointer rounded-[12px] border border-dashed border-[#D4D7DD] p-4.5 text-center transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
							>
								<input
									type="file"
									id="resume-upload"
									accept=".pdf,.doc,.docx"
									onchange={handleResumeUpload}
									required
									class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								/>
								<div class="flex flex-col items-center space-y-3">
									<div
										class="flex items-center justify-center rounded-full bg-[#e8e8e8] p-3 transition-colors duration-300 group-hover:bg-[#D4D7DD]"
									>
										<svg
											class="h-4.5 w-4.5 text-[#57564F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
									</div>
									<div>
										<p class="text-sm font-medium text-[#57564F]">
											Click to upload or drag and drop
										</p>
										<p class="mt-1 text-xs text-[#7A7A73]">PDF, DOC, DOCX (Max 10MB)</p>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="flex w-full items-center justify-between gap-4.5 rounded-[12px] border border-[#06923E] bg-[#D3ECCD]
                             p-4.5 text-[#212121] focus:outline-none"
						>
							<div class="flex items-center gap-4.5">
								<div class="flex items-center justify-center rounded-full bg-[#06923E] p-3">
									<svg
										class="h-4.5 w-4.5 text-[#212121]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-[#5E936C]">
										{`${resumeName} (${(Number.parseInt(resumeSize) / 1024).toFixed(1)}KB)`}
									</p>
								</div>
							</div>
							<button
								type="button"
								class="cursor-pointer rounded-[9px] border
								border-[#E52020] bg-white px-3 py-1 text-sm text-[#E52020]"
								onclick={() => {
									resumeUpload = false;
									resumeName = '';
									resumeSize = '';
									formData.resumeUrl = '';
								}}
							>
								Change
							</button>
						</div>
					{/if}
					<input
						type="text"
						id="location"
						bind:value={formData.location}
						placeholder="Address"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="text"
						id="headline"
						bind:value={formData.headline}
						placeholder="Title"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<textarea
						id="bio"
						bind:value={formData.bio}
						rows="4"
						placeholder="Description"
						class="w-full resize-none rounded-[12px] border
                        border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					></textarea>
				</div>
			{:else if currentStep === 2}
				<!-- Step 2: Social Links -->
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Your Online Presence</h3>
					<p class="text-[#7A7A73]">Add your professional profiles and portfolio</p>
				</div>
				<div class="space-y-3">
					<input
						type="url"
						id="portfolio"
						bind:value={formData.portfolio}
						placeholder="Portfolio URL"
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="url"
						id="linkedin"
						bind:value={formData.linkedin}
						placeholder="LinkedIn URL"
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
					<input
						type="url"
						id="github"
						bind:value={formData.github}
						placeholder="GitHub URL"
						class="w-full rounded-[12px] border border-[#D4D7DD]
                        bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>
				</div>
			{:else if currentStep === 3}
				<!-- Step 3: Skills -->
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Your Skills & Expertise</h3>
					<p class="text-[#7A7A73]">Add skills that match your experience</p>
				</div>
				<div class="space-y-3">
					<div class="flex gap-3">
						<input
							type="text"
							id="skills-input"
							bind:value={skillInput}
							placeholder="Skills"
							class="w-full rounded-[12px] border border-[#D4D7DD]
                            bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
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
					<p class="text-xs tracking-wide text-[#7A7A73]">
						Press Enter or click + to add each skill
					</p>
					{#if formData.skills.length > 0}
						<div class="flex flex-wrap gap-3">
							{#each formData.skills as skill}
								<span
									class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
								>
									<span class="">{skill}</span>
									<button
										type="button"
										onclick={() => removeSkill(skill)}
										class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
									>
										<X size="14" />
									</button>
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{:else if currentStep === 4}
				<!-- Step 4: Experience -->
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Work Experience</h3>
					<p class="text-[#7A7A73]">Add your professional experience</p>
				</div>
				<div class="space-y-6">
					{#each formData.experience as exp, index}
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<h4 class="font-medium text-gray-700">Experience {index + 1}</h4>
								{#if formData.experience.length > 1}
									<button
										type="button"
										onclick={() => removeExperience(exp.id)}
										class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
									>
										<Trash2 size="14" />
									</button>
								{/if}
							</div>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<input
									type="text"
									id="company-{exp.id}"
									bind:value={exp.company}
									placeholder="Company name"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="title-{exp.id}"
									bind:value={exp.title}
									placeholder="Your role"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<DatePicker
									bind:value={exp.startDate}
									name="experience[{index}].startDate"
									placeholder="Start Date"
								/>
								<DatePicker
									bind:value={exp.endDate}
									name="experience[{index}].endDate"
									placeholder="End Date"
									disabled={exp.isCurrent}
								/>
								<label for="current-{exp.id}" class="flex items-center gap-2 text-sm text-gray-600">
									<div class="relative mt-0.5 flex-shrink-0">
										<input
											type="checkbox"
											id="current-{exp.id}"
											bind:checked={exp.isCurrent}
											class="sr-only"
										/>
										<label
											for="current-{exp.id}"
											class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-md border transition-all duration-300 ease-in-out {exp.isCurrent
												? 'border-[#323232] bg-[#212121] shadow-sm'
												: 'border-[#D4D7DD] hover:border-[#323232] hover:shadow-sm'}"
										>
											{#if exp.isCurrent}
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
									I currently work here
								</label>
							</div>
							<input
								type="text"
								id="exp-location-{exp.id}"
								bind:value={exp.location}
								placeholder="Address"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							/>
							<textarea
								id="exp-description-{exp.id}"
								bind:value={exp.description}
								rows="3"
								placeholder="Describe your role"
								class="w-full resize-none rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							></textarea>
						</div>
					{/each}
					<button
						type="button"
						onclick={addExperience}
						class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-dashed border-[#D4D7DD] px-4.5 py-1.5 transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
					>
						<Plus size="14" />
						Add Another Experience
					</button>
				</div>
			{:else if currentStep === 5}
				<!-- Step 5: Education -->
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Education</h3>
					<p class="text-[#7A7A73]">Add your educational background</p>
				</div>
				<div class="space-y-6">
					{#each formData.education as edu, index}
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<h4 class="font-medium text-gray-700">Education {index + 1}</h4>
								{#if formData.education.length > 1}
									<button
										type="button"
										onclick={() => removeEducation(edu.id)}
										class="cursor-pointer rounded p-0.5 transition-all duration-300 hover:text-red-500"
									>
										<Trash2 size="14" />
									</button>
								{/if}
							</div>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<input
									type="text"
									id="institution-{edu.id}"
									bind:value={edu.institution}
									placeholder="Institution"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="degree-{edu.id}"
									bind:value={edu.degree}
									placeholder="Degree"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="field-{edu.id}"
									bind:value={edu.fieldOfStudy}
									placeholder="Field of Study"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="grade-{edu.id}"
									bind:value={edu.grade}
									placeholder="Grade/GPA"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<DatePicker
									bind:value={edu.startDate}
									name="education[{index}].startDate"
									placeholder="Start Date"
								/>
								<DatePicker
									bind:value={edu.endDate}
									name="education[{index}].endDate"
									placeholder="End Date"
								/>
							</div>
							<textarea
								id="edu-description-{edu.id}"
								bind:value={edu.description}
								rows="3"
								placeholder="Describe your studies, achievements, activities..."
								class="w-full resize-none rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							></textarea>
						</div>
					{/each}
					<button
						type="button"
						onclick={addEducation}
						class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-dashed border-[#D4D7DD] px-4.5 py-1.5 transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
					>
						<Plus size="14" />
						Add Another Education
					</button>
				</div>
			{:else if currentStep === 6}
				<!-- Step 6: Projects & Certifications -->
				<div class="space-y-3 pt-4.5 pb-9 text-center">
					<h3 class="text-xl font-semibold">Projects & Certifications</h3>
					<p class="text-[#7A7A73]">Showcase your work and achievements</p>
				</div>

				<!-- Projects Section -->
				<div class="space-y-6">
					<h4 class="text-lg font-medium text-gray-700">Projects</h4>
					{#each formData.projects as project, index}
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<h5 class="font-medium text-gray-700">Project {index + 1}</h5>
								{#if formData.projects.length > 1}
									<button
										type="button"
										onclick={() => removeProject(project.id)}
										class="cursor-pointer rounded p-0.5 transition-all duration-300 hover:text-red-500"
									>
										<Trash2 size="14" />
									</button>
								{/if}
							</div>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<input
									type="text"
									id="project-title-{project.id}"
									bind:value={project.title}
									placeholder="Project Title"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="url"
									id="project-url-{project.id}"
									bind:value={project.projectUrl}
									placeholder="Project URL"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="url"
									id="github-url-{project.id}"
									bind:value={project.githubUrl}
									placeholder="GitHub URL"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="project-tech-{project.id}"
									bind:value={project.technologies}
									placeholder="Technologies Used (comma-separated)"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<DatePicker
									bind:value={project.startDate}
									name="projects[{index}].startDate"
									placeholder="Start Date"
								/>
								<DatePicker
									bind:value={project.endDate}
									name="projects[{index}].endDate"
									placeholder="End Date"
								/>
							</div>
							<textarea
								id="project-description-{project.id}"
								bind:value={project.description}
								rows="3"
								placeholder="Describe the project, your role, and key achievements..."
								class="w-full resize-none rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							></textarea>
						</div>
					{/each}
					<button
						type="button"
						onclick={addProject}
						class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-dashed border-[#D4D7DD] px-4.5 py-1.5 transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
					>
						<Plus size="14" />
						Add Another Project
					</button>
				</div>

				<!-- Certifications Section -->
				<div class="mt-8 space-y-6">
					<h4 class="text-lg font-medium text-gray-700">Certifications</h4>
					{#each formData.certifications as cert, index}
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<h5 class="font-medium text-gray-700">Certification {index + 1}</h5>
								{#if formData.certifications.length > 1}
									<button
										type="button"
										onclick={() => removeCertification(cert.id)}
										class="cursor-pointer rounded p-0.5 transition-all duration-300 hover:text-red-500"
									>
										<Trash2 size="14" />
									</button>
								{/if}
							</div>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<input
									type="text"
									id="cert-name-{cert.id}"
									bind:value={cert.name}
									placeholder="Certificate Name"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<input
									type="text"
									id="cert-issuer-{cert.id}"
									bind:value={cert.issuer}
									placeholder="Issuing Organization"
									class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
								/>
								<DatePicker
									bind:value={cert.issueDate}
									name="certifications[{index}].issueDate"
									placeholder="Issue Date"
								/>
								<DatePicker
									bind:value={cert.expiryDate}
									name="certifications[{index}].expiryDate"
									placeholder="Expiry Date"
								/>
							</div>
							<input
								type="url"
								id="cert-url-{cert.id}"
								bind:value={cert.certificateUrl}
								placeholder="Certificate URL"
								class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							/>
						</div>
					{/each}
					<button
						type="button"
						onclick={addCertification}
						class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] border border-dashed border-[#D4D7DD] px-4.5 py-1.5 transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
					>
						<Plus size="14" />
						Add Another Certification
					</button>
				</div>
			{/if}

			<!-- Navigation Buttons -->
			<div class="mt-8 flex items-center justify-between">
				<button
					type="button"
					onclick={prevStep}
					disabled={currentStep === 1}
					class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 transition-colors duration-300 hover:bg-[#EAE9E9]
                    disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ChevronLeft class="h-4 w-4" />
					Previous
				</button>
				{#if currentStep === totalSteps}
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<div
								class="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent"
							></div>
							Submitting...
						{:else}
							<Check class="h-4 w-4" />
							Submit
						{/if}
					</button>
				{:else}
					<button
						type="button"
						onclick={nextStep}
						class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
					>
						Next
						<ChevronRight class="h-4 w-4" />
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>
