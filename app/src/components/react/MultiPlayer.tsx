import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/react/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/react/ui/tabs";

import { CreateLobby } from "./CreateLobby";
import { JoinLobby } from "./JoinLobby";

export function MultiSelect() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-32 rounded-full bg-black bg-opacity-70 p-4">Multi</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Multi-player</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="join">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">Join a lobby</TabsTrigger>
            <TabsTrigger value="create">Create a lobby</TabsTrigger>
          </TabsList>
          <TabsContent value="join">
            <JoinLobby />
          </TabsContent>
          <TabsContent value="create">
            <CreateLobby />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
