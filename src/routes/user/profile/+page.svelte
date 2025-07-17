<script>
	const { data } = $props();
	const { profile, experiences, educations, projects, certifications } = data;

	import Profile from './Profile.svelte';
	import RegisterProfile from './RegisterProfile.svelte';
</script>

{#if profile}
	<Profile {profile} {experiences} {educations} {projects} {certifications} />
{:else}
	<RegisterProfile />
{/if}
