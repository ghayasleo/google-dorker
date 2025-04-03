
import { Heart, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container flex flex-col py-6 items-center justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1 mb-2">
          Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> by 
          <a 
            href="https://github.com/ghayasleo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline text-primary ml-1"
          >
            Ghayas
          </a>
        </div>
        <div className="flex items-center">
          <a 
            href="https://github.com/ghayasleo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" /> 
            <span>ghayasleo</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
