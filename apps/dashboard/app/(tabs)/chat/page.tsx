import { getChannels } from "../../actions/chat";
import { ChannelSidebar } from "../../../components/chat/channel-sidebar";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const channels = await getChannels();

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <ChannelSidebar channels={channels} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        {channels.length === 0 ? (
          <>
            <span className="text-5xl">{"\uD83D\uDCAC"}</span>
            <h1 className="text-xl font-semibold text-zinc-100">Welcome to Chat</h1>
            <p className="max-w-sm text-center text-sm text-zinc-500">
              Create your first agent channel to start sending messages. Click the{" "}
              <span className="font-medium text-zinc-400">+</span> button in the sidebar to get
              started.
            </p>
          </>
        ) : (
          <>
            <span className="text-4xl">{"\uD83D\uDC48"}</span>
            <h2 className="text-lg font-semibold text-zinc-200">Select a channel</h2>
            <p className="text-sm text-zinc-500">
              Pick a channel from the sidebar to view messages.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
