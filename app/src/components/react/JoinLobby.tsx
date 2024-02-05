import { Button } from "@/components/react/ui/button";
import { Input } from "@/components/react/ui/input";
import { Label } from "@/components/react/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  code: z.number(),
  userName: z.string().max(32).min(4),
});
export function JoinLobby() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const response = await fetch("/api/createUser", {
          method: "POST",
          body: JSON.stringify({ userName: data.userName }),
        });
        if (response.status === 200) {
          window.open(`/multiplayer?code=${data.code}`, "_self");
        }
      })}
    >
      <div className="space-y-1">
        <Label htmlFor="code">Lobby code</Label>
        <Input type="number" {...register("code", { valueAsNumber: true })} id="code" />
        {errors.code?.message && <p>{errors.code?.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="joinUserName">Username</Label>
        <Input type="text" {...register("userName")} id="joinUserName" />
        {errors.userName?.message && <p>{errors.userName?.message}</p>}
      </div>
      <div className="py-3">
        <Button type="submit">Join</Button>
      </div>
    </form>
  );
}
