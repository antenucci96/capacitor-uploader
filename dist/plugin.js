var capacitorCapacitorUpdater = (function (exports, core) {
    'use strict';

    const Uploader = core.registerPlugin("Uploader", {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.UploaderWeb()),
    });

    class UploaderWeb extends core.WebPlugin {
        constructor() {
            super(...arguments);
            this.uploads = new Map();
        }
        async startUpload(options) {
            console.log("startUpload", options);
            const id = Math.random().toString(36).substring(2, 15);
            const controller = new AbortController();
            const maxRetries = options.maxRetries || 3;
            this.uploads.set(id, { controller, retries: maxRetries });
            this.doUpload(id, options);
            return { id };
        }
        async removeUpload(options) {
            console.log("removeUpload", options);
            const upload = this.uploads.get(options.id);
            if (upload) {
                upload.controller.abort();
                this.uploads.delete(options.id);
                this.notifyListeners("events", {
                    name: "cancelled",
                    id: options.id,
                    payload: {},
                });
            }
        }
        async doUpload(id, options) {
            const { filePath, serverUrl, headers = {}, method = "POST", parameters = {}, } = options;
            const upload = this.uploads.get(id);
            if (!upload)
                return;
            try {
                const file = await this.getFileFromPath(filePath);
                if (!file)
                    throw new Error("File not found");
                const formData = new FormData();
                formData.append("file", file);
                for (const [key, value] of Object.entries(parameters)) {
                    formData.append(key, value);
                }
                const response = await fetch(serverUrl, {
                    method,
                    headers,
                    body: method === "PUT" ? file : formData,
                    signal: upload.controller.signal,
                });
                if (!response.ok)
                    throw new Error(`HTTP error! status: ${response.status}`);
                this.notifyListeners("events", {
                    name: "completed",
                    id,
                    payload: { statusCode: response.status },
                });
                this.uploads.delete(id);
            }
            catch (error) {
                if (error.name === "AbortError")
                    return;
                if (upload.retries > 0) {
                    upload.retries--;
                    console.log(`Retrying upload (retries left: ${upload.retries})`);
                    setTimeout(() => this.doUpload(id, options), 1000);
                }
                else {
                    this.notifyListeners("events", {
                        name: "failed",
                        id,
                        payload: { error: error.message },
                    });
                    this.uploads.delete(id);
                }
            }
        }
        async getFileFromPath(filePath) {
            // This is a simplified version. In a real-world scenario,
            // you might need to handle different types of paths or use a file system API.
            try {
                const response = await fetch(filePath);
                const blob = await response.blob();
                return new File([blob], filePath.split("/").pop() || "file", {
                    type: blob.type,
                });
            }
            catch (error) {
                console.error("Error getting file:", error);
                return null;
            }
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UploaderWeb: UploaderWeb
    });

    exports.Uploader = Uploader;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
