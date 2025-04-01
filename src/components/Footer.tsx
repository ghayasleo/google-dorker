
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container flex py-6 items-center justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> for efficient searching
        </div>
      </div>
    </footer>
  );
}
