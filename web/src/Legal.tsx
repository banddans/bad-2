import { Copyright } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import Github from "@/assets/github.svg?react";

function Header({ children }: { children: string }) {
  return (
    <p className="text-center scroll-m-20 font-semibold tracking-tight">
      {children}
    </p>
  );
}

function LegalDialog({
  isOpen,
  setIsDialogOpen,
}: {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Juridisk information</DialogTitle>
          </DialogHeader>

          <p>
            Den här appen är open source (
            <Button
              variant={"link"}
              size={"sm"}
              onClick={() =>
                window.open("https://github.com/banddans/bad-2", "_blank")
              }
            >
              <Github />
              Github
            </Button>
            ) och licensierad under MIT.
          </p>

          <div className="flex flex-col">
            <Header>Karta:</Header>
            <Button
              variant={"link"}
              onClick={() =>
                window.open("https://www.openstreetmap.org/copyright", "_blank")
              }
            >
              <Copyright />
              OpenStreetMap contributors
            </Button>
            <Button
              variant={"link"}
              onClick={() =>
                window.open("https://carto.com/attributions", "_blank")
              }
            >
              <Copyright /> CARTO
            </Button>
          </div>

          <div className="flex flex-col">
            <Header>Temperaturdata:</Header>
            <Button
              variant={"link"}
              onClick={() =>
                window.open(
                  "https://www.linkoping.se/oppna-data-fran-linkopings-kommun",
                  "_blank",
                )
              }
            >
              Linköping Öppna Data
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default LegalDialog;
