import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const s3 = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY
	}
});

export async function POST({ request }) {
	try {
		const { fileName, fileType, fileSize } = await request.json();

		console.log('Upload request received:', {
			fileName,
			fileType,
			fileSize,
			bucket: env.S3_BUCKET_NAME,
			region: env.AWS_REGION
		});

		// Validate inputs
		if (!fileName || !fileType) {
			throw error(400, 'Missing fileName or fileType');
		}

		// Validate file type
		const allowedTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		];

		if (!allowedTypes.includes(fileType)) {
			console.error('Invalid file type:', fileType);
			throw error(400, 'Invalid file type');
		}

		// Validate file size (10MB max)
		if (fileSize && fileSize > 10 * 1024 * 1024) {
			console.error('File too large:', fileSize);
			throw error(400, 'File size too large');
		}

		// Generate unique key
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
		const key = `resumes/${timestamp}-${randomString}-${cleanFileName}`;

		console.log('Generated S3 key:', key);

		// Create the command
		const command = new PutObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
			ContentType: fileType,
			Metadata: {
				'original-name': fileName,
				'upload-timestamp': timestamp.toString()
			}
		});

		// Generate signed URL (valid for 5 minutes)
		const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
		const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

		console.log('Generated signed URL successfully');
		console.log('Upload URL length:', uploadUrl.length);
		console.log('File URL:', fileUrl);

		return new Response(
			JSON.stringify({
				uploadUrl,
				fileUrl,
				key
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (err: any) {
		console.error('API Error:', err);
		console.error('Error details:', {
			message: err.message,
			stack: err.stack,
			name: err.name
		});

		if (err.status) {
			throw err;
		}

		throw error(500, `Server error: ${err.message}`);
	}
}
