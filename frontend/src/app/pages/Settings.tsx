import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { 
  Settings as SettingsIcon, 
  Key, 
  Shield, 
  Bell, 
  Palette,
  Database,
  Save
} from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Configure your Vormetric Tokenization Server preferences
        </p>
      </div>

      {/* API Configuration */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">API Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-endpoint" className="text-slate-300">
              API Endpoint
            </Label>
            <Input
              id="api-endpoint"
              value="https://vts.thales.com/api/v1"
              className="mt-2 bg-slate-800 border-slate-700 text-white"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="api-key" className="text-slate-300">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value="sk_live_abc123xyz789"
              className="mt-2 bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              Keep your API key secret. Never expose it in client-side code.
            </p>
          </div>
        </div>
      </Card>

      {/* Tokenization Policies */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Tokenization Policies</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Format-Preserving Encryption</p>
              <p className="text-sm text-slate-400">Maintain data format in tokens</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Auto-Masking</p>
              <p className="text-sm text-slate-400">
                Automatically generate masked values
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Token Expiration</p>
              <p className="text-sm text-slate-400">Enable time-based token expiry</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Security Alerts</p>
              <p className="text-sm text-slate-400">
                Notify on suspicious activity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">API Usage Alerts</p>
              <p className="text-sm text-slate-400">
                Alert when approaching rate limits
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">System Updates</p>
              <p className="text-sm text-slate-400">
                Notifications about new features
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Palette className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-sm text-slate-400">Use dark theme</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Compact View</p>
              <p className="text-sm text-slate-400">Reduce spacing and padding</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Data Retention */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Data Retention</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="log-retention" className="text-slate-300">
              Activity Log Retention (days)
            </Label>
            <Input
              id="log-retention"
              type="number"
              value="90"
              className="mt-2 bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              How long to retain tokenization activity logs
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
