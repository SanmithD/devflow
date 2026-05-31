import * as fs from 'fs';
import * as os from 'os';
import path from "path";
import { parseMediaFiles } from '../api/ai/rag/ingestion/parse_media_files';
import { prisma } from '../src/lib/db';
import { MediaMetadata } from '../src/types/chat.type';

export class UploadRepository {
    uploadMediaFiles = async (file: File, projectId: number): Promise<MediaMetadata | null> => {
        try {

            console.log('file', JSON.stringify(file));

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // get extention
            const ext = path.extname(file.name).replace(".", "").toLocaleLowerCase() || "bin";
            const fileName = `upload_${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
            const temPath = path.join(os.tmpdir(), fileName);

            fs.writeFileSync(temPath, buffer);

            const media_metadata: MediaMetadata = {
                url: temPath,       // local temp path, used by parseMediaFiles directly
                format: ext,
                size: file.size,
                name: file.name,
                type: file.type,
            };

            let project_id = projectId;

            if (!project_id) {
                const lastProject = await prisma.project.findFirst({
                    orderBy: { id: "desc" },
                });

                project_id = lastProject ? lastProject.id + 1 : 1;
            }

            console.log('meta_data_2', media_metadata);

            await parseMediaFiles({
                localPath: media_metadata.url,
                format: media_metadata.format,
                projectId: project_id,
                file_name: media_metadata.name
            })

            console.log('meta data', media_metadata);

            return media_metadata;
        } catch (error) {
            console.log('error', error);
            return null
        }
    }
}