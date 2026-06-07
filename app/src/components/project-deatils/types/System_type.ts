type CpuType = {
  manufacturer: string;
  brand: string;
  cores: number;
  physicalCores: number;
  speed: number;
  usage: string;
};

type GpuType = {
  model: string;
  vendor: string;
  vram: number;
};

type MemoryType = {
  total: string;
  used: string;
  free: string;
};

type DiskType = {
  device: string;
  type: string;
  name: string;
  vendor: string;
  size: number;
  bytesPerSector: number;
  totalCylinders: number;
  totalHeads: number;
  totalSectors: number;
  totalTracks: number;
  tracksPerCylinder: number;
  sectorsPerTrack: number;
  firmwareRevision: string;
  serialNum: string;
  interfaceType: string;
  smartStatus: string;
  temperature: string | null;
};

type OsType = {
  platform: string;
  distro: string;
  release: string;
};

type NetworkType = {
  iface: string;
  ifaceName: string;
  default: boolean;
  speed: number;
  type: string;
  operstate: string;
};

export interface SystemInfoType {
  cpu: CpuType;
  gpu: GpuType[];
  memory: MemoryType;
  disk: DiskType[];
  os: OsType;
  network: NetworkType[];
}