import React from "react"
import { useState } from "react"
import { Moon, Sun, MonitorIcon, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { useTheme } from "next-themes"
import { useToast } from "../hooks/use-toast"

interface MonitoredApp {
  name: string
  enabled: boolean
}

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: string
  onThemeChange: (theme: string) => void
  monitoredApps: MonitoredApp[]
  onMonitoredAppsChange: (apps: MonitoredApp[]) => void
  autoMode: boolean
  onAutoModeChange: (enabled: boolean) => void
}

export function SettingsModal({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  monitoredApps,
  onMonitoredAppsChange,
  autoMode,
  onAutoModeChange,
}: SettingsModalProps) {
  const [newApp, setNewApp] = useState("")
  const [activeTab, setActiveTab] = useState("appearance")
  const isLightTheme = theme === "light"

  const addApp = () => {
    if (newApp.trim() && !monitoredApps.some((app) => app.name === newApp.trim())) {
      onMonitoredAppsChange([...monitoredApps, { name: newApp.trim(), enabled: true }])
      setNewApp("")
    }
  }

  const removeApp = (appName: string) => {
    onMonitoredAppsChange(monitoredApps.filter((app) => app.name !== appName))
  }

  const toggleAppMonitoring = (appName: string) => {
    onMonitoredAppsChange(monitoredApps.map((app) => (app.name === appName ? { ...app, enabled: !app.enabled } : app)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[425px] ${isLightTheme ? "bg-white border-slate-200" : "bg-background border-border"}`}
      >
        <DialogHeader>
          <DialogTitle className={isLightTheme ? "text-slate-800" : "text-slate-100"}>Settings</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-2 ${isLightTheme ? "bg-slate-100" : "bg-slate-700/30"}`}>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className={`text-sm font-medium ${isLightTheme ? "text-slate-800" : ""}`}>Theme</h4>
              <RadioGroup value={theme} onValueChange={onThemeChange} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                    <MonitorIcon className="h-4 w-4" />
                    <span>System</span>
                  </Label>
                </div>
              </RadioGroup>

              <div className={`p-3 rounded-md border mt-4 ${isLightTheme ? "border-slate-200" : "border-border"}`}>
                <p className={`text-xs mb-2 ${isLightTheme ? "text-slate-600" : "text-muted-foreground"}`}>
                  Theme Preview
                </p>
                <div
                  className={`flex items-center gap-2 p-2 rounded-md ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"}`}
                >
                  <div className={`w-3 h-3 rounded-full ${theme === "dark" ? "bg-cyan-400" : "bg-cyan-600"}`}></div>
                  <span className={`text-sm ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    This is how text will appear
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <h4 className={`text-sm font-medium ${isLightTheme ? "text-slate-800" : ""}`}>System Monitoring</h4>
                <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                  Enable automatic task detection
                </p>
              </div>
              <Switch
                checked={autoMode}
                onCheckedChange={onAutoModeChange}
                className="data-[state=checked]:bg-cyan-600"
              />
            </div>

            <div className="space-y-2">
              <h4 className={`text-sm font-medium ${isLightTheme ? "text-slate-800" : ""}`}>Monitored Applications</h4>
              <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
                Tasks will be generated from enabled applications
              </p>

              <div className="flex items-center space-x-2">
                <Input
                  value={newApp}
                  onChange={(e) => setNewApp(e.target.value)}
                  placeholder="Add application..."
                  className={
                    isLightTheme
                      ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
                      : "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  }
                  onKeyDown={(e) => e.key === "Enter" && addApp()}
                />
                <Button onClick={addApp} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {monitoredApps.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                    No applications added
                  </p>
                ) : (
                  monitoredApps.map((app) => (
                    <div
                      key={app.name}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        isLightTheme
                          ? app.enabled
                            ? "bg-blue-50/50"
                            : "bg-slate-50/50"
                          : app.enabled
                            ? "bg-slate-700/30"
                            : "bg-slate-700/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MonitorIcon
                          className={`h-4 w-4 ${
                            isLightTheme
                              ? app.enabled
                                ? "text-blue-600"
                                : "text-slate-400"
                              : app.enabled
                                ? "text-cyan-400"
                                : "text-slate-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isLightTheme
                              ? app.enabled
                                ? "text-slate-800"
                                : "text-slate-500"
                              : app.enabled
                                ? "text-white"
                                : "text-slate-400"
                          }`}
                        >
                          {app.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 ${
                            isLightTheme
                              ? app.enabled
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              : app.enabled
                                ? "text-green-400 hover:text-green-300"
                                : "text-slate-500 hover:text-slate-300"
                          } hover:bg-slate-700`}
                          onClick={() => toggleAppMonitoring(app.name)}
                          title={app.enabled ? "Disable monitoring" : "Enable monitoring"}
                        >
                          {app.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 ${
                            isLightTheme
                              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              : "text-slate-400 hover:text-white hover:bg-slate-700"
                          }`}
                          onClick={() => removeApp(app.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={
              isLightTheme
                ? "text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                : "text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onThemeChange(theme)
              onOpenChange(false)
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

