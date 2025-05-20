import { currentProfile } from "@/lib/current-profile";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = await params;

    if (!profile) {
      return new NextResponse("unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("server Id is missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(server)
  } catch (error) {
    console.log("[SERVER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
