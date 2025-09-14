import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DndContext, 
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  UserIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  CalendarIcon,
  TrendingUpIcon,
  DollarSignIcon,
  EditIcon,
  FileTextIcon
} from "lucide-react";
import type { Opportunity } from "@shared/schema";

// Opportunity Kanban columns configuration - matching opportunity statuses
const KANBAN_COLUMNS = [
  { 
    id: "prospect", 
    title: "Prospects", 
    count: 0,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  { 
    id: "qualified", 
    title: "Qualified", 
    count: 0,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  },
  { 
    id: "proposal", 
    title: "Proposal Sent", 
    count: 0,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  },
  { 
    id: "negotiation", 
    title: "Negotiation", 
    count: 0,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  },
  { 
    id: "closed_won", 
    title: "Closed Won", 
    count: 0,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  { 
    id: "closed_lost", 
    title: "Closed Lost", 
    count: 0,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }
];

// Priority colors for opportunities
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

// Draggable Opportunity Card Component
function OpportunityCard({ opportunity, onEditDetails }: { opportunity: Opportunity; onEditDetails: (opportunity: Opportunity) => void }) {
  const { toast } = useToast();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handler for quick actions
  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (opportunity.contactPhone) {
      window.location.href = `tel:${opportunity.contactPhone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "This opportunity doesn't have a phone number.",
        variant: "destructive",
      });
    }
  }, [opportunity.contactPhone, toast]);

  const handleEmail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (opportunity.contactEmail) {
      window.location.href = `mailto:${opportunity.contactEmail}?subject=Follow up regarding ${opportunity.businessName}`;
    } else {
      toast({
        title: "No Email Address",
        description: "This opportunity doesn't have an email address.",
        variant: "destructive",
      });
    }
  }, [opportunity.contactEmail, opportunity.businessName, toast]);

  const formatCurrency = (value: string) => {
    if (!value) return "—";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `£${num.toLocaleString()}`;
  };

  const getContactName = () => {
    const firstName = opportunity.contactFirstName || "";
    const lastName = opportunity.contactLastName || "";
    return `${firstName} ${lastName}`.trim() || "No contact name";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm cursor-pointer
        hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
      data-testid={`opportunity-card-${opportunity.id}`}
      onClick={() => onEditDetails(opportunity)}
    >
      <div className="space-y-3">
        {/* Drag handle area */}
        <div {...attributes} {...listeners} className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {opportunity.businessName}
            </h3>
            {opportunity.priority && (
              <Badge 
                className={`${getPriorityColor(opportunity.priority)} text-xs`}
                variant="secondary"
              >
                {opportunity.priority}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <UserIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{getContactName()}</span>
            </div>
            
            {opportunity.contactEmail && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <MailIcon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{opportunity.contactEmail}</span>
              </div>
            )}
            
            {opportunity.contactPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <PhoneIcon className="h-3 w-3 flex-shrink-0" />
                <span>{opportunity.contactPhone}</span>
              </div>
            )}
            
            {opportunity.businessType && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <BuildingIcon className="h-3 w-3 flex-shrink-0" />
                <span>{opportunity.businessType}</span>
              </div>
            )}
            
            {opportunity.estimatedValue && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <DollarSignIcon className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(opportunity.estimatedValue)}
                </span>
              </div>
            )}

            {opportunity.currentMonthlyVolume && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <TrendingUpIcon className="h-3 w-3 flex-shrink-0" />
                <span>Monthly: {formatCurrency(opportunity.currentMonthlyVolume)}</span>
              </div>
            )}
          </div>

          {opportunity.stage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Stage:</span>
              <Badge variant="outline" className="text-xs">
                {opportunity.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          )}

          {opportunity.notes && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                {opportunity.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {opportunity.expectedCloseDate ? 
                new Date(opportunity.expectedCloseDate).toLocaleDateString() : 
                'No close date'
              }
            </div>
            {opportunity.assignedTo && (
              <span className="truncate">{opportunity.assignedTo}</span>
            )}
          </div>
        </div>

        {/* Quick Actions - Non-draggable */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
          <div className="flex items-center justify-between gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
              onClick={(e) => { e.stopPropagation(); handleCall(e); }}
              data-testid={`button-call-${opportunity.id}`}
              disabled={!opportunity.contactPhone}
              title={opportunity.contactPhone ? `Call ${opportunity.contactPhone}` : "No phone number"}
            >
              <PhoneIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              onClick={(e) => { e.stopPropagation(); handleEmail(e); }}
              data-testid={`button-email-${opportunity.id}`}
              disabled={!opportunity.contactEmail}
              title={opportunity.contactEmail ? `Email ${opportunity.contactEmail}` : "No email address"}
            >
              <MailIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
              onClick={(e) => { e.stopPropagation(); onEditDetails(opportunity); }}
              data-testid={`button-proposal-${opportunity.id}`}
              title="Create Proposal"
            >
              <FileTextIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                onEditDetails(opportunity);
              }}
              data-testid={`button-edit-${opportunity.id}`}
              title="Edit Details"
            >
              <EditIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban Column Component for Opportunities
function OpportunityColumn({ 
  column, 
  opportunities, 
  isLoading,
  onEditDetails
}: { 
  column: typeof KANBAN_COLUMNS[0], 
  opportunities: Opportunity[], 
  isLoading: boolean,
  onEditDetails: (opportunity: Opportunity) => void
}) {
  const columnOpportunities = opportunities.filter(opportunity => opportunity.status === column.id);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  
  // Calculate total value for the column
  const totalValue = columnOpportunities.reduce((sum, opp) => {
    const value = parseFloat(opp.estimatedValue || "0");
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full transition-colors ${isOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>{column.title}</span>
            <div className="flex flex-col items-end gap-1">
              <Badge className={column.color} variant="secondary">
                {columnOpportunities.length}
              </Badge>
              {totalValue > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  £{totalValue.toLocaleString()}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div ref={setNodeRef} className="min-h-full">
              <SortableContext
                items={columnOpportunities.map(opportunity => opportunity.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3" data-testid={`column-${column.id}`}>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-lg" />
                    ))
                  ) : columnOpportunities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <DollarSignIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No opportunities yet</p>
                      {isOver && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Drop opportunity here
                        </p>
                      )}
                    </div>
                  ) : (
                    columnOpportunities.map((opportunity) => (
                      <OpportunityCard key={opportunity.id} opportunity={opportunity} onEditDetails={onEditDetails} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

interface OpportunityKanbanViewProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onEditDetails: (opportunity: Opportunity) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function OpportunityKanbanView({ 
  opportunities, 
  isLoading, 
  onEditDetails, 
  onDragEnd 
}: OpportunityKanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const activeOpportunity = activeId ? opportunities.find(opportunity => opportunity.id === activeId) : null;

  return (
    <div className="space-y-6" data-testid="opportunity-kanban-view">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4 min-w-max">
            {KANBAN_COLUMNS.map((column) => (
              <OpportunityColumn
                key={column.id}
                column={column}
                opportunities={opportunities}
                isLoading={isLoading}
                onEditDetails={onEditDetails}
              />
            ))}
          </div>
        </div>
        
        <DragOverlay>
          {activeOpportunity ? (
            <OpportunityCard opportunity={activeOpportunity} onEditDetails={onEditDetails} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}