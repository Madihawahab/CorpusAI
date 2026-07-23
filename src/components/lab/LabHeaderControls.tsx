import { Shield, Wifi } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLabData } from "@/context/LabDataContext";

interface GraphLayerToggleProps {
  showShield: boolean;
  onShieldChange: (value: boolean) => void;
  showTelemetry: boolean;
  onTelemetryChange: (value: boolean) => void;
}

export function GraphLayerToggle({
  showShield,
  onShieldChange,
  showTelemetry,
  onTelemetryChange,
}: GraphLayerToggleProps) {
  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <Switch checked={showShield} onCheckedChange={onShieldChange} className="scale-75" />
        <Label className="text-[0.7rem] text-muted-foreground">Shield layer</Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={showTelemetry} onCheckedChange={onTelemetryChange} className="scale-75" />
        <Label className="text-[0.7rem] text-muted-foreground">Telemetry layer</Label>
      </div>
    </div>
  );
}

export function LabStatusTicker() {
  const { constitution, blocklistVersion, decisions } = useLabData();

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Wifi size={12} className="text-success" />
        Constitution v{constitution?.version ?? 1}
      </span>
      <span className="flex items-center gap-1.5">
        <Shield size={12} className="text-glow-cyan" />
        Blocklist v{blocklistVersion}
      </span>
      <span>{decisions.length} decisions logged</span>
    </div>
  );
}
