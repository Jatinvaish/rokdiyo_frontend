'use client';
import { BadgeCheck, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export default function UserMenu() {
  const router = useRouter();

  const handleLogout = () => {
    try {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      // Clear authentication cookie by setting it to expire immediately
      document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "default",
      });
      
      // Redirect to sign-in page
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={`/images/avatars/01.png`} alt="Rokdio" />
          <AvatarFallback className="rounded-lg">RD</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage src={`/images/avatars/01.png`} alt="Rokdio" />
              <AvatarFallback className="rounded-lg">RD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Rokdio</span>
              <span className="text-muted-foreground truncate text-xs">info@rokdio.com</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}   