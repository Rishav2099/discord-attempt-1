import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) => {
  const profile = await currentProfile();
  const { serverId } = await params;

  if (!profile) {
    return redirect("/sign-in");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="w-60 hidden z-20 md:left-[65px] flex-col inset-y-0 fixed md:flex ">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="md:pl-56">{children}</main>
    </div>
  );
};

export default layout;
