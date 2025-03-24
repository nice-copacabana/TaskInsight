"use client"

import React from "react"
import { useState } from "react"
import { Download, Calendar, BarChart3, Filter } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Checkbox } from "./ui/checkbox"
import { useTheme } from "next-themes"
import { useToast } from "../hooks/use-toast"

interface ExportReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: any[]
  onExport: (reportData: any, reportType: string, format: string) => void
}

export function ExportReportModal({ open, onOpenChange, tasks, onExport }: ExportReportModalProps) {
  const [reportType, setReportType] = useState("completed")
  const [timeRange, setTimeRange] = useState("all")
  const [groupBy, setGroupBy] = useState("none")
  const [fileFormat, setFileFormat] = useState("csv")
  const { resolvedTheme } = useTheme()
  const isLightTheme = resolvedTheme === "light"

  const [includeFields, setIncludeFields] = useState({
    name: true,
    status: true,
    progress: true,
    startTime: true,
    completionTime: true,
    totalTime: true,
    estimatedTime: true,
    source: true,
    application: true,
  })

  const handleExport = () => {
    // Filter tasks based on report type
    let filteredTasks = [...tasks]

    if (reportType === "completed") {
      filteredTasks = tasks.filter((task) => task.status === "completed")
    } else if (reportType === "awaiting_verification") {
      filteredTasks = tasks.filter((task) => task.status === "awaiting_verification")
    } else if (reportType === "active") {
      filteredTasks = tasks.filter((task) => task.status === "active" || task.status === "paused")
    } else if (reportType === "overdue") {
      filteredTasks = tasks.filter((task) => task.totalTime > task.estimatedTime)
    }

    // Apply time range filter
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    if (timeRange === "today") {
      const startOfDay = new Date().setHours(0, 0, 0, 0)
      filteredTasks = filteredTasks.filter((task) => task.startTime >= startOfDay)
    } else if (timeRange === "week") {
      const startOfWeek = now - 7 * dayInMs
      filteredTasks = filteredTasks.filter((task) => task.startTime >= startOfWeek)
    } else if (timeRange === "month") {
      const startOfMonth = now - 30 * dayInMs
      filteredTasks = filteredTasks.filter((task) => task.startTime >= startOfMonth)
    }

    // Process data based on grouping
    let reportData: any = filteredTasks

    if (groupBy === "application") {
      const groupedData: Record<string, any[]> = {}

      filteredTasks.forEach((task) => {
        const appName = task.application || "Manual"
        if (!groupedData[appName]) {
          groupedData[appName] = []
        }
        groupedData[appName].push(task)
      })

      reportData = groupedData
    } else if (groupBy === "status") {
      const groupedData: Record<string, any[]> = {}

      filteredTasks.forEach((task) => {
        if (!groupedData[task.status]) {
          groupedData[task.status] = []
        }
        groupedData[task.status].push(task)
      })

      reportData = groupedData
    } else if (groupBy === "source") {
      const groupedData: Record<string, any[]> = {
        system: [],
        manual: [],
      }

      filteredTasks.forEach((task) => {
        groupedData[task.source].push(task)
      })

      reportData = groupedData
    }

    // Generate and download the report
    onExport(reportData, reportType, fileFormat)
    onOpenChange(false)
  }

  const toggleField = (field: string) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] ${isLightTheme ? "bg-white border-slate-200" : "bg-background border-border"}`}
      >
        <DialogHeader>
          <DialogTitle className={isLightTheme ? "text-slate-800" : "text-slate-100"}>Export Task Report</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="type" className="w-full">
          <TabsList className={`grid grid-cols-3 ${isLightTheme ? "bg-slate-100" : "bg-slate-700/30"}`}>
            <TabsTrigger value="type" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Type</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Time Range</span>
            </TabsTrigger>
            <TabsTrigger value="format" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>Format</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className={isLightTheme ? "text-slate-700" : ""}>Report Type</Label>
              <RadioGroup value={reportType} onValueChange={setReportType} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className={isLightTheme ? "text-slate-700" : ""}>
                    All Tasks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="awaiting_verification" id="awaiting_verification" />
                  <Label htmlFor="awaiting_verification" className={isLightTheme ? "text-slate-700" : ""}>
                    Pending Review
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className={isLightTheme ? "text-slate-700" : ""}>
                    Archived Tasks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className={isLightTheme ? "text-slate-700" : ""}>
                    In Progress
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paused" id="paused" />
                  <Label htmlFor="paused" className={isLightTheme ? "text-slate-700" : ""}>
                    On Hold
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overdue" id="overdue" />
                  <Label htmlFor="overdue" className={isLightTheme ? "text-slate-700" : ""}>
                    Overdue Tasks
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className={isLightTheme ? "text-slate-700" : ""}>Time Range</Label>
              <RadioGroup value={timeRange} onValueChange={setTimeRange} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="time-all" />
                  <Label htmlFor="time-all" className={isLightTheme ? "text-slate-700" : ""}>
                    All Time
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today" className={isLightTheme ? "text-slate-700" : ""}>
                    Today
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week" className={isLightTheme ? "text-slate-700" : ""}>
                    Last 7 Days
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month" className={isLightTheme ? "text-slate-700" : ""}>
                    Last 30 Days
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="format" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={isLightTheme ? "text-slate-700" : ""}>Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger
                    className={
                      isLightTheme
                        ? "bg-slate-50 border-slate-200 text-slate-800"
                        : "bg-slate-700/50 border-slate-600 text-white"
                    }
                  >
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent
                    className={isLightTheme ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}
                  >
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="source">Source (System/Manual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isLightTheme ? "text-slate-700" : ""}>File Format</Label>
                <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className={isLightTheme ? "text-slate-700" : ""}>
                      CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className={isLightTheme ? "text-slate-700" : ""}>
                      JSON
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className={isLightTheme ? "text-slate-700" : ""}>Include Fields</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="name" checked={includeFields.name} onCheckedChange={() => toggleField("name")} />
                    <Label htmlFor="name" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Task Name
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status"
                      checked={includeFields.status}
                      onCheckedChange={() => toggleField("status")}
                    />
                    <Label htmlFor="status" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Status
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="progress"
                      checked={includeFields.progress}
                      onCheckedChange={() => toggleField("progress")}
                    />
                    <Label htmlFor="progress" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Progress
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="startTime"
                      checked={includeFields.startTime}
                      onCheckedChange={() => toggleField("startTime")}
                    />
                    <Label htmlFor="startTime" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Start Time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="completionTime"
                      checked={includeFields.completionTime}
                      onCheckedChange={() => toggleField("completionTime")}
                    />
                    <Label htmlFor="completionTime" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Completion Time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="totalTime"
                      checked={includeFields.totalTime}
                      onCheckedChange={() => toggleField("totalTime")}
                    />
                    <Label htmlFor="totalTime" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Total Time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="estimatedTime"
                      checked={includeFields.estimatedTime}
                      onCheckedChange={() => toggleField("estimatedTime")}
                    />
                    <Label htmlFor="estimatedTime" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Estimated Time
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="source"
                      checked={includeFields.source}
                      onCheckedChange={() => toggleField("source")}
                    />
                    <Label htmlFor="source" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Source
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="application"
                      checked={includeFields.application}
                      onCheckedChange={() => toggleField("application")}
                    />
                    <Label htmlFor="application" className={`text-sm ${isLightTheme ? "text-slate-700" : ""}`}>
                      Application
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
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
          <Button onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Download className="h-4 w-4 mr-1" />
            <span>Export Report</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

