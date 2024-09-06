import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Answer from "./components/sections/Answer";
import NameForm from "./components/sections/NameForm";
import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([
    { name: "John Doe", answer: "Opción A", loading: true },
    { name: "Jane Smith", answer: "Opción B", loading: true },
    { name: "Bob Johnson", answer: "Opción A", loading: true },
    { name: "Alice Brown", answer: "Opción A", loading: true },
    { name: "Mike Davis", answer: "Opción B", loading: true },
    { name: "Emily Chen", answer: "Opción A", loading: true },
    { name: "David Lee", answer: "Opción B", loading: true },
  ]);

  useEffect(() => {
    users.forEach((user, index) => {
      setTimeout(() => {
        setUsers((prevUsers) => {
          const newUsers = [...prevUsers];
          newUsers[index] = { ...user, loading: false };
          return newUsers;
        });
      }, 2000 * (index + 1));
    });
  }, [users]);

  return (
    <>
      <NameForm />
      <div className="flex flex-col justify-between min-h-screen">
        {/* Respuestas de otros usuarios */}
        <div className="my-2">
          <h2 className="text-xl text-center">Respuestas de otros usuarios:</h2>
          <div className="bg-neutral-200 py-1">
            {users.map((user, index) => {
              setTimeout(() => {}, 2000);
              return (
                <Answer
                  key={index + user.name}
                  name={user.name}
                  answer={user.answer}
                  loading={user.loading}
                />
              );
            })}
          </div>
        </div>

        <div className="text-center">
          {/* Respuesta de un usuario */}
          <h1 className="text-2xl font-bold">¿Lorem ipsum dolor ate?</h1>
          <div className="my-4">
            <Button className="mx-2">Opción A</Button>
            <Button className="mx-2">Opción B</Button>
          </div>
        </div>

        <div className="flex justify-around items-center mt-8 py-4 bg-neutral-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="ml-2">John Doe</span>
          </div>
          <span className="text-2xl">01:00</span>
        </div>
      </div>
    </>
  );
}

export default App;
