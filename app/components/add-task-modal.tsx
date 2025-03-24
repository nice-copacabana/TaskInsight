"use client"

import React from "react"
import { useState } from "react"
import { Plus, Brain, BarChart, Layers, Zap } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useTheme } from "next-themes"
import { useToast } from "../hooks/use-toast"

// Icons mapping
const iconOptions = [
  { value: "brain", label: "AI", icon: Brain },
  { value: "chart", label: "Analytics", icon: BarChart },
  { value: "layers", label: "Process", icon: Layers },
  { value: "zap", label: "Automation", icon: Zap },
]

interface AddTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (name: string, icon: string, estimatedTime: number) => void
}

export function AddTaskModal({ open, onOpenChange, onAddTask }: AddTaskModalProps) {
  const [taskName, setTaskName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("brain")
  const [estimatedTime, setEstimatedTime] = useState(30) // Default 30 minutes
  const { resolvedTheme } = useTheme()
  const isLightTheme = resolvedTheme === "light"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskName.trim()) {
      onAddTask(taskName, selectedIcon, estimatedTime)
      setTaskName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[425px] ${isLightTheme ? "bg-white border-slate-200" : "bg-background border-border"}`}
      >
        <DialogHeader>
          <DialogTitle className={isLightTheme ? "text-slate-800" : "text-slate-100"}>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="task-name" className={isLightTheme ? "text-slate-700" : ""}>
              Task Name
            </Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
              className={
                isLightTheme
                  ? "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
                  : "bg-input/50 border-input"
              }
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className={isLightTheme ? "text-slate-700" : ""}>Task Icon</Label>
            <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => (
                <div key={option.value} className="flex flex-col items-center">
                  <RadioGroupItem value={option.value} id={`icon-${option.value}`} className="sr-only" />
                  <Label
                    htmlFor={`icon-${option.value}`}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-md cursor-pointer
                      ${
                        selectedIcon === option.value
                          ? isLightTheme
                            ? "bg-blue-50 border border-blue-200 text-blue-700"
                            : "bg-cyan-900/50 border border-cyan-500/50"
                          : isLightTheme
                            ? "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                            : "bg-slate-700/30 hover:bg-slate-700/50"
                      }
                    `}
                  >
                    <option.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-time" className={isLightTheme ? "text-slate-700" : ""}>
              Estimated Time (minutes)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="estimated-time"
                type="number"
                min="1"
                max="480"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number.parseInt(e.target.value) || 30)}
                className={
                  isLightTheme
                    ? "bg-slate-50 border-slate-200 text-slate-800"
                    : "bg-slate-700/50 border-slate-600 text-white"
                }
              />
              <span className={`text-sm ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>minutes</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
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
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Task</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

