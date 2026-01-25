"use client";

import { Tenant } from "@/lib/types/tenant";
import { tenantService } from "@/lib/services/tenant.service";
import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  MoreVertical,
  Trash2,
  Edit2,
  AlertTriangle,
} from "lucide-react";

interface TenantCardProps {
  tenant: Tenant;
  onDelete?: () => void;
  onEdit?: () => void;
  onStatusChange?: () => void;
}

export function TenantCard({
  tenant,
  onDelete,
  onEdit,
  onStatusChange,
}: TenantCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await tenantService.deleteTenant(tenant.id);
      toast.success("Tenant deleted successfully");
      onDelete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete tenant";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      setIsUpdatingStatus(true);
      if (tenant.is_active) {
        await tenantService.deactivateTenant(tenant.id);
        toast.success("Tenant deactivated");
      } else {
        await tenantService.activateTenant(tenant.id);
        toast.success("Tenant activated");
      }
      onStatusChange?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update tenant status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const createdDate = new Date(tenant.created_at).toLocaleDateString();

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1">{tenant.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={tenant.is_active ? "default" : "secondary"} className="text-xs">
                {tenant.is_active ? "Active" : "Inactive"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 text-xs">
                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-xs">
                    <Edit2 className="mr-2 h-3 w-3" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleStatusToggle}
                    disabled={isUpdatingStatus}
                    className="cursor-pointer text-xs"
                  >
                    {tenant.is_active ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer text-destructive focus:text-destructive text-xs"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-1 px-4 pb-3 text-xs">
          {/* Contact Info */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{tenant.phone}</span>
          </div>

          {/* Location */}
          {(tenant.address || tenant.city) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {tenant.address}
                {tenant.city && `, ${tenant.city}`}
              </span>
            </div>
          )}

          {/* Website */}
          {tenant.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <a
                href={tenant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate"
              >
                {tenant.website.replace("https://", "")}
              </a>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex gap-2 text-muted-foreground border-t pt-2 mt-2 flex-wrap">
            <span>TZ: {tenant.timezone}</span>
            <span>₹ {tenant.currency}</span>
            <span className="ml-auto">
              {new Date(tenant.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{tenant.name}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
