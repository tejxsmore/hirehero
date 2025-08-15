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
	class="w-full cursor-pointer rounded-[12px] border border-[#B80000] bg-[#E52020]
	px-4.5 py-1.5 text-[#F6F6F6] transition-all duration-300 hover:bg-[#C40C0C]"
>
	Sign Out
</button>
