"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { SystemInfoType } from "../types/System_type";

// helpers

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  return (bytes / 1e9).toFixed(0) + " GB";
}

function getBarColor(pct: number): string {
  if (pct > 85) return "#E24B4A";
  if (pct > 60) return "#EF9F27";
  return "#1D9E75";
}

function parsePct(usage: string): number {
  return parseFloat(usage) || 0;
}

function parseGB(val: string): number {
  return parseFloat(val) || 0;
}

// Cards

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        bg-(--color-background-primary)
        border
        border-(--color-border-tertiary)
        rounded-xl
        p-4
        h-full
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Card Lable

function CardLabel({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
        mb-2.5
        text-[11px]
        font-medium
        tracking-wider
        uppercase
        text-(--color-text-secondary)
      "
    >
      <i className={`ti ${icon} text-[14px]`} />
      {children}
    </div>
  );
}

// MiniGrid

function MiniGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="
            bg-(--color-background-secondary)
            rounded-md
            px-3
            py-2
          "
        >
          <div
            className="
              text-[11px]
              text-(--color-text-secondary)
            "
          >
            {it.label}
          </div>

          <div
            className="
              text-[13px]
              font-medium
              mt-0.5
              text-(--color-text-primary)
              wrap-break-word
            "
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// Bar Meter

function BarMeter({ pct }: { pct: number }) {
  const color = getBarColor(pct);

  return (
    <div
      className="
        h-1.25
        rounded-full
        overflow-hidden
        mt-3
        bg-(--color-background-secondary)
      "
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  );
}

// Status Chip

function StatusChip({ ok }: { ok: boolean }) {
  return (
    <span
      className={`
        inline-block
        text-[11px]
        px-2
        py-0.5
        rounded-full
        font-medium
        ${
          ok
            ? "bg-green-100 text-green-700"
            : "bg-(--color-background-secondary) text-(--color-text-secondary)"
        }
      `}
    >
      {ok ? "OK" : "—"}
    </span>
  );
}

/* ───────────────── Sparkline ───────────────── */

function Sparkline({
  data,
  color,
  height = 80,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (data.length < 2) return;

    const min = 0;
    const max = 100;

    const range = max - min || 1;

    const step = w / (data.length - 1);

    ctx.beginPath();

    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);

    ctx.closePath();

    ctx.fillStyle = color + "18";
    ctx.fill();
  }, [data, color]);

  return (
    <canvas
      ref={ref}
      width={600}
      height={height}
      className="w-full mt-3 block"
      style={{ height }}
    />
  );
}

// CPU Card
function CpuCard({
  cpu,
}: {
  cpu: SystemInfoType["cpu"];
}) {

  const pct = parsePct(cpu.usage);

  const color = getBarColor(pct);

  const [cpuHistory, setCpuHistory] =
    useState<number[]>(
      () => Array(40).fill(0)
    );

  useEffect(() => {

    const frame =
      requestAnimationFrame(() => {

        setCpuHistory((prev) => [

          ...prev.slice(1),

          pct,

        ]);

      });

    return () =>
      cancelAnimationFrame(frame);

  }, [pct]);

  return (
    <Card>

      <CardLabel icon="ti-cpu">
        CPU
      </CardLabel>

      <div
        className="
          text-[24px]
          font-semibold
          leading-none
          text-(--color-text-primary)
        "
      >
        {cpu.usage}
      </div>

      <div
        className="
          text-[12px]
          mt-1
          text-(--color-text-secondary)
        "
      >
        {cpu.brand}
      </div>

      <BarMeter pct={pct} />

      <MiniGrid
        items={[
          {
            label: "Manufacturer",
            value: cpu.manufacturer,
          },
          {
            label: "Cores",
            value: String(cpu.cores),
          },
          {
            label: "Speed",
            value: `${cpu.speed} GHz`,
          },
          {
            label: "Physical",
            value: String(cpu.physicalCores),
          },
        ]}
      />

      <Sparkline
        data={cpuHistory}
        color={color}
      />

    </Card>
  );
}

// Memory Card

function MemoryCard({ memory }: { memory: SystemInfoType["memory"] }) {
  const total = parseGB(memory.total);

  const used = parseGB(memory.used);

  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <Card>
      <CardLabel icon="ti-database">Memory</CardLabel>

      <div
        className="
          text-[24px]
          font-semibold
          leading-none
          text-(--color-text-primary)
        "
      >
        {memory.used}
      </div>

      <div
        className="
          text-[12px]
          mt-1
          text-(--color-text-secondary)
        "
      >
        of {memory.total} total
      </div>

      <BarMeter pct={pct} />

      <div className="flex justify-between mt-3 text-[13px]">
        <span className="text-(--color-text-secondary)">Free</span>

        <span className="font-medium text-(--color-text-primary)">
          {memory.free}
        </span>
      </div>

      <div className="flex justify-between mt-1 text-[13px]">
        <span className="text-(--color-text-secondary)">Usage</span>

        <span
          className="font-medium"
          style={{
            color: getBarColor(pct),
          }}
        >
          {pct}%
        </span>
      </div>
    </Card>
  );
}

// GPU Card

function GpuCard({ gpu }: { gpu: SystemInfoType["gpu"] }) {
  const g = gpu[0];

  if (!g) return null;

  return (
    <Card>
      <CardLabel icon="ti-device-desktop">GPU</CardLabel>

      <div
        className="
          text-[14px]
          font-medium
          leading-6
          text-(--color-text-primary)
        "
      >
        {g.model}
      </div>

      <div
        className="
          text-[12px]
          mt-1
          text-(--color-text-secondary)
        "
      >
        {g.vendor}
      </div>

      <div
        className="
          h-px
          my-3
          bg-(--color-border-tertiary)
        "
      />

      <div className="flex justify-between text-[13px]">
        <span className="text-(--color-text-secondary)">VRAM</span>

        <span className="font-medium text-(--color-text-primary)">
          {g.vram} MB
        </span>
      </div>
    </Card>
  );
}

// Disk card

function DiskCard({ disk }: { disk: SystemInfoType["disk"] }) {
  const d = disk[0];

  if (!d) return null;

  return (
    <Card>
      <CardLabel icon="ti-disc">Disk</CardLabel>

      <div
        className="
          text-[14px]
          font-medium
          mb-2
          text-(--color-text-primary)
        "
      >
        {d.name}
      </div>

      <MiniGrid
        items={[
          {
            label: "Type",
            value: d.type,
          },
          {
            label: "Interface",
            value: d.interfaceType,
          },
          {
            label: "Size",
            value: formatBytes(d.size),
          },
          {
            label: "Serial",
            value: d.serialNum,
          },
          {
            label: "Firmware",
            value: d.firmwareRevision,
          },
          {
            label: "Bytes/Sector",
            value: String(d.bytesPerSector),
          },
        ]}
      />

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[12px] text-(--color-text-secondary)">
          SMART Status
        </span>

        <StatusChip ok={d.smartStatus === "Ok"} />
      </div>
    </Card>
  );
}

// OS Card

function OsCard({ os }: { os: SystemInfoType["os"] }) {
  return (
    <Card>
      <CardLabel icon="ti-brand-windows">Operating System</CardLabel>

      <div
        className="
          text-[15px]
          font-medium
          leading-6
          text-(--color-text-primary)
        "
      >
        {os.distro}
      </div>

      {[
        {
          label: "Platform",
          value: os.platform,
        },
        {
          label: "Release",
          value: os.release,
        },
      ].map((row) => (
        <div
          key={row.label}
          className="
            flex
            justify-between
            mt-3
            text-[13px]
          "
        >
          <span className="text-(--color-text-secondary)">{row.label}</span>

          <span className="font-medium text-(--color-text-primary)">
            {row.value}
          </span>
        </div>
      ))}
    </Card>
  );
}

// Network Card

function NetworkCard({ network }: { network: SystemInfoType["network"] }) {
  return (
    <Card>
      <CardLabel icon="ti-wifi">Network</CardLabel>

      <div className="space-y-3">
        {network.map((n, i) => (
          <div key={n.iface}>
            {i > 0 && (
              <div
                className="
                  h-px
                  mb-3
                  bg-(--color-border-tertiary)
                "
              />
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                  style={{
                    background:
                      n.operstate === "up"
                        ? "#1D9E75"
                        : "var(--color-border-tertiary)",
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="
                        text-[13px]
                        font-medium
                        text-(--color-text-primary)
                      "
                    >
                      {n.iface}
                    </span>

                    {n.default && (
                      <span
                        className="
                          text-[10px]
                          px-2
                          py-px
                          rounded-full
                          bg-green-100
                          text-green-700
                          font-medium
                        "
                      >
                        default
                      </span>
                    )}
                  </div>

                  <span
                    className="
                      text-[11px]
                      block
                      mt-0.5
                      text-(--color-text-secondary)
                    "
                  >
                    {n.type}
                    {n.speed ? ` · ${n.speed} Mb` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Main Component

function SystemInfo({ isActive }: { isActive: boolean }) {
  const [data, setData] = useState<SystemInfoType | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let mounted = true;

    const poll = async () => {
      try {
        const response = await axios.get("/api/system");

        if (!mounted) return;

        requestAnimationFrame(() => {
          setData(response.data.data);

          setError(null);
        });
      } catch (err) {
        console.log(err);

        requestAnimationFrame(() => {
          setError("Failed to fetch system data");
        });
      }
    };

    poll();

    const interval = setInterval(poll, 3000);

    return () => {
      mounted = false;

      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div className="py-4 px-2 sm:px-0 font-sans max-w-full overflow-hidden">
      {/* ERROR */}

      {error && (
        <div
          className="
            px-4
            py-3
            rounded-md
            text-sm
            mb-4
            bg-red-100
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* LOADING */}

      {!data && !error && (
        <div
          className="
            text-center
            py-12
            text-sm
            text-(--color-text-secondary)
          "
        >
          Loading system information...
        </div>
      )}

      {/* DASHBOARD */}

      {data && (
        <div className="space-y-3 sm:space-y-4">
          {/* TOP GRID - CPU & Memory & GPU */}

          <div className="flex flex-col w-full h-fit gap-2">
            {/* CPU - Takes 2 columns on larger screens */}
            <div className="sm:col-span-2">
              <CpuCard cpu={data.cpu} />
            </div>

            {/* Memory - Full width on mobile, 1 col on tablet+ */}
            <div className="sm:col-span-1">
              <MemoryCard memory={data.memory} />
            </div>

            {/* GPU - Full width on mobile, 1 col on tablet+ */}
            <div className="sm:col-span-1">
              <GpuCard gpu={data.gpu} />
            </div>
          </div>

          {/* BOTTOM GRID - Disk, OS, Network */}

          <div className="flex flex-col w-full gap-2.5 h-fit">
            <DiskCard disk={data.disk} />

            <OsCard os={data.os} />

            <NetworkCard network={data.network} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemInfo;
