import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, MoreHorizontal, Plus, GripVertical } from "lucide-react";
import {
  adminListEvents,
  deleteEvent,
  updateEvent,
  reorderEvents,
  EVENT_STATUSES,
} from "@/config/api/event.api";
import type { Event, EventStatus } from "@/config/api/event.api";
import { getAssetUrl } from "@/Utils/constant";

const STATUS_LABELS: Record<EventStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

const STATUS_STYLES: Record<EventStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

interface EventRowProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: EventStatus) => void;
}

function EventRow({ event, onEdit, onDelete, onStatusChange }: EventRowProps) {
  const { attributes, listeners, transform, transition, setNodeRef, isDragging } = useSortable({
    id: event._id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 hover:bg-slate-50 border-b border-slate-100 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <TableCell className="py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex -space-x-2">
          {event.images?.slice(0, 4).map((url, i) => (
            <img
              key={url}
              src={getAssetUrl(url)}
              alt=""
              className="h-9 w-9 rounded-full object-cover border-2 border-white"
              style={{ zIndex: 4 - i }}
            />
          ))}
          {(event.images?.length ?? 0) > 4 && (
            <span className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500">
              +{(event.images?.length ?? 0) - 4}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 max-w-[240px]">
        <p className="text-sm text-slate-700 truncate">{event?.title}</p>
      </TableCell>
      <TableCell className="py-3 max-w-[180px]">
        <p className="text-sm text-slate-500 truncate">{event?.category || "—"}</p>
      </TableCell>
      <TableCell className="py-3">
        <p className="text-sm text-slate-700">
          {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}
        </p>
      </TableCell>
      <TableCell className="py-3">
        <Select
          value={event?.status ?? "active"}
          onValueChange={(status) => onStatusChange(status as EventStatus)}
        >
          <SelectTrigger className={`h-7 text-xs w-[100px] border ${STATUS_STYLES[event?.status ?? "active"]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs font-semibold">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onSelect={(ev) => {
                ev.preventDefault();
                onDelete();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

const EventsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [list, setList] = useState<Event[]>([]);

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["admin-events"],
    queryFn: adminListEvents,
  });

  // Keep local (draggable) order in sync whenever fresh data arrives.
  useEffect(() => {
    setList(events ?? []);
  }, [events]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reorderEvents(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Order updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to save new order", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) => updateEvent(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Status updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update status", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setDeleteTarget(null);
      toast.success("Event deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to delete event", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    setList((prev) => {
      const oldIndex = prev.findIndex((e) => e._id === active.id);
      const newIndex = prev.findIndex((e) => e._id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderMutation.mutate(next.map((e) => e._id));
      return next;
    });
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Events</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage the latest events shown on the public Our Work page. Drag rows to reorder.
          </p>
        </div>
        <Button variant="theme" onClick={() => navigate("/dashboard/events/create")}>
          <Plus className="h-4 w-4 mr-1" /> New Event
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-semibold text-slate-600">Photos</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Title</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Category</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Event Date</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  <LoaderCircle className="animate-spin h-4 w-4 inline mr-2" /> Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-red-500">
                  Couldn't load events. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">
                  No events yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
            {list.length > 0 && (
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={list.map((e) => e._id)} strategy={verticalListSortingStrategy}>
                  {list.map((e) => (
                    <EventRow
                      key={e._id}
                      event={e}
                      onEdit={() => navigate(`/dashboard/events/${e._id}/edit`)}
                      onDelete={() => setDeleteTarget(e)}
                      onStatusChange={(status) => statusMutation.mutate({ id: e._id, status })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the event — it disappears from the public Our Work page but the record is
              kept. This action can't be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventsPage;
