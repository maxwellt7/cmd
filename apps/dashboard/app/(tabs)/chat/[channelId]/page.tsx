import { notFound } from "next/navigation";
import Link from "next/link";
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
        {/* Mobile back button */}
        <div className="flex md:hidden items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Channels
          </Link>
        </div>
        <ChannelHeader channel={channel} />
        <MessageList messages={messages as ChatMessage[]} channelEmoji={channel.agentEmoji} />
        <MessageQueueStatus channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
}
