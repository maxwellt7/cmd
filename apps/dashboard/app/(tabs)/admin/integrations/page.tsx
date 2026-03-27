import { getIntegrationStatuses } from "../../../actions/admin";
import { IntegrationCard } from "../../../../components/admin/integration-card";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const integrations = await getIntegrationStatuses();

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Integrations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {connectedCount} of {integrations.length} integrations connected
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">
          Environment Variables
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          Integration status is derived from the presence of environment
          variables. Configure these in your deployment environment.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              key: "RELAY_URL",
              desc: "OpenClaw Relay WebSocket endpoint",
            },
            {
              key: "NOTION_API_KEY",
              desc: "Notion API integration token",
            },
            {
              key: "DATABASE_URL",
              desc: "PostgreSQL connection string (Neon)",
            },
          ].map((env) => {
            const isSet = integrations.find(
              (i) =>
                (i.name === "OpenClaw Relay" && env.key === "RELAY_URL") ||
                (i.name === "Notion Sync" && env.key === "NOTION_API_KEY") ||
                (i.name === "Database" && env.key === "DATABASE_URL")
            )?.connected;

            return (
              <div
                key={env.key}
                className="flex items-center justify-between rounded-lg bg-zinc-950/50 px-4 py-3"
              >
                <div>
                  <code className="text-xs font-medium text-zinc-300">
                    {env.key}
                  </code>
                  <p className="text-xs text-zinc-600">{env.desc}</p>
                </div>
                <span
                  className={`text-xs font-medium ${isSet ? "text-emerald-400" : "text-zinc-600"}`}
                >
                  {isSet ? "Set" : "Not set"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
