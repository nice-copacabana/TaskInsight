import React from "react";
import { useState, useEffect, useRef } from "react"
import {
  Check,
  Clock,
  Pause,
  Play,
  Plus,
  Trash,
  X,
  Brain,
  BarChart,
  Layers,
  Zap,
  Monitor,
  AlertTriangle,
  Settings,
  FileDown,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { SegmentedProgress } from "../components/segmented-progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { SettingsModal } from "../components/settings-modal"
import { AddTaskModal } from "../components/add-task-modal"
import { ExportReportModal } from "../components/export-report-modal"
import { useTheme } from "next-themes"
import { useToast } from "../hooks/use-toast"

// Monitored application type
interface MonitoredApp {
  name: string
  enabled: boolean
}

// Default system applications
const defaultSystemApplications: MonitoredApp[] = [
  { name: "Photoshop", enabled: true },
  { name: "Blender", enabled: true },
  { name: "VSCode", enabled: true },
  { name: "Chrome", enabled: true },
  { name: "Figma", enabled: true },
  { name: "Terminal", enabled: true },
]

// Icon mapping
type IconName = "zap" | "layers" | "chart";

// Task type definition
type Task = {
  id: string
  name: string
  icon: IconName
  status: "active" | "paused" | "completed" | "awaiting_verification"
  progress: number
  startTime: number
  totalTime: number
  lastUpdated: number
  read: boolean
  source: "manual" | "system"
  application?: string
  estimatedTime: number // in milliseconds
}

export default function TaskManagementPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [now, setNow] = useState(Date.now())
  const [autoMode, setAutoMode] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [exportReportOpen, setExportReportOpen] = useState(false)
  const [monitoredApps, setMonitoredApps] = useState<MonitoredApp[]>(defaultSystemApplications)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get enabled applications
  const enabledApps = monitoredApps.filter((app) => app.enabled).map((app) => app.name)

  // Initialize theme state
  useEffect(() => {
    // This ensures the component state matches the actual theme
    console.log("Current theme:", theme)
  }, [theme])

  // Update time every second for active tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "active") {
            return {
              ...task,
              totalTime: task.totalTime + (Date.now() - task.lastUpdated),
              lastUpdated: Date.now(),
            }
          }
          return task
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate system tasks being added and updated
  useEffect(() => {
    if (autoMode && enabledApps.length > 0) {
      // Simulate new tasks being added from system applications
      simulationIntervalRef.current = setInterval(() => {
        const shouldAddTask = Math.random() > 0.7 // 30% chance to add a task

        if (shouldAddTask) {
          const appIndex = Math.floor(Math.random() * enabledApps.length)
          const app = enabledApps[appIndex]
          const taskTypes = ["Rendering", "Processing", "Exporting", "Analyzing", "Building", "Downloading"]
          const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]

          // Generate random estimated time between 5 and 60 minutes
          const randomEstimatedMinutes = Math.floor(Math.random() * 55) + 5

          const newTask: Task = {
            id: `sys-${Date.now().toString()}`,
            name: `${taskType} in ${app}`,
            icon: ["zap", "layers", "chart"][Math.floor(Math.random() * 3)],
            status: "active",
            progress: 0,
            startTime: Date.now(),
            totalTime: 0,
            lastUpdated: Date.now(),
            read: false,
            source: "system",
            application: app,
            estimatedTime: randomEstimatedMinutes * 60 * 1000, // Convert to milliseconds
          }

          setTasks((prev) => [...prev, newTask])
        }

        // Randomly update progress of system tasks
        setTasks((prev) =>
          prev.map((task) => {
            if (task.source === "system" && task.status === "active") {
              // Randomly increase progress
              const newProgress = Math.min(100, task.progress + Math.floor(Math.random() * 10))

              // Randomly adjust estimated time (20% chance)
              let updatedEstimatedTime = task.estimatedTime
              if (Math.random() > 0.8) {
                const adjustment = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.3 + 0.1) // ±10-40%
                updatedEstimatedTime = Math.max(60000, task.estimatedTime * (1 + adjustment)) // Ensure at least 1 minute
              }

              // If task reaches 100%, mark as awaiting verification
              if (newProgress === 100) {
                return {
                  ...task,
                  progress: 100,
                  status: "awaiting_verification",
                  lastUpdated: Date.now(),
                  estimatedTime: updatedEstimatedTime,
                }
              }

              return {
                ...task,
                progress: newProgress,
                estimatedTime: updatedEstimatedTime,
              }
            }
            return task
          }),
        )
      }, 3000)

      // Simulate progress updates for system tasks more frequently
      progressIntervalRef.current = setInterval(() => {
        setTasks((prev) =>
          prev.map((task) => {
            if (task.source === "system" && task.status === "active") {
              // Small incremental progress
              const newProgress = Math.min(100, task.progress + Math.floor(Math.random() * 3))
              return { ...task, progress: newProgress }
            }
            return task
          }),
        )
      }, 1000)
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [autoMode, enabledApps])

  // Add simulation for auto-verification based on user activity
  useEffect(() => {
    if (autoMode && enabledApps.length > 0) {
      const autoVerificationInterval = setInterval(() => {
        // Simulate user opening related applications
        const openedApps = enabledApps.filter(() => Math.random() > 0.7)

        if (openedApps.length > 0) {
          setTasks((prev) =>
            prev.map((task) => {
              // Auto-verify tasks if the user opens the related application
              if (
                task.status === "awaiting_verification" &&
                task.application &&
                openedApps.includes(task.application)
              ) {
                toast({
                  title: "Task Auto-Verified",
                  description: `Task "${task.name}" was verified when you opened ${task.application}.`,
                })
                return { ...task, status: "completed", read: true, lastUpdated: Date.now() }
              }
              return task
            }),
          )
        }
      }, 10000) // Check every 10 seconds

      return () => clearInterval(autoVerificationInterval)
    }
  }, [autoMode, enabledApps, toast])

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement

    // Remove the old theme class
    root.classList.remove("light", "dark")

    // Add the new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Add a new task manually
  const addTask = (name: string, icon: string, estimatedTimeMinutes: number) => {
    const newTask: Task = {
      id: `manual-${Date.now().toString()}`,
      name: name,
      icon: icon as IconName,
      status: "active",
      progress: 0,
      startTime: Date.now(),
      totalTime: 0,
      lastUpdated: Date.now(),
      read: false,
      source: "manual",
      estimatedTime: estimatedTimeMinutes * 60 * 1000, // Convert minutes to milliseconds
    }

    setTasks([...tasks, newTask])
  }

  // Toggle task status between active and paused
  const toggleTaskStatus = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (task.status === "active") {
            return { ...task, status: "paused", lastUpdated: Date.now() }
          } else if (task.status === "paused") {
            return { ...task, status: "active", lastUpdated: Date.now() }
          }
        }
        return task
      }),
    )
  }

  // Mark task as completed
  const completeTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: "awaiting_verification", progress: 100, lastUpdated: Date.now() } : task,
      ),
    )
  }

  // Add a new function to verify and archive a task
  const verifyTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: "completed", read: true, lastUpdated: Date.now() } : task,
      ),
    )

    toast({
      title: "Task Verified",
      description: "Task has been verified and archived.",
    })
  }

  // Add a new function to mark a task as failed
  const markTaskAsFailed = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))

    toast({
      title: "Task Removed",
      description: "Failed task has been removed.",
    })
  }

  // Update task progress
  const updateProgress = (id: string, progress: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, progress } : task)))
  }

  // Remove task after it's been read
  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  // Mark completed task as read
  const markAsRead = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, read: true } : task)))
  }

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    return `${hours.toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  // Format date for reports
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      brain: Brain,
      chart: BarChart,
      layers: Layers,
      zap: Zap,
    }
    const IconComponent = iconMap[iconName] || Brain
    return <IconComponent className="h-5 w-5" />
  }

  // Export report
  const handleExportReport = (reportData: any, reportType: string, format: string) => {
    let content = ""
    let filename = `task-report-${reportType}-${new Date().toISOString().split("T")[0]}`

    if (format === "json") {
      content = JSON.stringify(reportData, null, 2)
      filename += ".json"

      // Create and download the file
      const blob = new Blob([content], { type: "application/json" })
      downloadFile(blob, filename)
    } else {
      // CSV format
      filename += ".csv"

      // Handle different report structures
      if (Array.isArray(reportData)) {
        // Flat list of tasks
        const headers = [
          "Name",
          "Status",
          "Progress",
          "Start Time",
          "Total Time",
          "Estimated Time",
          "Source",
          "Application",
        ]
        const rows = reportData.map((task) => [
          task.name,
          task.status,
          `${task.progress}%`,
          formatDate(task.startTime),
          formatTime(task.totalTime),
          formatTime(task.estimatedTime),
          task.source,
          task.application || "N/A",
        ])

        content = [headers, ...rows].map((row) => row.join(",")).join("\n")
      } else {
        // Grouped data
        const sections = []

        for (const [group, tasks] of Object.entries(reportData)) {
          sections.push(`Group: ${group}`)

          const headers = ["Name", "Status", "Progress", "Start Time", "Total Time", "Estimated Time", "Source"]
          sections.push(headers.join(","))

          const taskArray = tasks as Task[]
          taskArray.forEach((task) => {
            const row = [
              task.name,
              task.status,
              `${task.progress}%`,
              formatDate(task.startTime),
              formatTime(task.totalTime),
              formatTime(task.estimatedTime),
              task.source,
            ]
            sections.push(row.join(","))
          })

          sections.push("") // Empty line between groups
        }

        content = sections.join("\n")
      }

      // Create and download the file
      const blob = new Blob([content], { type: "text/csv" })
      downloadFile(blob, filename)
    }

    toast({
      title: "Report Exported",
      description: `${filename} has been downloaded.`,
    })
  }

  // Helper function to download a file
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter tasks by status
  const activeTasks = tasks.filter((t) => t.status === "active")
  const pausedTasks = tasks.filter((t) => t.status === "paused")
  const completedTasks = tasks.filter((t) => t.status === "completed")
  const awaitingVerificationTasks = tasks.filter((t) => t.status === "awaiting_verification")

  // Count monitored applications
  const enabledAppCount = monitoredApps.filter((app) => app.enabled).length
  const totalAppCount = monitoredApps.length

  const isLightTheme = resolvedTheme === "light"

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen text-foreground p-6 ${
          isLightTheme ? "bg-gradient-to-br from-blue-50 to-slate-100" : "bg-gradient-to-br from-slate-900 to-slate-800"
        }`}
      >
        <Card
          className={`border-border backdrop-blur-sm max-w-3xl mx-auto ${
            isLightTheme ? "bg-white shadow-sm" : "bg-slate-800/50"
          }`}
        >
          <CardHeader
            className={`border-b py-3 px-4 flex flex-row items-center justify-between ${
              isLightTheme ? "border-slate-200 bg-slate-50" : "border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain className={`h-4 w-4 ${isLightTheme ? "text-blue-600" : "text-cyan-400"}`} />
              <span className={`text-sm font-medium ${isLightTheme ? "text-slate-800" : "text-slate-200"}`}>
                Task Manager
              </span>
              {autoMode && (
                <Badge
                  variant="outline"
                  className={`text-[10px] ml-2 ${
                    isLightTheme
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-700/50 text-cyan-300 border-cyan-500/50"
                  }`}
                >
                  Monitoring {enabledAppCount}/{totalAppCount} Apps
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    isLightTheme
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-slate-700 text-green-300 border-green-500/50"
                  }`}
                >
                  {activeTasks.length} In Progress
                </Badge>
                {awaitingVerificationTasks.length > 0 && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      isLightTheme
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-slate-700 text-purple-300 border-purple-500/50"
                    }`}
                  >
                    {awaitingVerificationTasks.length} Pending
                  </Badge>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${
                      isLightTheme
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                    onClick={() => setExportReportOpen(true)}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Export Report</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${
                      isLightTheme
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                    onClick={() => setAddTaskOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Add Task</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${
                      isLightTheme
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Settings</TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Task tabs */}
            <Tabs defaultValue="active" className="w-full">
              <TabsList className={`grid grid-cols-4 ${isLightTheme ? "bg-slate-100" : "bg-slate-700/30"}`}>
                <TabsTrigger value="active">In Progress ({activeTasks.length})</TabsTrigger>
                <TabsTrigger value="paused">On Hold ({pausedTasks.length})</TabsTrigger>
                <TabsTrigger value="awaiting">Pending Review ({awaitingVerificationTasks.length})</TabsTrigger>
                <TabsTrigger value="completed">Archived ({completedTasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-2">
                <TaskList
                  tasks={activeTasks}
                  now={now}
                  toggleTaskStatus={toggleTaskStatus}
                  completeTask={completeTask}
                  updateProgress={updateProgress}
                  removeTask={removeTask}
                  markAsRead={markAsRead}
                  formatTime={formatTime}
                  getIconComponent={getIconComponent}
                  verifyTask={verifyTask}
                  markTaskAsFailed={markTaskAsFailed}
                  theme={resolvedTheme} // Use resolvedTheme instead of theme
                />
              </TabsContent>

              <TabsContent value="paused" className="mt-2">
                <TaskList
                  tasks={pausedTasks}
                  now={now}
                  toggleTaskStatus={toggleTaskStatus}
                  completeTask={completeTask}
                  updateProgress={updateProgress}
                  removeTask={removeTask}
                  markAsRead={markAsRead}
                  formatTime={formatTime}
                  getIconComponent={getIconComponent}
                  verifyTask={verifyTask}
                  markTaskAsFailed={markTaskAsFailed}
                  theme={resolvedTheme} // Use resolvedTheme instead of theme
                />
              </TabsContent>

              <TabsContent value="awaiting" className="mt-2">
                <TaskList
                  tasks={awaitingVerificationTasks}
                  now={now}
                  toggleTaskStatus={toggleTaskStatus}
                  completeTask={completeTask}
                  updateProgress={updateProgress}
                  removeTask={removeTask}
                  markAsRead={markAsRead}
                  formatTime={formatTime}
                  getIconComponent={getIconComponent}
                  verifyTask={verifyTask}
                  markTaskAsFailed={markTaskAsFailed}
                  theme={resolvedTheme} // Use resolvedTheme instead of theme
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-2">
                <TaskList
                  tasks={completedTasks}
                  now={now}
                  toggleTaskStatus={toggleTaskStatus}
                  completeTask={completeTask}
                  updateProgress={updateProgress}
                  removeTask={removeTask}
                  markAsRead={markAsRead}
                  formatTime={formatTime}
                  getIconComponent={getIconComponent}
                  verifyTask={verifyTask}
                  markTaskAsFailed={markTaskAsFailed}
                  theme={resolvedTheme} // Use resolvedTheme instead of theme
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Settings Modal */}
        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          theme={theme || "dark"}
          onThemeChange={(newTheme) => {
            console.log("Setting theme to:", newTheme)
            setTheme(newTheme)
          }}
          monitoredApps={monitoredApps}
          onMonitoredAppsChange={setMonitoredApps}
          autoMode={autoMode}
          onAutoModeChange={setAutoMode}
        />

        {/* Add Task Modal */}
        <AddTaskModal open={addTaskOpen} onOpenChange={setAddTaskOpen} onAddTask={addTask} />

        {/* Export Report Modal */}
        <ExportReportModal
          open={exportReportOpen}
          onOpenChange={setExportReportOpen}
          tasks={tasks}
          onExport={handleExportReport}
        />
      </div>
    </TooltipProvider>
  )
}

// Separate TaskList component for better organization
function TaskList({
  tasks,
  now,
  toggleTaskStatus,
  completeTask,
  updateProgress,
  removeTask,
  markAsRead,
  formatTime,
  getIconComponent,
  verifyTask,
  markTaskAsFailed,
  theme, // Add theme parameter
}) {
  const isLightTheme = theme === "light"

  // Update the TaskList component to show verification buttons for tasks awaiting verification
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {tasks.length === 0 ? (
        <div className={`text-center py-8 ${isLightTheme ? "text-slate-500 empty-state" : "text-slate-400"}`}>
          <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No tasks in this category.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.id}
            className={`
              task-card border-l-4 transition-all duration-200
              ${
                task.status === "active"
                  ? "border-l-green-500"
                  : task.status === "paused"
                    ? "border-l-amber-500"
                    : task.status === "awaiting_verification"
                      ? "border-l-purple-500"
                      : "border-l-cyan-500"
              }
              ${
                isLightTheme
                  ? task.status === "active"
                    ? "bg-green-50"
                    : task.status === "paused"
                      ? "bg-amber-50"
                      : task.status === "awaiting_verification"
                        ? "bg-purple-50"
                        : "bg-cyan-50"
                  : task.status === "active"
                    ? "bg-slate-700/40"
                    : task.status === "paused"
                      ? "bg-slate-700/30"
                      : task.status === "awaiting_verification"
                        ? "bg-slate-700/25"
                        : "bg-slate-700/20"
              }
              ${task.status === "completed" && task.read ? "opacity-60" : ""}
              ${task.source === "system" ? `border-r-2 ${isLightTheme ? "border-r-cyan-300/50" : "border-r-cyan-800/50"}` : ""}
            `}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      task-icon-container p-1.5 rounded-md
                      ${
                        isLightTheme
                          ? task.status === "active"
                            ? "bg-green-100 text-green-700"
                            : task.status === "paused"
                              ? "bg-amber-100 text-amber-700"
                              : task.status === "awaiting_verification"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-cyan-100 text-cyan-700"
                          : task.status === "active"
                            ? "bg-green-900/30 text-green-400"
                            : task.status === "paused"
                              ? "bg-amber-900/30 text-amber-400"
                              : task.status === "awaiting_verification"
                                ? "bg-purple-900/30 text-purple-400"
                                : "bg-cyan-900/30 text-cyan-400"
                      }
                    `}
                  >
                    {getIconComponent(task.icon)}
                  </div>
                  <div>
                    <span className={`font-medium task-header ${isLightTheme ? "text-slate-800" : ""}`}>
                      {task.name}
                    </span>
                    {task.source === "system" && task.application && (
                      <div className="flex items-center text-xs text-slate-500 mt-0.5">
                        <Monitor className="h-3 w-3 mr-1" />
                        <span>{task.application}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {task.status === "awaiting_verification" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 task-button rounded-full ${
                          isLightTheme
                            ? "text-green-600 hover:text-green-800 hover:bg-green-100"
                            : "text-green-400 hover:text-white hover:bg-green-800/50"
                        }`}
                        onClick={() => verifyTask(task.id)}
                        title="Verify and Archive"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 task-button rounded-full ${
                          isLightTheme
                            ? "text-red-600 hover:text-red-800 hover:bg-red-100"
                            : "text-red-400 hover:text-white hover:bg-red-800/50"
                        }`}
                        onClick={() => markTaskAsFailed(task.id)}
                        title="Mark as Failed"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : task.status !== "completed" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 task-button ${
                          isLightTheme
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        }`}
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        {task.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 task-button ${
                          isLightTheme
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        }`}
                        onClick={() => completeTask(task.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  ) : task.read ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 task-button ${
                        isLightTheme
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 task-button ${
                        isLightTheme
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                      onClick={() => markAsRead(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {task.status !== "completed" && task.status !== "awaiting_verification" && (
                <div className="mb-2 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`flex items-center gap-1 text-xs ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(task.totalTime)} / {formatTime(task.estimatedTime)}
                      </span>
                    </div>
                    <span className={`text-xs ${isLightTheme ? "text-slate-700" : "text-slate-300"}`}>
                      {task.progress}%
                    </span>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative w-full">
                        <SegmentedProgress
                          progress={task.progress}
                          estimatedTime={task.estimatedTime}
                          elapsedTime={task.totalTime}
                          isActive={task.status === "active"}
                          onChange={(value) => updateProgress(task.id, value)}
                          disabled={task.source === "system"}
                          className="w-full"
                        />

                        {task.totalTime > task.estimatedTime && (
                          <div className="absolute right-0 top-[-18px]">
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 h-4 flex items-center gap-0.5 ${
                                isLightTheme
                                  ? "bg-amber-100 text-amber-700 border-0"
                                  : "bg-amber-900/30 text-amber-400 border-0"
                              }`}
                            >
                              <AlertTriangle className="h-2.5 w-2.5" />
                              <span>Overdue</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {task.source === "system" ? "System task progress is automatic" : "Click to update progress"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  {(task.status === "completed" || task.status === "awaiting_verification") && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(task.totalTime)}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {task.source === "system" && (
                    <Badge
                      variant="outline"
                      className={`text-xs border-0 task-badge ${
                        isLightTheme ? "bg-blue-50 text-blue-700" : "bg-cyan-900/20 text-cyan-400"
                      }`}
                    >
                      System
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={`
                      text-xs border-0 task-badge
                      ${
                        isLightTheme
                          ? task.status === "active"
                            ? "bg-green-100 text-green-700"
                            : task.status === "paused"
                              ? "bg-amber-100 text-amber-700"
                              : task.status === "awaiting_verification"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-cyan-100 text-cyan-700"
                          : task.status === "active"
                            ? "bg-green-900/30 text-green-400"
                            : task.status === "paused"
                              ? "bg-amber-900/30 text-amber-400"
                              : task.status === "awaiting_verification"
                                ? "bg-purple-900/30 text-purple-400"
                                : "bg-cyan-900/30 text-cyan-400"
                      }
                    `}
                  >
                    {task.status === "active"
                      ? "In Progress"
                      : task.status === "paused"
                        ? "On Hold"
                        : task.status === "awaiting_verification"
                          ? "Pending Review"
                          : "Archived"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

