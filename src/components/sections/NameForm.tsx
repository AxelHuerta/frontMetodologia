import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";

type Props = {
  sendName: (name: string) => void;
};

// TODO: any
function NameForm({ sendName }: Props) {
  const [name, setName] = useState("");
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = () => {
    sendName(name);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-neutral-100">
      <div className="mx-auto w-[80%] max-w-[500px]">
        <Label className="text-xl my-4">Ingrese su nombre</Label>
        <Input
          placeholder="John Doe"
          type="text"
          name="name"
          onChange={handleInput}
          className="my-4 border-gray-500"
        />
        <Button className="my-4" onClick={handleSubmit}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

export default NameForm;
