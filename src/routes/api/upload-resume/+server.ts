import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const s3 = new S3Client({
	region: env.AWS_REGION || 'eu-north-1',
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY
	}
});

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			throw error(400, 'No file provided');
		}

		// Validate file type
		const allowedTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		];

		if (!allowedTypes.includes(file.type)) {
			throw error(400, 'Invalid file type');
		}

		// Validate file size (10MB max)
		if (file.size > 10 * 1024 * 1024) {
			throw error(400, 'File size too large');
		}

		// Generate unique key
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
		const key = `resumes/${timestamp}-${randomString}-${cleanFileName}`;

		console.log('Uploading file:', file.name, 'Size:', file.size, 'Key:', key);

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to S3
		const command = new PutObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: file.type,
			Metadata: {
				'original-name': file.name,
				'upload-timestamp': timestamp.toString()
			}
		});

		await s3.send(command);

		const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

		console.log('Upload successful:', fileUrl);

		return new Response(
			JSON.stringify({
				fileUrl,
				key,
				originalName: file.name,
				size: file.size
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (err: any) {
		console.error('Upload error:', err);

		if (err.status) {
			throw err;
		}

		throw error(500, `Upload failed: ${err.message}`);
	}
}
