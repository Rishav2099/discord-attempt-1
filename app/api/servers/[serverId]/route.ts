import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
   try {
     const profile = await currentProfile()
     const {serverId} = await params;
     const {name} = await req.json();
 
     if(!profile) {
         return new NextResponse('[unauthorized]', {status: 401})
     }

     const server = await db.server.update({
        where: {
            id: serverId,
            profileId: profile.id
        },
        data: {
            name
        }
     })

     return NextResponse.json(server)
   } catch (error) {
    console.log('[Server_id_patch]');
    return new NextResponse('internal error', {status: 500})
   }
}
