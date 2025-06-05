
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

let currentContext;

exports.handler = async (event, context, callback) => {
	currentContext = context;
	try {
		let url = "https://test12345.my.salesforce.com/services/data/v61.0/sobjects/ContentVersion";
		let method = "POST";
		const fs = require("fs");
		const fsp = fs.promises;
		let file = await fsp.readFile("files/" + "Test (1).pdf");
		let base64File = file.toString("base64");
		let data = [
			{
				"name": "entity_content",
				"value": {
					"ContentDocumentId": "069KB000000TuyaYAC",
					"PathOnClient": "Test (1).pdf",
					"ReasonForChange": "update124"
				},
				"convertValue": "stringify",
				"formAppendOptions": {
					"contentType": "application/json"
				}
			},
			{
				"name": "VersionData",
				"value": base64File,
				"convertValue": "base64ToBlob",
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
			let convertValue = multipartFormDataParam.convertValue;
			let formAppendOptions = multipartFormDataParam.formAppendOptions;
			if (isString(convertValue) && convertValue.toLowerCase() === "stringify".toLowerCase()) {
				value = JSON.stringify(value);
			} else if (isString(convertValue) && convertValue.toLowerCase() === "base64ToBlob".toLowerCase()) {
				value = Buffer.from(value, "base64");
			}
			if (formAppendOptions) {
				form.append(name, value, formAppendOptions);
			} else {
				form.append(name, value);
			}
		}
		let headers = form.getHeaders(); // Specify "Content-Type": multipart/form-data; boundary=...
		console.log(headers);

		headers["Authorization"] = "Bearer 00D2X000002ES8q!......";

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
