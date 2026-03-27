import { notFound } from "next/navigation";
import { getChannels, getMessages } from "../../../actions/chat";
import { ChannelSidebar } from "../../../../components/chat/channel-sidebar";
import { ChannelHeader } from "../../../../components/chat/channel-header";
import { MessageList } from "../../../../components/chat/message-list";
import { MessageInput } from "../../../../components/chat/message-input";
import { MessageQueueStatus } from "../../../../components/chat/message-queue-status";
import type { ChatMessage } from "@cmd/types";

export const dynamic = "force-dynamic";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;

  const [channels, messages] = await Promise.all([
    getChannels(),
    getMessages(channelId),
  ]);

  const channel = channels.find((c) => c.id === channelId);

  if (!channel) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <ChannelSidebar channels={channels} />
      <div className="flex flex-1 flex-col bg-[#0a0a0a]">
        <ChannelHeader channel={channel} />
        <MessageList messages={messages as ChatMessage[]} channelEmoji={channel.agentEmoji} />
        <MessageQueueStatus channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
}
