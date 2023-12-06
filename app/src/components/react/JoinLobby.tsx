import { Button } from "@/components/react/ui/button";
import { Input } from "@/components/react/ui/input";
import { Label } from "@/components/react/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, { message: "Required" }),
  age: z.number().min(10),
});
export function joinLobby() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
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
  );
}
