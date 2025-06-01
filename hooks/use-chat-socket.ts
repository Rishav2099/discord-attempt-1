import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { InfiniteData } from "@tanstack/react-query";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  deleteKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

interface FetchMessagesResponse {
  items: MessageWithMemberWithProfile[];
  nextCursor?: string;
}

export const useChatSocket = ({
  addKey,
  updateKey,
  deleteKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<FetchMessagesResponse>>(
        [queryKey],
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          const newData = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item: MessageWithMemberWithProfile) =>
              item.id === message.id ? message : item
            ),
          }));

          return {
            ...oldData,
            pages: newData,
          };
        }
      );
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData<FetchMessagesResponse>>(
        [queryKey],
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return {
              pages: [
                {
                  items: [message],
                  nextCursor: undefined,
                },
              ],
              pageParams: [], // Add pageParams
            };
          }

          const newData = [...oldData.pages];
          newData[0] = {
            ...newData[0],
            items: [message, ...newData[0].items],
          };

          return {
            ...oldData,
            pages: newData,
          };
        }
      );
    });

    socket.on(deleteKey, (data: { id: string }) => {
      queryClient.setQueryData<InfiniteData<FetchMessagesResponse>>(
        [queryKey],
        (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          const newData = oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter((item: MessageWithMemberWithProfile) => item.id !== data.id),
          }));

          return {
            ...oldData,
            pages: newData,
          };
        }
      );
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
      socket.off(deleteKey);
    };
  }, [queryClient, addKey, updateKey, deleteKey, queryKey, socket]);
};