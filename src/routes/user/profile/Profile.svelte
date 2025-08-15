<script lang="ts">
	import SignOutButton from '$lib/components/auth/SignOutButton.svelte';

	const { profile, experiences, educations, projects, certifications } = $props();
	console.log(profile);
</script>

<div class="min-h-screen space-y-20 p-5">
	<div class="space-y-10">
		<div>
			<p>{profile.fullName}</p>
			<p>{profile.headline}</p>
		</div>
	</div>
	<SignOutButton />
</div>
