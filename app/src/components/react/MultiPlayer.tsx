import { Button } from "@/components/react/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/react/ui/dialog";
import { Input } from "@/components/react/ui/input";
import { Label } from "@/components/react/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/react/ui/tabs";

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
            <form action="/api/joinLobby" method="POST">
              <div className="space-y-1">
                <Label htmlFor="code">Lobby code</Label>
                <Input type="number" name="code" id="code" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="joinUserName">Username</Label>
                <Input type="text" name="UserName" id="joinUserName" />
              </div>
              <div className="py-3">
                <Button type="submit">Join</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="create">
            <form action="/api/createLobby" method="POST">
              <div className="space-y-1">
                <Label htmlFor="createUserName">Username</Label>
                <Input type="text" name="UserName" id="createUserName" />
              </div>
              <div className="py-3">
                <Button type="submit">Create</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
