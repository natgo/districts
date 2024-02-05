import { Button } from "@/components/react/ui/button";
import { Input } from "@/components/react/ui/input";
import { Label } from "@/components/react/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  userName: z.string().max(32).min(4),
});
export function CreateLobby() {
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
        const response = await fetch("/api/createLobby", {
          method: "POST",
          body: JSON.stringify(data),
        });
        if (response.status === 200) {
          window.open(`/multiplayer?code=${await response.text()}`, "_self");
        }
      })}
    >
      <div className="space-y-1">
        <Label htmlFor="joinUserName">Username</Label>
        <Input type="text" {...register("userName")} id="createUserName" />
        {errors.userName?.message && <p>{errors.userName?.message}</p>}
      </div>
      <div className="py-3">
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
