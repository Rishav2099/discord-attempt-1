import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req :NextRequest, {params} : {params: Promise<{channelId: string}>}) {
    try {
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);
        const {channelId} = await params;

        const serverId = searchParams.get('serverId')

        if(!profile) {
            return new NextResponse('Unauthorized', {status: 401})
        }

        if(!serverId) {
            return new NextResponse('Server id missing', {status: 400})
        }

        if(!channelId) {
            return new NextResponse('channel id missing', {status: 400})
        }

        const server = await db.server.update({
          where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id,
                    role: {
                        in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                    }
                }
            }
          },
          data: {
            channels: {
                delete: {
                    id: channelId,
                    name: {
                        not: 'general'
                    }
                }
            }
          }
        });

        return NextResponse.json(server)

    } catch (error) {
        console.log('[CHANNEL_ID_DELETE]', error);
        return new NextResponse('Internal Error', {status: 500})
    }
}