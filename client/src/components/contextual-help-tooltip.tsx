import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircleIcon, InfoIcon, HelpIcon } from "lucide-react";

interface ContextualHelpTooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  type?: "help" | "info" | "question";
  position?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click";
  className?: string;
  iconClassName?: string;
  maxWidth?: string;
}

const iconTypes = {
  help: HelpCircleIcon,
  info: InfoIcon,
  question: HelpIcon,
};

export function ContextualHelpTooltip({
  content,
  children,
  type = "help",
  position = "top",
  trigger = "hover",
  className = "",
  iconClassName = "",
  maxWidth = "max-w-xs"
}: ContextualHelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = iconTypes[type];

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
      x: position === "left" ? 10 : position === "right" ? -10 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1,
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const triggerElement = children || (
    <motion.button
      variants={iconVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={`
        inline-flex items-center justify-center rounded-full p-1
        text-gray-500 hover:text-blue-600 hover:bg-blue-50
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${iconClassName}
      `}
      data-testid={`tooltip-${type}-icon`}
    >
      <IconComponent className="w-4 h-4" />
    </motion.button>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          {triggerElement}
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className={`
            bg-gray-900 text-white border border-gray-700 shadow-xl
            ${maxWidth} p-3 rounded-lg
            ${className}
          `}
          sideOffset={8}
          data-testid="contextual-help-content"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-sm leading-relaxed"
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Specialized tooltip for form fields
export function FieldHelpTooltip({ 
  content, 
  className = "",
  ...props 
}: Omit<ContextualHelpTooltipProps, 'type'>) {
  return (
    <ContextualHelpTooltip
      content={content}
      type="help"
      position="right"
      className={`bg-blue-900 border-blue-700 ${className}`}
      iconClassName="ml-2"
      {...props}
      data-testid="field-help-tooltip"
    />
  );
}

// Specialized tooltip for dashboard stats
export function StatsHelpTooltip({ 
  content, 
  className = "",
  ...props 
}: Omit<ContextualHelpTooltipProps, 'type'>) {
  return (
    <ContextualHelpTooltip
      content={content}
      type="info"
      position="top"
      className={`bg-green-900 border-green-700 ${className}`}
      iconClassName="ml-1"
      maxWidth="max-w-sm"
      {...props}
      data-testid="stats-help-tooltip"
    />
  );
}

// Specialized tooltip for feature explanations
export function FeatureHelpTooltip({ 
  content, 
  className = "",
  ...props 
}: Omit<ContextualHelpTooltipProps, 'type'>) {
  return (
    <ContextualHelpTooltip
      content={content}
      type="question"
      position="bottom"
      className={`bg-purple-900 border-purple-700 ${className}`}
      maxWidth="max-w-md"
      {...props}
      data-testid="feature-help-tooltip"
    />
  );
}

// Interactive tooltip with action button
interface ActionTooltipProps extends ContextualHelpTooltipProps {
  actionText?: string;
  onAction?: () => void;
}

export function ActionTooltip({
  content,
  actionText = "Learn More",
  onAction,
  className = "",
  ...props
}: ActionTooltipProps) {
  return (
    <ContextualHelpTooltip
      content={
        <div className="space-y-3">
          <div>{content}</div>
          {onAction && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="
                w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 
                text-white text-xs rounded-md transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              "
              data-testid="tooltip-action-button"
            >
              {actionText}
            </motion.button>
          )}
        </div>
      }
      className={`bg-gray-800 border-gray-600 ${className}`}
      maxWidth="max-w-sm"
      {...props}
      data-testid="action-tooltip"
    />
  );
}