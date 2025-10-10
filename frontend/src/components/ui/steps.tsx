function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface Step {
  label: string
  value: number
}

interface StepsProps {
  steps: Step[]
  activeIndex: number
  onStepClick: (index: number) => void
  className?: string
}

export function Steps({ steps, activeIndex, onStepClick, className }: StepsProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === activeIndex
          const isClickable = true
          const isPrevious = index < activeIndex
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 relative">
              {index > 0 && (
                <div
                  className={cn(
                    "absolute h-[0.2em] top-[0.7rem] -left-1/2 w-full",
                    isPrevious || isActive ? "bg-[#94febf]" : "bg-[#393939]"
                  )}
                  style={{ zIndex: 0 }}
                />
              )}
              
              {(index === 0 || index === steps.length - 1) && (
                <div
                  className={cn(
                    "absolute h-[0.2em] top-[0.7rem] w-1/2",
                    index === 0 ? "left-0" : "right-0",
                    isPrevious || isActive ? "bg-[#94febf]" : "bg-[#393939]"
                  )}
                  style={{ zIndex: 0 }}
                />
              )}
              
              <button
                onClick={() => onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-4 transition-colors duration-150 ease-in-out relative z-10",
                  isClickable ? "cursor-pointer" : "cursor-default",
                  !isClickable && "text-[#393939]"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-[0.2em] flex items-center justify-center relative",
                    isActive
                      ? "border-[#94febf] bg-[#000403]"
                      : isClickable
                      ? "border-[#94febf] bg-transparent"
                      : "border-[#393939] bg-transparent"
                  )}
                >
                  {isActive && (
                    <div
                      className="w-6 h-6 rounded-full bg-[#94febf] transition-transform duration-150 ease-out"
                      style={{ transform: "scale(0.6)" }}
                    />
                  )}
                </div>
                
                <span
                  className={cn(
                    "text-sm mt-2 transition-colors duration-150 ease-in-out whitespace-nowrap",
                    isActive ? "text-[#94febf]" : isClickable ? "text-[#eee]" : "text-[#393939]"
                  )}
                >
                  {step.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
