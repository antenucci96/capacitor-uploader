import { registerPlugin } from "@capacitor/core";
const Uploader = registerPlugin("Uploader", {
    web: () => import("./web").then((m) => new m.UploaderWeb()),
});
export * from "./definitions";
export { Uploader };
//# sourceMappingURL=index.js.map