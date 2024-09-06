import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function NameForm() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-neutral-100">
      <div className="mx-auto w-[80%] max-w-[500px]">
        <Label className="text-xl my-4">Ingrese su nombre</Label>
        <Input
          placeholder="John Doe"
          type="text"
          className="my-4 border-gray-500"
        />
        <Button className="my-4">Continuar</Button>
      </div>
    </div>
  );
}

export default NameForm;
