import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  SearchIcon,
  PlusIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  CalendarIcon,
  TrendingUpIcon,
  ClipboardListIcon,
  EditIcon,
  FileTextIcon,
  XIcon,
  SaveIcon,
  MessageSquareIcon,
  TagIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  LayoutGridIcon,
  ListIcon,
  FilterIcon,
  CalendarDaysIcon,
  SortAscIcon,
  SortDescIcon,
  DollarSignIcon,
  EyeIcon,
  MoreHorizontalIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type Lead, type InsertLead } from "@shared/schema";
import { z } from "zod";

// Enhanced form schema with additional validation
const addLeadFormSchema = insertLeadSchema.extend({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  businessType: z.string().optional(),
  estimatedMonthlyVolume: z.string().optional(),
  leadSource: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().optional(),
});

type AddLeadFormData = z.infer<typeof addLeadFormSchema>;

// Lead update form schema
const updateLeadFormSchema = insertLeadSchema.extend({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  businessType: z.string().optional(),
  estimatedMonthlyVolume: z.string().optional(),
  leadSource: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedValue: z.string().optional(),
  probabilityScore: z.number().min(0).max(100).optional(),
});

type UpdateLeadFormData = z.infer<typeof updateLeadFormSchema>;

// Note form schema
const noteFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  details: z.string().min(1, "Details are required"),
  interactionType: z.enum(["call", "email", "meeting", "note", "status_change"]).default("note"),
  outcome: z.enum(["positive", "neutral", "negative", "follow_up_required"]).optional(),
});

type NoteFormData = z.infer<typeof noteFormSchema>;

// Kanban columns configuration
const KANBAN_COLUMNS = [
  { 
    id: "uploaded", 
    title: "My Leads", 
    count: 0,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  },
  { 
    id: "contacted", 
    title: "Contacted", 
    count: 0,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  { 
    id: "interested", 
    title: "Submitted", 
    count: 0,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  },
  { 
    id: "quoted", 
    title: "Quote Received", 
    count: 0,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  },
  { 
    id: "converted", 
    title: "Agreed", 
    count: 0,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
];

// Priority colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

// Draggable Lead Card Component
function LeadCard({ lead, onEditDetails }: { lead: Lead; onEditDetails: (lead: Lead) => void }) {
  const { toast } = useToast();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handler for quick actions
  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.contactPhone) {
      window.location.href = `tel:${lead.contactPhone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number.",
        variant: "destructive",
      });
    }
  }, [lead.contactPhone, toast]);

  const handleEmail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.contactEmail) {
      window.location.href = `mailto:${lead.contactEmail}?subject=Follow up from ${lead.businessName}`;
    } else {
      toast({
        title: "No Email Address",
        description: "This lead doesn't have an email address.",
        variant: "destructive",
      });
    }
  }, [lead.contactEmail, lead.businessName, toast]);

  const handleQuoteRequest = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditDetails(lead);
  }, [lead, onEditDetails]);

  const handleEditDetails = useCallback((e: React.MouseEvent, openDetailsPanel: (lead: Lead) => void) => {
    e.stopPropagation();
    openDetailsPanel(lead);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm cursor-pointer
        hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
      data-testid={`lead-card-${lead.id}`}
      onClick={() => onEditDetails(lead)}
    >
      <div className="space-y-3">
        {/* Drag handle area */}
        <div {...attributes} {...listeners} className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {lead.businessName}
            </h3>
            {lead.priority && (
              <Badge 
                className={`${getPriorityColor(lead.priority)} text-xs`}
                variant="secondary"
              >
                {lead.priority}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <UserIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.contactName}</span>
            </div>
            
            {lead.contactEmail && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <MailIcon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{lead.contactEmail}</span>
              </div>
            )}
            
            {lead.contactPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <PhoneIcon className="h-3 w-3 flex-shrink-0" />
                <span>{lead.contactPhone}</span>
              </div>
            )}
            
            {lead.businessType && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <BuildingIcon className="h-3 w-3 flex-shrink-0" />
                <span>{lead.businessType}</span>
              </div>
            )}
            
            {lead.estimatedMonthlyVolume && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <TrendingUpIcon className="h-3 w-3 flex-shrink-0" />
                <span>{lead.estimatedMonthlyVolume}</span>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                {lead.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'No date'}
            </div>
            {lead.leadSource && (
              <span className="capitalize">{lead.leadSource.replace('_', ' ')}</span>
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
              data-testid={`button-call-${lead.id}`}
              disabled={!lead.contactPhone}
              title={lead.contactPhone ? `Call ${lead.contactPhone}` : "No phone number"}
            >
              <PhoneIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              onClick={(e) => { e.stopPropagation(); handleEmail(e); }}
              data-testid={`button-email-${lead.id}`}
              disabled={!lead.contactEmail}
              title={lead.contactEmail ? `Email ${lead.contactEmail}` : "No email address"}
            >
              <MailIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
              onClick={(e) => { e.stopPropagation(); handleQuoteRequest(e); }}
              data-testid={`button-quote-${lead.id}`}
              title="Request Quote"
            >
              <FileTextIcon className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                onEditDetails(lead);
              }}
              data-testid={`button-edit-${lead.id}`}
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

// Kanban Column Component
function KanbanColumn({ 
  column, 
  leads, 
  isLoading,
  onEditDetails
}: { 
  column: typeof KANBAN_COLUMNS[0], 
  leads: Lead[], 
  isLoading: boolean,
  onEditDetails: (lead: Lead) => void
}) {
  const columnLeads = leads.filter(lead => lead.status === column.id);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  
  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full transition-colors ${isOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>{column.title}</span>
            <Badge className={column.color} variant="secondary">
              {columnLeads.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div ref={setNodeRef} className="min-h-full">
              <SortableContext
                items={columnLeads.map(lead => lead.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3" data-testid={`column-${column.id}`}>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))
                  ) : columnLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ClipboardListIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No leads yet</p>
                      {isOver && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Drop lead here
                        </p>
                      )}
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onEditDetails={onEditDetails} />
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

// Add Lead Form Component
function AddLeadForm({ onSubmit, isSubmitting }: { onSubmit: (data: AddLeadFormData) => void; isSubmitting: boolean }) {
  const form = useForm<AddLeadFormData>({
    resolver: zodResolver(addLeadFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      businessType: "",
      estimatedMonthlyVolume: "",
      leadSource: "manual",
      priority: "medium",
      notes: "",
      status: "uploaded",
    },
  });

  const handleSubmit = (data: AddLeadFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter business name" 
                    data-testid="input-business-name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter contact person name" 
                    data-testid="input-contact-name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter email address" 
                    data-testid="input-contact-email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number" 
                    data-testid="input-contact-phone"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger data-testid="select-business-type">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="professional_services">Professional Services</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedMonthlyVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Volume</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger data-testid="select-monthly-volume">
                      <SelectValue placeholder="Select monthly volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_5k">Under £5,000</SelectItem>
                      <SelectItem value="5k_25k">£5,000 - £25,000</SelectItem>
                      <SelectItem value="25k_100k">£25,000 - £100,000</SelectItem>
                      <SelectItem value="100k_500k">£100,000 - £500,000</SelectItem>
                      <SelectItem value="over_500k">Over £500,000</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger data-testid="select-lead-source">
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional notes about this lead..."
                  rows={3}
                  data-testid="textarea-notes"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            data-testid="button-submit-lead"
          >
            {isSubmitting ? "Adding..." : "Add Lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Lead Details Panel Component
function LeadDetailsPanel({ 
  lead, 
  isOpen, 
  onClose 
}: { 
  lead: Lead | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState("note");

  const updateLeadMutation = useMutation({
    mutationFn: async (updateData: Partial<Lead>) => {
      if (!lead) return;
      const response = await apiRequest("PATCH", `/api/leads/${lead.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsEditMode(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<UpdateLeadFormData>({
    resolver: zodResolver(updateLeadFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      businessType: "",
      estimatedMonthlyVolume: "",
      leadSource: "",
      priority: "medium",
      notes: "",
    },
  });

  // Reset form when lead changes
  useEffect(() => {
    if (lead) {
      form.reset({
        businessName: lead.businessName || "",
        contactName: lead.contactName || "",
        contactEmail: lead.contactEmail || "",
        contactPhone: lead.contactPhone || "",
        businessType: lead.businessType || "",
        estimatedMonthlyVolume: lead.estimatedMonthlyVolume || "",
        leadSource: lead.leadSource || "",
        priority: (lead.priority as "low" | "medium" | "high") || "medium",
        notes: lead.notes || "",
      });
    }
  }, [lead, form]);

  const handleSave = (data: UpdateLeadFormData) => {
    updateLeadMutation.mutate(data);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    
    // For now, just add the note to the existing notes
    const currentNotes = lead?.notes || "";
    const timestamp = new Date().toLocaleString();
    const newNote = `[${timestamp}] ${noteType.toUpperCase()}: ${note}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;
    
    updateLeadMutation.mutate({ notes: updatedNotes });
    setNote("");
  };

  // Request Quote mutation
  const requestQuoteMutation = useMutation({
    mutationFn: async (lead: Lead) => {
      // Convert lead to referral format
      const referralData = {
        businessName: lead.businessName,
        businessOwnerName: lead.contactName,
        businessEmail: lead.contactEmail || "",
        businessPhone: lead.contactPhone || "",
        businessType: lead.businessType || "",
        monthlyVolume: lead.estimatedMonthlyVolume || "",
        businessAddress: "", // Lead might not have address, can be collected later
        notes: `Quote requested from lead: ${lead.notes || ""}`
      };

      // Create referral
      const response = await apiRequest("POST", "/api/referrals", referralData);
      const referral = await response.json();

      // Update lead status to 'submitted'
      await apiRequest("PATCH", `/api/leads/${lead.id}`, { status: "submitted" });

      return { referral, leadId: lead.id };
    },
    onSuccess: (data) => {
      toast({
        title: "Quote Request Submitted!",
        description: `Quote request for ${lead?.businessName} has been submitted successfully. You can track its progress in your referrals.`,
      });
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      
      // Close the details panel
      onClose();
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Quote Request Failed",
        description: error.message || "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRequestQuote = () => {
    if (!lead) return;
    
    if (!lead.contactEmail && !lead.contactPhone) {
      toast({
        title: "Missing Contact Information",
        description: "Please add email or phone number before requesting a quote.",
        variant: "destructive",
      });
      return;
    }
    
    requestQuoteMutation.mutate(lead);
  };

  const handleCall = () => {
    if (lead?.contactPhone) {
      window.location.href = `tel:${lead.contactPhone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = () => {
    if (lead?.contactEmail) {
      window.location.href = `mailto:${lead.contactEmail}?subject=Follow up from ${lead.businessName}`;
    } else {
      toast({
        title: "No Email Address",
        description: "This lead doesn't have an email address.",
        variant: "destructive",
      });
    }
  };

  if (!lead) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-gray-900" data-testid="sheet-lead-details">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{lead.businessName}</span>
            <div className="flex items-center gap-2">
              {lead.priority && (
                <Badge className={`${getPriorityColor(lead.priority)} text-xs`} variant="secondary">
                  {lead.priority}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                data-testid="button-toggle-edit"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </div>
          </SheetTitle>
          <SheetDescription>
            Lead details and interaction history
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                disabled={!lead.contactPhone}
                className="flex-1"
                data-testid="button-call-lead"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                disabled={!lead.contactEmail}
                className="flex-1"
                data-testid="button-email-lead"
              >
                <MailIcon className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                data-testid="button-quote-lead"
                onClick={handleRequestQuote}
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                Quote
              </Button>
            </div>

            {isEditMode ? (
              /* Edit Form */
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-business-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-edit-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-business-type">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="e-commerce">E-commerce</SelectItem>
                            <SelectItem value="professional_services">Professional Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateLeadMutation.isPending} data-testid="button-save-lead">
                      {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              /* Read-only View */
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</label>
                    <p className="text-sm" data-testid="text-contact-name">{lead.contactName}</p>
                  </div>
                  
                  {lead.contactEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm" data-testid="text-contact-email">{lead.contactEmail}</p>
                    </div>
                  )}
                  
                  {lead.contactPhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-sm" data-testid="text-contact-phone">{lead.contactPhone}</p>
                    </div>
                  )}
                  
                  {lead.businessType && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</label>
                      <p className="text-sm capitalize" data-testid="text-business-type">{lead.businessType.replace('_', ' ')}</p>
                    </div>
                  )}
                  
                  {lead.estimatedMonthlyVolume && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Volume</label>
                      <p className="text-sm" data-testid="text-monthly-volume">{lead.estimatedMonthlyVolume}</p>
                    </div>
                  )}
                  
                  {lead.leadSource && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Source</label>
                      <p className="text-sm capitalize" data-testid="text-lead-source">{lead.leadSource.replace('_', ' ')}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <p className="text-sm capitalize" data-testid="text-status">
                      {KANBAN_COLUMNS.find(col => col.id === lead.status)?.title || lead.status}
                    </p>
                  </div>
                  
                  {lead.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                      <p className="text-sm" data-testid="text-created-date">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4" />
                Notes & Activity
              </h3>
              
              {/* Add Note */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1"
                    data-testid="input-add-note"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddNote} 
                    disabled={!note.trim() || updateLeadMutation.isPending}
                    data-testid="button-add-note"
                  >
                    <SaveIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Existing Notes */}
              {lead.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                    Previous Notes
                  </label>
                  <div className="text-sm whitespace-pre-wrap" data-testid="text-notes">
                    {lead.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Main Leads Page Component
export default function Leads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  
  // View and filter states
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('all');
  const [estimatedValueFilter, setEstimatedValueFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{from?: Date, to?: Date}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debounced search implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Add lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (leadData: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Added Successfully!",
        description: "The lead has been added to your pipeline.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsAddLeadDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update lead status mutation (for drag and drop)
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced filter logic with multiple criteria
  const filteredLeads = leads.filter(lead => {
    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = (
        lead.businessName.toLowerCase().includes(searchLower) ||
        lead.contactName.toLowerCase().includes(searchLower) ||
        (lead.contactEmail && lead.contactEmail.toLowerCase().includes(searchLower)) ||
        (lead.contactPhone && lead.contactPhone.toLowerCase().includes(searchLower)) ||
        (lead.businessType && lead.businessType.toLowerCase().includes(searchLower)) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
    
    // Business type filter
    if (businessTypeFilter !== 'all' && lead.businessType !== businessTypeFilter) return false;
    
    // Lead source filter
    if (leadSourceFilter !== 'all' && lead.leadSource !== leadSourceFilter) return false;
    
    // Date range filter
    if (dateRangeFilter.from && lead.createdAt) {
      const leadDate = new Date(lead.createdAt);
      if (leadDate < dateRangeFilter.from) return false;
    }
    if (dateRangeFilter.to && lead.createdAt) {
      const leadDate = new Date(lead.createdAt);
      if (leadDate > dateRangeFilter.to) return false;
    }
    
    // Estimated value filter (simplified)
    if (estimatedValueFilter !== 'all') {
      const hasEstimatedValue = lead.estimatedMonthlyVolume && lead.estimatedMonthlyVolume !== '';
      if (estimatedValueFilter === 'with_value' && !hasEstimatedValue) return false;
      if (estimatedValueFilter === 'without_value' && hasEstimatedValue) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sorting logic
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'businessName':
        aValue = a.businessName;
        bValue = b.businessName;
        break;
      case 'contactName':
        aValue = a.contactName;
        bValue = b.contactName;
        break;
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // Clear search functionality
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setDebouncedSearchTerm("");
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) {
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // Check if it's dropped on a valid column
    const validColumns = KANBAN_COLUMNS.map(col => col.id);
    if (!validColumns.includes(newStatus)) {
      return;
    }

    // Find the lead and update its status
    const lead = filteredLeads.find(l => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      // Optimistic update - immediately update the UI
      queryClient.setQueryData(['/api/leads'], (oldData: Lead[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(l => 
          l.id === leadId ? { ...l, status: newStatus } : l
        );
      });
      
      // Make the API call
      updateLeadStatusMutation.mutate(
        { leadId, status: newStatus },
        {
          onError: () => {
            // Rollback on error
            queryClient.setQueryData(['/api/leads'], (oldData: Lead[] | undefined) => {
              if (!oldData) return oldData;
              return oldData.map(l => 
                l.id === leadId ? { ...l, status: lead.status } : l
              );
            });
          }
        }
      );
      
      // Show success message
      toast({
        title: "Lead Updated",
        description: `${lead.businessName} moved to ${KANBAN_COLUMNS.find(c => c.id === newStatus)?.title}`,
      });
    }
  };

  // Handle add lead form submission
  const handleAddLead = (data: AddLeadFormData) => {
    addLeadMutation.mutate(data);
  };

  // Handle opening lead details panel
  const handleOpenLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsPanelOpen(true);
  };

  // Handle closing lead details panel
  const handleCloseLeadDetails = () => {
    setIsDetailsPanelOpen(false);
    setTimeout(() => setSelectedLead(null), 300); // Delay to allow slide animation
  };

  // Get the active lead for drag overlay
  const activeLead = activeId ? filteredLeads.find(lead => lead.id === activeId) : null;

  // Toggle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setBusinessTypeFilter('all');
    setLeadSourceFilter('all');
    setEstimatedValueFilter('all');
    setDateRangeFilter({});
    setSearchInput('');
    setDebouncedSearchTerm('');
  };

  // Filter options
  const businessTypeOptions = [
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'e-commerce', label: 'E-commerce' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'construction', label: 'Construction' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' },
  ];

  const leadSourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email', label: 'Email Campaign' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'event', label: 'Event' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'other', label: 'Other' },
  ];

  // List View Component
  const ListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
            <TableHead className="w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-0"
                onClick={() => handleSort('businessName')}
                data-testid="sort-business-name"
              >
                Business Name
                {sortField === 'businessName' && (
                  sortDirection === 'asc' ? <SortAscIcon className="ml-2 h-3 w-3" /> : <SortDescIcon className="ml-2 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-0"
                onClick={() => handleSort('contactName')}
                data-testid="sort-contact-name"
              >
                Contact
                {sortField === 'contactName' && (
                  sortDirection === 'asc' ? <SortAscIcon className="ml-2 h-3 w-3" /> : <SortDescIcon className="ml-2 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-0"
                onClick={() => handleSort('priority')}
                data-testid="sort-priority"
              >
                Priority
                {sortField === 'priority' && (
                  sortDirection === 'asc' ? <SortAscIcon className="ml-2 h-3 w-3" /> : <SortDescIcon className="ml-2 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-0"
                onClick={() => handleSort('createdAt')}
                data-testid="sort-created"
              >
                Created
                {sortField === 'createdAt' && (
                  sortDirection === 'asc' ? <SortAscIcon className="ml-2 h-3 w-3" /> : <SortDescIcon className="ml-2 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-12 w-12 mb-2" />
                  <p>No leads found matching your criteria</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className="cursor-pointer transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-sm animate-fadeIn"
                onClick={() => handleOpenLeadDetails(lead)}
                data-testid={`list-row-${lead.id}`}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-semibold">{lead.businessName}</span>
                    {lead.notes && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                        {lead.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{lead.contactName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {lead.contactEmail && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <MailIcon className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{lead.contactEmail}</span>
                      </div>
                    )}
                    {lead.contactPhone && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="h-3 w-3" />
                        <span>{lead.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.businessType && (
                    <div className="flex items-center gap-1 text-xs">
                      <BuildingIcon className="h-3 w-3 text-gray-400" />
                      <span className="capitalize">{lead.businessType.replace('_', ' ')}</span>
                    </div>
                  )}
                  {lead.estimatedMonthlyVolume && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <DollarSignIcon className="h-3 w-3" />
                      <span>{lead.estimatedMonthlyVolume}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {lead.priority && (
                    <Badge className={`${getPriorityColor(lead.priority)} text-xs`} variant="secondary">
                      {lead.priority}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${KANBAN_COLUMNS.find(col => col.id === lead.status)?.color || 'bg-gray-100 text-gray-800'} text-xs`}
                    variant="secondary"
                  >
                    {KANBAN_COLUMNS.find(col => col.id === lead.status)?.title || lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'No date'}
                    {lead.leadSource && (
                      <div className="capitalize mt-1">{lead.leadSource.replace('_', ' ')}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (lead.contactPhone) {
                          window.location.href = `tel:${lead.contactPhone}`;
                        } else {
                          toast({
                            title: "No Phone Number",
                            description: "This lead doesn't have a phone number.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!lead.contactPhone}
                      title={lead.contactPhone ? `Call ${lead.contactPhone}` : "No phone number"}
                      data-testid={`list-call-${lead.id}`}
                    >
                      <PhoneIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (lead.contactEmail) {
                          window.location.href = `mailto:${lead.contactEmail}?subject=Follow up from ${lead.businessName}`;
                        } else {
                          toast({
                            title: "No Email Address",
                            description: "This lead doesn't have an email address.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!lead.contactEmail}
                      title={lead.contactEmail ? `Email ${lead.contactEmail}` : "No email address"}
                      data-testid={`list-email-${lead.id}`}
                    >
                      <MailIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLeadDetails(lead);
                      }}
                      title="View details"
                      data-testid={`list-details-${lead.id}`}
                    >
                      <EyeIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Advanced Filters Component
  const AdvancedFilters = () => (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {KANBAN_COLUMNS.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Priority
            </label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger data-testid="filter-priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Type Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Business Type
            </label>
            <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
              <SelectTrigger data-testid="filter-business-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {businessTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Source Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Lead Source
            </label>
            <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
              <SelectTrigger data-testid="filter-lead-source">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {leadSourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Value Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Estimated Value
            </label>
            <Select value={estimatedValueFilter} onValueChange={setEstimatedValueFilter}>
              <SelectTrigger data-testid="filter-estimated-value">
                <SelectValue placeholder="All Values" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Values</SelectItem>
                <SelectItem value="with_value">With Estimated Value</SelectItem>
                <SelectItem value="without_value">Without Estimated Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Created Date Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-10"
                  data-testid="filter-date-range"
                >
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  {dateRangeFilter.from ? (
                    dateRangeFilter.to ? (
                      `${dateRangeFilter.from.toLocaleDateString()} - ${dateRangeFilter.to.toLocaleDateString()}`
                    ) : (
                      `From ${dateRangeFilter.from.toLocaleDateString()}`
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setDateRangeFilter({ from: lastWeek, to: today });
                      }}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setDateRangeFilter({ from: lastMonth, to: today });
                      }}
                    >
                      Last 30 days
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangeFilter({})}
                    className="w-full mb-2"
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white gradient-text">
                  Leads Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your sales pipeline with our enhanced lead management system
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-all duration-300">
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className={`transition-all duration-300 ${
                      viewMode === 'kanban' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    data-testid="toggle-kanban-view"
                  >
                    <LayoutGridIcon className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    data-testid="toggle-list-view"
                  >
                    <ListIcon className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="transition-all duration-300"
                  data-testid="toggle-filters"
                >
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filters
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || businessTypeFilter !== 'all' || 
                    leadSourceFilter !== 'all' || estimatedValueFilter !== 'all' || 
                    dateRangeFilter.from || dateRangeFilter.to) && (
                    <Badge className="ml-2 h-4 px-1 text-xs bg-primary text-primary-foreground">!</Badge>
                  )}
                </Button>

                {/* Add Lead Button */}
                <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="btn-gradient shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      data-testid="button-add-lead"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Add New Lead</DialogTitle>
                    </DialogHeader>
                    <AddLeadForm 
                      onSubmit={handleAddLead} 
                      isSubmitting={addLeadMutation.isPending} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads by business name, contact, email, phone, notes, or business type..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  data-testid="input-search-leads"
                />
                {searchInput && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={handleClearSearch}
                    data-testid="button-clear-search"
                    title="Clear search"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Search Results Info */}
              {(debouncedSearchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || businessTypeFilter !== 'all' || leadSourceFilter !== 'all' || estimatedValueFilter !== 'all' || dateRangeFilter.from || dateRangeFilter.to) && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    Found <span className="font-semibold text-gray-900 dark:text-white">{filteredLeads.length}</span> lead{filteredLeads.length !== 1 ? 's' : ''}
                    {debouncedSearchTerm && (
                      <span> matching "{debouncedSearchTerm}"</span>
                    )}
                    {(statusFilter !== 'all' || priorityFilter !== 'all' || businessTypeFilter !== 'all' || leadSourceFilter !== 'all' || estimatedValueFilter !== 'all' || dateRangeFilter.from || dateRangeFilter.to) && (
                      <span> with filters applied</span>
                    )}
                  </div>
                  {viewMode === 'list' && filteredLeads.length > 0 && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      Click column headers to sort
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="animate-slideUp">
                <AdvancedFilters />
              </div>
            )}

            {/* Main Content Area - Conditional Rendering */}
            <div className="transition-all duration-500 ease-in-out">
              {viewMode === 'kanban' ? (
                <div className="animate-fadeIn">
                  {/* Kanban Board */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="overflow-x-auto">
                      <div className="flex gap-6 min-w-fit pb-4">
                        {KANBAN_COLUMNS.map((column) => (
                          <KanbanColumn
                            key={column.id}
                            column={column}
                            leads={filteredLeads}
                            isLoading={leadsLoading}
                            onEditDetails={handleOpenLeadDetails}
                          />
                        ))}
                      </div>
                    </div>

                    <DragOverlay>
                      {activeLead ? (
                        <div className="rotate-5 animate-pulse">
                          <LeadCard lead={activeLead} onEditDetails={handleOpenLeadDetails} />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  {/* List View */}
                  <ListView />
                </div>
              )}
            </div>

            {/* Enhanced Statistics with Animation */}
            <div className="animate-slideUp">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                {KANBAN_COLUMNS.map((column, index) => {
                  const columnLeads = filteredLeads.filter(lead => lead.status === column.id);
                  const percentage = filteredLeads.length > 0 ? (columnLeads.length / filteredLeads.length) * 100 : 0;
                  return (
                    <Card 
                      key={column.id} 
                      className={`card-hover transition-all duration-300 delay-${index * 100}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${column.color.split(' ')[0]} animate-pulse`} />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white gradient-text">
                              {columnLeads.length}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {column.title}
                          </p>
                          {filteredLeads.length > 0 && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${column.color.split(' ')[0]}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                          {percentage > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(1)}% of total
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Additional Stats Row */}
              {filteredLeads.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Card className="card-hover">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {filteredLeads.filter(l => l.priority === 'high').length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">High Priority</div>
                    </CardContent>
                  </Card>
                  <Card className="card-hover">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {filteredLeads.filter(l => l.contactEmail).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">With Email</div>
                    </CardContent>
                  </Card>
                  <Card className="card-hover">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {filteredLeads.filter(l => l.contactPhone).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">With Phone</div>
                    </CardContent>
                  </Card>
                  <Card className="card-hover">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {filteredLeads.filter(l => l.estimatedMonthlyVolume).length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">With Est. Value</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Details Panel */}
        <LeadDetailsPanel 
          lead={selectedLead}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseLeadDetails}
        />
      </div>
    </div>
  );
}