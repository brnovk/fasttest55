const fs = require("fs");
const fsp = fs.promises;

const {
	GetObjectCommand,
	S3Client
} = require("@aws-sdk/client-s3");
const s3Client = new S3Client({});

let currentContext;

exports.handler = async (event, context, callback) => {
	currentContext = context;
	try {
		let url = "https://test12345.my.salesforce.com/services/data/v61.0/sobjects/ContentVersion";
		let method = "POST";

		// local file
		let file = await fsp.readFile("files/" + "Test (1).pdf");

		// // S3
		// // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/GetObjectCommand/
		// let s3Bucket = "vik-test-bucket-3";
		// let s3Filename = "Test (1).pdf";
		// let s3ContentType = null;
		// let s3params = {
		// 	"Bucket" : s3Bucket,
		// 	"Key" : s3Filename
		// };
		// if (s3ContentType) {
		// 	s3params["ResponseContentType"] = s3ContentType;
		// }
		// let s3Response = await s3Client.send(new GetObjectCommand(s3params));
		// // Get Buffer from ReadableStream
		// const chunks = [];
		// for await (const chunk of s3Response.Body) {
		// 	chunks.push(chunk);
		// }
		// const file = Buffer.concat(chunks);

		let data = [
			{
				"name": "entity_content",
				"value": JSON.stringify({
					"ContentDocumentId": "069bm00000BGBvdAAH",
					"PathOnClient": "Test (1).pdf",
					"ReasonForChange": "update128"
				}),
				"formAppendOptions": {
					"contentType": "application/json"
				}
			},
			{
				"name": "VersionData",
				"value": file,
				"formAppendOptions": {
					"filename": "Test (1).pdf",
					"contentType": "application/pdf"
				}
			}
		];

		const boundary = "----WebKitFormBoundary" + Math.random().toString(16).slice(2);
		let bodyBuffers = data.map(part => makeMultipartPart(part, boundary));
		bodyBuffers.push(Buffer.from(`--${boundary}--\r\n`));
		const multipartBody = Buffer.concat(bodyBuffers);

		let headers = {
			"Authorization": "Bearer 00D2X000002ES8q!.....",
			"Content-Type": `multipart/form-data; boundary=${boundary}`,
			"Content-Length": multipartBody.length.toString()
		};

		let response = await fetch(url, {
			method,
			headers,
			body: multipartBody
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(`HTTP ${response.status}: ${text}`);
		}

		const dataResponse = await response.json();
		console.log(dataResponse);

	} catch (err) {
		if (err.message) {
			throwErrorOnApi(err.message);
			throw JSON.stringify(err.message);
		} else {
			throwErrorOnApi(err);
			throw JSON.stringify(err);
		}
	}
};

function makeMultipartPart(part, boundary) {
	const CRLF = "\r\n";
	let header = `--${boundary}${CRLF}Content-Disposition: form-data; name="${part.name}"`;

	if (part.formAppendOptions) {
		if (part.formAppendOptions.filename) {
			header += `; filename="${part.formAppendOptions.filename}"`;
		}
		header += CRLF;
		if (part.formAppendOptions.contentType) {
			header += `Content-Type: ${part.formAppendOptions.contentType}${CRLF}`;
		}
	} else {
		header += CRLF;
	}
	header += CRLF;

	let buffers = [Buffer.from(header)];
	if (Buffer.isBuffer(part.value)) {
		buffers.push(part.value);
	} else {
		buffers.push(Buffer.from(part.value));
	}
	buffers.push(Buffer.from(CRLF));
	return Buffer.concat(buffers);
}

function isString(obj) {
	return (typeof obj === "string" || obj instanceof String);
}

function throwErrorOnApi(error) {
	// currentContext.fail(JSON.stringify({"status": 400, "error": JSON.stringify(error)}));
}

let process = {
	env: {
		method: "post"
	}
};

// RUNNER
exports.handler({
}).then(function(data) {
	console.log(JSON.stringify(data, null,2));
	console.log("------------------------------------------------------------------------");
}, function(error) {
	console.log(JSON.stringify(error.message ? error.message : error, null,2));
	console.log("------------------------------------------------------------------------");
});
