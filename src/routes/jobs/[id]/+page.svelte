<script lang="ts">
	const { data } = $props();
	const { job } = data;
</script>

<div class="bg-black p-5">
	<pre>{JSON.stringify(job, null, 4)}</pre>
</div>
