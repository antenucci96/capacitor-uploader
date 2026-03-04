import { WebPlugin } from "@capacitor/core";
import type { UploaderPlugin, uploadOption } from "./definitions";
export declare class UploaderWeb extends WebPlugin implements UploaderPlugin {
    private uploads;
    startUpload(options: uploadOption): Promise<{
        id: string;
    }>;
    removeUpload(options: {
        id: string;
    }): Promise<void>;
    private doUpload;
    private getFileFromPath;
}
