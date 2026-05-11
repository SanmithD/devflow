import si from 'systeminformation';

export class SystemInfoRepository {

    getSystemConfiguration = async (): Promise<{
        data: any | null;
        success: boolean;
        message: string;
    }> => {

        try {

            const [
                cpu,
                graphics,
                memory,
                currentLoad,
                disk,
                os,
                network
            ] = await Promise.all([
                si.cpu(),
                si.graphics(),
                si.mem(),
                si.currentLoad(),
                si.diskLayout(),
                si.osInfo(),
                si.networkInterfaces()
            ]);

            return {
                data: {
                    cpu: {
                        manufacturer: cpu.manufacturer,
                        brand: cpu.brand,
                        cores: cpu.cores,
                        physicalCores: cpu.physicalCores,
                        speed: cpu.speed,
                        usage: currentLoad.currentLoad.toFixed(2) + '%'
                    },

                    gpu: graphics.controllers.map(gpu => ({
                        model: gpu.model,
                        vendor: gpu.vendor,
                        vram: gpu.vram
                    })),

                    memory: {
                        total: `${(memory.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        used: `${(memory.used / 1024 / 1024 / 1024).toFixed(2)} GB`,
                        free: `${(memory.free / 1024 / 1024 / 1024).toFixed(2)} GB`
                    },

                    disk,

                    os: {
                        platform: os.platform,
                        distro: os.distro,
                        release: os.release
                    },

                    network
                },

                success: true,
                message: 'System information fetched successfully'
            };

        } catch (error) {

            console.log('system server error', error);

            return {
                data: null,
                success: false,
                message: 'Server error'
            };
        }
    };
}