import { DynamicTool } from "@langchain/core/tools";
import si from 'systeminformation';

export const systemInfoTool = new DynamicTool({
    name: 'system_info',
    description: 'Use this tool to get user system configuration details or information',

    func: async (input: string) => {
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

             return JSON.stringify({
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
            });
        } catch (error) {
            console.log('fail to get system', error);
            return "Unable to get system info";
        }
    }
})