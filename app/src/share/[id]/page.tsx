import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/db";
import SharePageClient from "./SharePageClient";

const OG_IMAGE = "https://res.cloudinary.com/dosufm3su/image/upload/v1778859637/devflow-logo_klg4y9.png";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const id = Number(params.id);
    const shared = await prisma.aILog.findUnique({ where: { id } });
    if (!shared) return {};
    const preview = shared.response.slice(0, 120);
    return {
        title: "DevFlow — Shared Response",
        description: preview,
        openGraph: {
            title: "DevFlow",
            description: preview,
            images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
        },
        twitter: { card: "summary_large_image", images: [OG_IMAGE] },
    };
}

export default async function SharePage({ params }: { params: { id: string } }) {
    const id = Number(params.id);
    const shared = await prisma.aILog.findUnique({ where: { id } });
    if (!shared) notFound();
    return <SharePageClient text={shared.response} createdAt={shared.createdAt.toISOString()} />;
}