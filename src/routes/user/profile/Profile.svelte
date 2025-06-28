<script lang="ts">
	const { profile, experiences, educations, projects, certifications } = $props();
	console.log(profile);
</script>

<div class="min-h-screen space-y-20 p-5">
	<div class="space-y-10">
		<h1 class="text-2xl font-semibold">Profile</h1>
		<div>
			<p>{profile.fullName}</p>
			<p>{profile.headline}</p>
		</div>
	</div>
</div>
