<script lang="ts">
	import {
		User,
		Mail,
		Phone,
		MapPin,
		Globe,
		Linkedin,
		Github,
		Briefcase,
		GraduationCap,
		Award,
		FileText,
		Plus,
		Trash2,
		ChevronLeft,
		ChevronRight,
		Check,
		Building2
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';

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
		website: '',
		linkedin: '',
		github: '',
		portfolio: '',

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
		<div class="space-y-3 py-9">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Complete Your Profile</h2>
				<span class="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
			</div>
			<div class="h-2 w-full rounded-full bg-gray-200">
				<div
					class="h-2 rounded-full bg-[#FF4F0F] transition-all duration-300"
					style="width: {(currentStep / totalSteps) * 100}%"
				></div>
			</div>
			<!-- <p class="mt-2 text-center font-medium text-gray-600">{stepTitles[currentStep - 1]}</p> -->
		</div>

		<!-- Form Container -->
		<form onsubmit={handleSubmit}>
			{#if currentStep === 1}
				<div class="py-5 text-center">
					<h3 class="text-xl font-semibold">Tell us about yourself</h3>
					<p class="text-gray-600">Basic information to get started</p>
				</div>
				<!-- Step 1: Basic Information -->
				<div class="space-y-3">
					<input
						type="text"
						id="fullName"
						bind:value={formData.fullName}
						placeholder="Enter your full name"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>

					<input
						type="email"
						id="email"
						bind:value={formData.email}
						placeholder="your.email@example.com"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>

					<input
						type="tel"
						id="phone"
						bind:value={formData.phone}
						placeholder="+91 9191919191"
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>

					{#if !resumeUpload}
						<div class="group relative">
							<div
								class="cursor-pointer rounded-[10px] border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-all duration-200 hover:border-gray-400 hover:bg-gray-100"
							>
								<input
									type="file"
									id="resume-upload"
									accept=".pdf,.doc,.docx"
									onchange={handleResumeUpload}
									required
									class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								/>
								<div class="flex flex-col items-center space-y-2">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 transition-colors group-hover:bg-gray-300"
									>
										<svg
											class="h-6 w-6 text-gray-500"
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
										<p class="text-sm font-medium text-gray-700">
											Click to upload or drag and drop
										</p>
										<p class="mt-1 text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="flex items-center justify-between rounded-[10px] border-2 border-dashed border-green-400 bg-green-50 px-6 py-6 text-left transition-all duration-200"
						>
							<div class="flex items-center space-x-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
									<svg
										class="h-6 w-6 text-green-600"
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
									<p class="text-sm font-medium text-green-700">
										{`${resumeName} (${(Number.parseInt(resumeSize) / 1024).toFixed(1)}KB)`}
									</p>
									<p class="text-xs text-gray-500">Uploaded successfully</p>
								</div>
							</div>
							<button
								type="button"
								class="cursor-pointer rounded-[5px] border border-[#E6521F] bg-orange-50 px-3 py-1 text-sm text-[#FF4F0F] hover:bg-orange-100"
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
						placeholder="City, Country"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>

					<input
						type="text"
						id="headline"
						bind:value={formData.headline}
						placeholder="e.g. Senior Software Engineer"
						required
						class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					/>

					<textarea
						id="bio"
						bind:value={formData.bio}
						rows="4"
						placeholder="Tell us about your background, interests, and what you're looking for..."
						class="w-full resize-none rounded-[12px] border
						border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					></textarea>
				</div>
			{:else if currentStep === 2}
				<!-- Step 2: Social Links -->
				<div class="space-y-6">
					<div class="mb-6 text-center">
						<h3 class="text-xl font-semibold text-gray-800">Your Online Presence</h3>
						<p class="text-gray-600">Add your professional profiles and portfolio</p>
					</div>

					<div class="space-y-1">
						<label for="website" class="block text-sm font-medium text-gray-600">
							Personal Website
						</label>
						<div
							class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
						>
							<Globe class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="url"
								id="website"
								bind:value={formData.website}
								placeholder="https://yourwebsite.com"
								class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
							/>
						</div>
					</div>

					<div class="space-y-1">
						<label for="linkedin" class="block text-sm font-medium text-gray-600">
							LinkedIn Profile
						</label>
						<div
							class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
						>
							<Linkedin class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="url"
								id="linkedin"
								bind:value={formData.linkedin}
								placeholder="https://linkedin.com/in/yourprofile"
								class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
							/>
						</div>
					</div>

					<div class="space-y-1">
						<label for="github" class="block text-sm font-medium text-gray-600">
							GitHub Profile
						</label>
						<div
							class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
						>
							<Github class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="url"
								id="github"
								bind:value={formData.github}
								placeholder="https://github.com/yourusername"
								class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
							/>
						</div>
					</div>

					<div class="space-y-1">
						<label for="portfolio" class="block text-sm font-medium text-gray-600">
							Portfolio URL
						</label>
						<div
							class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
						>
							<FileText class="mr-5 h-4 w-4 text-gray-400" />
							<input
								type="url"
								id="portfolio"
								bind:value={formData.portfolio}
								placeholder="https://yourportfolio.com"
								class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			{:else if currentStep === 3}
				<!-- Step 3: Skills -->
				<div class="space-y-6">
					<div class="mb-6 text-center">
						<h3 class="text-xl font-semibold text-gray-800">Your Skills & Expertise</h3>
						<p class="text-gray-600">Add skills that match your experience</p>
					</div>

					<div class="space-y-1">
						<label for="skills-input" class="block text-sm font-medium text-gray-600">
							Add Skills <span class="text-[#FF4F0F]">*</span>
						</label>
						<div class="flex gap-2">
							<div
								class="flex flex-1 items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
							>
								<input
									type="text"
									id="skills-input"
									bind:value={skillInput}
									placeholder="e.g. JavaScript, React, Python"
									class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
									onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
								/>
							</div>
							<button
								type="button"
								onclick={addSkill}
								class="cursor-pointer rounded-full bg-[#FF4F0F] px-2.75 text-white transition-colors duration-200 hover:bg-[#F14A00]"
							>
								<Plus />
							</button>
						</div>
						<p class="text-xs tracking-wide text-gray-400">
							Press Enter or click + to add each skill
						</p>
					</div>

					{#if formData.skills.length > 0}
						<div class="space-y-2">
							<p class="text-sm font-medium text-gray-600">Your Skills:</p>
							<div class="flex flex-wrap gap-2.5">
								{#each formData.skills as skill}
									<span class="flex gap-3 rounded-full bg-[#FF4F0F] p-1 pl-3 text-white">
										<span class="mb-0.5">{skill}</span>
										<button
											type="button"
											onclick={() => removeSkill(skill)}
											class="cursor-pointer rounded-full px-1.5 hover:bg-[#F14A00]"
										>
											<Trash2 class="h-3 w-3" />
										</button>
									</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else if currentStep === 4}
				<!-- Step 4: Experience -->
				<div class="space-y-6">
					<div class="mb-6 text-center">
						<h3 class="text-xl font-semibold text-gray-800">Work Experience</h3>
						<p class="text-gray-600">Add your professional experience</p>
					</div>

					{#each formData.experience as exp, index}
						<div class="space-y-4 rounded-[10px] border border-gray-200 p-5">
							<div class="flex items-center justify-between">
								<h4 class="font-medium text-gray-700">Experience {index + 1}</h4>
								{#if formData.experience.length > 1}
									<button
										type="button"
										onclick={() => removeExperience(exp.id)}
										class="p-1 text-red-500 hover:text-red-700"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								{/if}
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-1">
									<label for="company-{exp.id}" class="block text-sm font-medium text-gray-600">
										Company <span class="text-[#FF4F0F]">*</span>
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<Building2 class="mr-5 h-4 w-4 text-gray-400" />
										<input
											type="text"
											id="company-{exp.id}"
											bind:value={exp.company}
											placeholder="Company name"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="title-{exp.id}" class="block text-sm font-medium text-gray-600">
										Job Title <span class="text-[#FF4F0F]">*</span>
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<Briefcase class="mr-5 h-4 w-4 text-gray-400" />
										<input
											type="text"
											id="title-{exp.id}"
											bind:value={exp.title}
											placeholder="Your role"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="start-date-{exp.id}" class="block text-sm font-medium text-gray-600"
										>Start Date</label
									>
									<input
										type="month"
										id="start-date-{exp.id}"
										bind:value={exp.startDate}
										class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
									/>
								</div>

								<div class="space-y-1">
									<label for="end-date-{exp.id}" class="block text-sm font-medium text-gray-600"
										>End Date</label
									>
									<input
										type="month"
										id="end-date-{exp.id}"
										bind:value={exp.endDate}
										disabled={exp.isCurrent}
										class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none disabled:opacity-50"
									/>
									<label
										for="current-{exp.id}"
										class="flex items-center gap-2 text-sm text-gray-600"
									>
										<input
											type="checkbox"
											id="current-{exp.id}"
											bind:checked={exp.isCurrent}
											class="rounded"
										/>
										I currently work here
									</label>
								</div>
							</div>

							<div class="space-y-1">
								<label for="exp-location-{exp.id}" class="block text-sm font-medium text-gray-600"
									>Location</label
								>
								<div
									class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
								>
									<MapPin class="mr-5 h-4 w-4 text-gray-400" />
									<input
										type="text"
										id="exp-location-{exp.id}"
										bind:value={exp.location}
										placeholder="City, Country"
										class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
									/>
								</div>
							</div>

							<div class="space-y-1">
								<label
									for="exp-description-{exp.id}"
									class="block text-sm font-medium text-gray-600"
								>
									Job Description
								</label>
								<div class="rounded-[10px] border border-gray-300 bg-gray-200 p-5">
									<textarea
										id="exp-description-{exp.id}"
										bind:value={exp.description}
										rows="3"
										placeholder="Describe your role, responsibilities, and achievements..."
										class="w-full resize-none bg-transparent placeholder:text-gray-400 focus:outline-none"
									></textarea>
								</div>
							</div>
						</div>
					{/each}

					<button
						type="button"
						onclick={addExperience}
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
					>
						<Plus class="h-4 w-4" />
						Add Another Experience
					</button>
				</div>
			{:else if currentStep === 5}
				<!-- Step 5: Education -->
				<div class="space-y-6">
					<div class="mb-6 text-center">
						<h3 class="text-xl font-semibold text-gray-800">Education</h3>
						<p class="text-gray-600">Add your educational background</p>
					</div>

					{#each formData.education as edu, index}
						<div class="space-y-4 rounded-[10px] border border-gray-200 p-5">
							<div class="flex items-center justify-between">
								<h4 class="font-medium text-gray-700">Education {index + 1}</h4>
								{#if formData.education.length > 1}
									<button
										type="button"
										onclick={() => removeEducation(edu.id)}
										class="p-1 text-red-500 hover:text-red-700"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								{/if}
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-1">
									<label for="institution-{edu.id}" class="block text-sm font-medium text-gray-600">
										Institution <span class="text-[#FF4F0F]">*</span>
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<GraduationCap class="mr-5 h-4 w-4 text-gray-400" />
										<input
											type="text"
											id="institution-{edu.id}"
											bind:value={edu.institution}
											placeholder="University/College name"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="degree-{edu.id}" class="block text-sm font-medium text-gray-600">
										Degree <span class="text-[#FF4F0F]">*</span>
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<Award class="mr-5 h-4 w-4 text-gray-400" />
										<input
											type="text"
											id="degree-{edu.id}"
											bind:value={edu.degree}
											placeholder="e.g. Bachelor's, Master's"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="field-{edu.id}" class="block text-sm font-medium text-gray-600">
										Field of Study
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<input
											type="text"
											id="field-{edu.id}"
											bind:value={edu.fieldOfStudy}
											placeholder="e.g. Computer Science"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="grade-{edu.id}" class="block text-sm font-medium text-gray-600">
										Grade/GPA
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<input
											type="text"
											id="grade-{edu.id}"
											bind:value={edu.grade}
											placeholder="e.g. 3.8/4.0, First Class"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="edu-start-{edu.id}" class="block text-sm font-medium text-gray-600"
										>Start Date</label
									>
									<input
										type="month"
										id="edu-start-{edu.id}"
										bind:value={edu.startDate}
										class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
									/>
								</div>

								<div class="space-y-1">
									<label for="edu-end-{edu.id}" class="block text-sm font-medium text-gray-600"
										>End Date</label
									>
									<input
										type="month"
										id="edu-end-{edu.id}"
										bind:value={edu.endDate}
										class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
									/>
								</div>
							</div>

							<div class="space-y-1">
								<label
									for="edu-description-{edu.id}"
									class="block text-sm font-medium text-gray-600"
								>
									Description
								</label>
								<div class="rounded-[10px] border border-gray-300 bg-gray-200 p-5">
									<textarea
										id="edu-description-{edu.id}"
										bind:value={edu.description}
										rows="3"
										placeholder="Relevant coursework, achievements, activities..."
										class="w-full resize-none bg-transparent placeholder:text-gray-400 focus:outline-none"
									></textarea>
								</div>
							</div>
						</div>
					{/each}

					<button
						type="button"
						onclick={addEducation}
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
					>
						<Plus class="h-4 w-4" />
						Add Another Education
					</button>
				</div>
			{:else if currentStep === 6}
				<!-- Step 6: Projects & Certifications -->
				<div class="space-y-8">
					<div class="mb-6 text-center">
						<h3 class="text-xl font-semibold text-gray-800">Projects & Certifications</h3>
						<p class="text-gray-600">Showcase your work and achievements</p>
					</div>

					<!-- Projects Section -->
					<div class="space-y-6">
						<h4 class="text-lg font-medium text-gray-700">Projects</h4>

						{#each formData.projects as project, index}
							<div class="space-y-4 rounded-[10px] border border-gray-200 p-5">
								<div class="flex items-center justify-between">
									<h5 class="font-medium text-gray-700">Project {index + 1}</h5>
									{#if formData.projects.length > 1}
										<button
											type="button"
											onclick={() => removeProject(project.id)}
											class="p-1 text-red-500 hover:text-red-700"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									{/if}
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-1">
										<label
											for="project-title-{project.id}"
											class="block text-sm font-medium text-gray-600"
										>
											Project Title
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<input
												type="text"
												id="project-title-{project.id}"
												bind:value={project.title}
												placeholder="Project name"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="project-url-{project.id}"
											class="block text-sm font-medium text-gray-600"
										>
											Project URL
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<Globe class="mr-5 h-4 w-4 text-gray-400" />
											<input
												type="url"
												id="project-url-{project.id}"
												bind:value={project.projectUrl}
												placeholder="https://project-demo.com"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="github-url-{project.id}"
											class="block text-sm font-medium text-gray-600"
										>
											GitHub URL
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<Github class="mr-5 h-4 w-4 text-gray-400" />
											<input
												type="url"
												id="github-url-{project.id}"
												bind:value={project.githubUrl}
												placeholder="https://github.com/username/repo"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="project-tech-{project.id}"
											class="block text-sm font-medium text-gray-600"
										>
											Technologies Used
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<input
												type="text"
												id="project-tech-{project.id}"
												bind:value={project.technologies}
												placeholder="React, Node.js, MongoDB"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="project-start-{project.id}"
											class="block text-sm font-medium text-gray-600">Start Date</label
										>
										<input
											type="month"
											id="project-start-{project.id}"
											bind:value={project.startDate}
											class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
										/>
									</div>

									<div class="space-y-1">
										<label
											for="project-end-{project.id}"
											class="block text-sm font-medium text-gray-600">End Date</label
										>
										<input
											type="month"
											id="project-end-{project.id}"
											bind:value={project.endDate}
											class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label
										for="project-description-{project.id}"
										class="block text-sm font-medium text-gray-600"
									>
										Project Description
									</label>
									<div class="rounded-[10px] border border-gray-300 bg-gray-200 p-5">
										<textarea
											id="project-description-{project.id}"
											bind:value={project.description}
											rows="3"
											placeholder="Describe the project, your role, and key achievements..."
											class="w-full resize-none bg-transparent placeholder:text-gray-400 focus:outline-none"
										></textarea>
									</div>
								</div>
							</div>
						{/each}

						<button
							type="button"
							onclick={addProject}
							class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
						>
							<Plus class="h-4 w-4" />
							Add Another Project
						</button>
					</div>

					<!-- Certifications Section -->
					<div class="space-y-6">
						<h4 class="text-lg font-medium text-gray-700">Certifications</h4>

						{#each formData.certifications as cert, index}
							<div class="space-y-4 rounded-[10px] border border-gray-200 p-5">
								<div class="flex items-center justify-between">
									<h5 class="font-medium text-gray-700">Certification {index + 1}</h5>
									{#if formData.certifications.length > 1}
										<button
											type="button"
											onclick={() => removeCertification(cert.id)}
											class="p-1 text-red-500 hover:text-red-700"
										>
											<Trash2 class="h-4 w-4" />
										</button>
									{/if}
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-1">
										<label
											for="cert-name-{cert.id}"
											class="block text-sm font-medium text-gray-600"
										>
											Certificate Name
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<Award class="mr-5 h-4 w-4 text-gray-400" />
											<input
												type="text"
												id="cert-name-{cert.id}"
												bind:value={cert.name}
												placeholder="e.g. AWS Solutions Architect"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="cert-issuer-{cert.id}"
											class="block text-sm font-medium text-gray-600"
										>
											Issuing Organization
										</label>
										<div
											class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
										>
											<Building2 class="mr-5 h-4 w-4 text-gray-400" />
											<input
												type="text"
												id="cert-issuer-{cert.id}"
												bind:value={cert.issuer}
												placeholder="e.g. Amazon Web Services"
												class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<label
											for="cert-issue-{cert.id}"
											class="block text-sm font-medium text-gray-600">Issue Date</label
										>
										<input
											type="month"
											id="cert-issue-{cert.id}"
											bind:value={cert.issueDate}
											class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
										/>
									</div>

									<div class="space-y-1">
										<label
											for="cert-expiry-{cert.id}"
											class="block text-sm font-medium text-gray-600">Expiry Date</label
										>
										<input
											type="month"
											id="cert-expiry-{cert.id}"
											bind:value={cert.expiryDate}
											class="w-full rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5 focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label for="cert-url-{cert.id}" class="block text-sm font-medium text-gray-600">
										Certificate URL
									</label>
									<div
										class="flex items-center rounded-[10px] border border-gray-300 bg-gray-200 px-5 py-2.5"
									>
										<FileText class="mr-5 h-4 w-4 text-gray-400" />
										<input
											type="url"
											id="cert-url-{cert.id}"
											bind:value={cert.certificateUrl}
											placeholder="https://certificate-url.com"
											class="w-full bg-transparent placeholder:text-gray-400 focus:outline-none"
										/>
									</div>
								</div>
							</div>
						{/each}

						<button
							type="button"
							onclick={addCertification}
							class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
						>
							<Plus class="h-4 w-4" />
							Add Another Certification
						</button>
					</div>
				</div>
			{/if}

			<!-- Navigation Buttons -->
			<div class="mt-8 flex items-center justify-between">
				<button
					type="button"
					onclick={prevStep}
					disabled={currentStep === 1}
					class="flex cursor-pointer items-center gap-5 rounded-full border border-gray-300 bg-gray-200
					px-7.5 py-2.5 text-gray-600 transition-colors duration-200 hover:bg-gray-300
					disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ChevronLeft class="h-4 w-4" />
					Previous
				</button>

				{#if currentStep === totalSteps}
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex cursor-pointer items-center gap-5 rounded-full
						border border-[#E6521F] bg-[#FF4F0F] px-7.5 py-2.5 text-white transition-colors duration-200 hover:bg-[#F14A00] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
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
						class="flex cursor-pointer items-center gap-5 rounded-full border border-[#E6521F] bg-[#FF4F0F] px-7.5 py-2.5 text-white transition-colors duration-200 hover:bg-[#F14A00]"
					>
						Next
						<ChevronRight class="h-4 w-4" />
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>
