import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chartContainerVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    variant: {
      default: "rounded-md border",
      card: "bg-card text-card-foreground shadow-sm",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const chartTooltipContentVariants = cva("rounded-md border bg-popover text-popover-foreground p-4 shadow-sm", {
  variants: {
    side: {
      top: "animate-slide-down-and-fade",
      bottom: "animate-slide-up-and-fade",
      left: "animate-slide-right-and-fade",
      right: "animate-slide-left-and-fade",
    },
  },
})

const chartLegendItemVariants = cva("flex items-center text-sm", {
  variants: {
    variant: {
      default: "space-x-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("", className)} ref={ref} {...props} />
))
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chartContainerVariants>
>(({ className, variant, ...props }, ref) => (
  <div className={cn(chartContainerVariants({ variant }), className)} ref={ref} {...props} />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("", className)} ref={ref} {...props} />,
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chartTooltipContentVariants>
>(({ className, side, ...props }, ref) => (
  <div className={cn(chartTooltipContentVariants({ side }), className)} ref={ref} {...props} />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("pt-2", className)} ref={ref} {...props} />,
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chartLegendItemVariants>
>(({ className, variant, ...props }, ref) => (
  <div className={cn(chartLegendItemVariants({ variant }), className)} ref={ref} {...props} />
))
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }
