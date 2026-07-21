import AppLayout from "./components/corpus/AppLayout";
import CommandDeck from "./pages/CommandDeck";
import AgentNetwork from "./pages/AgentNetwork";
import Negotiation from "./pages/Negotiation";
import Analytics from "./pages/Analytics";
import Ledger from "./pages/Ledger";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, name: "home", element: <CommandDeck /> },
      { path: "network", name: "network", element: <AgentNetwork /> },
      { path: "negotiation", name: "negotiation", element: <Negotiation /> },
      { path: "analytics", name: "analytics", element: <Analytics /> },
      { path: "ledger", name: "ledger", element: <Ledger /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
