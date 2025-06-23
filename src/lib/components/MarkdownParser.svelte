<script lang="ts">
	interface Props {
		content: string;
		className?: string;
	}

	let { content, className = '' }: Props = $props();

	let parsedContent = $derived(parseMarkdown(content || ''));

	function parseMarkdown(markdown: string): string {
		if (!markdown) return '';

		let html = markdown;

		html = html.replace(
			/`([^`]+)`/g,
			'<code class="bg-gray-300 px-1.5 py-0.5 rounded font-mono text-sm text-gray-600">$1</code>'
		);

		html = html.replace(/^###### (.*$)/gm, '<h6 class="text-md font-medium">$1</h6>');
		html = html.replace(/^##### (.*$)/gm, '<h5 class="text-lg font-medium">$1</h5>');
		html = html.replace(/^#### (.*$)/gm, '<h4 class="text-xl font-medium">$1</h4>');
		html = html.replace(/^### (.*$)/gm, '<h3 class="text-2xl font-semibold">$1</h3>');
		html = html.replace(/^## (.*$)/gm, '<h2 class="text-3xl font-semibold">$1</h2>');
		html = html.replace(/^# (.*$)/gm, '<h1 class="text-4xl font-semibold">$1</h1>');

		html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
		html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
		html = html.replace(/_(.*?)_/g, '<em>$1</em>');

		html = html.replace(
			/^> (.*$)/gm,
			'<blockquote class="border-l-4 border-gray-400 pl-5 py-2.5 italic bg-gray-200 my-5">$1</blockquote>'
		);
		html = html.replace(/^\-\-\-$/gm, '<hr class="border-t my-5 border-gray-300">');
		html = processLists(html);
		html = html.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" class="text-[#FF4F0F] hover:underline">$1</a>'
		);
		html = html.replace(
			/!\[([^\]]+)\]\(([^)]+)\)/g,
			'<img src="$2" alt="$1" class="max-w-full h-auto rounded-[10px] my-5">'
		);
		html = html.replace(/^(?!<[a-z\/].*>)(.+)$/gm, '<p class="my-5">$1</p>');
		html = html.replace(/<p class="my-5"><\/p>/g, '');
		html = html.replace(/<\/p>\s*<p/g, '</p>\n<p');

		return html;
	}

	function processLists(html: string): string {
		html = html.replace(/^(\s*)([\-\*]) (.*$)/gm, (match, space, bullet, content) => {
			const indent = space.length;
			return (
				`<li data-indent="${indent}" class="ml-${indent > 0 ? 4 : 0} mb-1">` + content + '</li>'
			);
		});

		html = html.replace(/^(\s*)(\d+\.) (.*$)/gm, (match, space, number, content) => {
			const indent = space.length;
			return (
				`<li data-indent="${indent}" data-ordered="true" class="ml-${indent > 0 ? 4 : 0} mb-1">` +
				content +
				'</li>'
			);
		});

		const lines = html.split('\n');
		const result: string[] = [];
		const listStack: string[] = [];

		for (const line of lines) {
			if (line.includes('<li data-indent=')) {
				const indent = parseInt(line.match(/data-indent="(\d+)"/)?.[1] || '0');
				const isOrdered = line.includes('data-ordered="true"');
				const listType = isOrdered ? 'ol' : 'ul';

				while (listStack.length > indent) {
					result.push(`</${listStack.pop()!}>`);
				}

				if (listStack.length <= indent) {
					const listClass = isOrdered ? 'list-decimal pl-5 my-5' : 'list-disc pl-5 my-5';

					result.push(`<${listType} class="${listClass}">`);
					listStack.push(listType);
				}

				const cleanedLine = line
					.replace(/ data-indent="\d+"/, '')
					.replace(/ data-ordered="true"/, '');

				result.push(cleanedLine);
			} else {
				while (listStack.length > 0) {
					result.push(`</${listStack.pop()!}>`);
				}

				result.push(line);
			}
		}

		while (listStack.length > 0) {
			result.push(`</${listStack.pop()!}>`);
		}

		return result.join('\n');
	}
</script>

<div class={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
	{@html parsedContent}
</div>
