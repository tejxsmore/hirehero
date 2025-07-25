<script lang="ts">
	import { signOut } from '$lib/auth-client';
	import { userStore } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					$userStore = null;
					goto('/login');
				}
			}
		});
	}
</script>

<button
	onclick={handleSignOut}
	class="cursor-pointer rounded-[9px] border border-[#B80000] bg-[#820300] px-3 py-1 text-sm transition-all duration-300 hover:border-[#FF0000] hover:bg-[#B80000]"
>
	Sign Out
</button>
