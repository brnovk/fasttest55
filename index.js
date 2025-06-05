
const axios = require("axios");
const FormData = require("form-data");

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

		// local
		let file = await fsp.readFile("files/" + "Test (1).pdf");
		let base64VersionData = file.toString("base64");

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
		// // "transformToString", "transformToByteArray" and "transformToWebStream"
		// let base64VersionData = await s3Response.Body.transformToString("base64");

		let data = [
			{
				"name": "entity_content",
				"value": JSON.stringify({
					"ContentDocumentId": "069KB000000TuyaYAC",
					"PathOnClient": "Test (1).pdf",
					"ReasonForChange": "update125"
				}),
				"formAppendOptions": {
					"contentType": "application/json"
				}
			},
			{
				"name": "VersionData",
				"value": Buffer.from(base64VersionData, "base64"),
				"formAppendOptions": {
					"filename": "Test (1).pdf",
					"contentType": "application/pdf"
				}
			}
		];

		let form = new FormData();
		for (let multipartFormDataParam of data) {
			let name = multipartFormDataParam.name;
			let value = multipartFormDataParam.value;
			let formAppendOptions = multipartFormDataParam.formAppendOptions;
			if (formAppendOptions) {
				form.append(name, value, formAppendOptions);
			} else {
				form.append(name, value);
			}
		}
		let headers = form.getHeaders(); // Specify "Content-Type": multipart/form-data; boundary=...

		headers["Authorization"] = "Bearer 00D2X000002ES8q!.....";

		let params = {};
		params.url = url;
		params.method = method;
		params.maxContentLength = "Infinity";
		params.maxBodyLength = "Infinity";
		params.data = form;
		params.headers = headers;
		let response = await axios(params);

		console.log(response ? response.data : "hui");
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

function isString(obj) {
	// noinspection RedundantConditionalExpressionJS
	return (typeof obj === "string" || obj instanceof String) ? true : false;
}

function throwErrorOnApi(error) {
// 	currentContext.fail(JSON.stringify({"status": 400, "error": JSON.stringify(error)}));
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
