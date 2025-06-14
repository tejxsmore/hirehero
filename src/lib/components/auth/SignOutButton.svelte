<script lang="ts">
	import { signOut } from '$lib/auth-client';
	import { userStore } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					$userStore = null;
					goto('/sign-in');
				}
			}
		});
	}
</script>

<button onclick={handleSignOut} class="rounded-[10px] border px-5 py-2.5"> Sign Out </button>
