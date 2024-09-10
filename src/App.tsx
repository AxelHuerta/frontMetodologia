import useWebSocket from "react-use-websocket";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Definir el tipo de usuario
type User = {
  id: number;
  name: string;
  answers: string[];
};

const WS_URL = "ws://localhost:3000/ws";

function App() {
  const [round, setRound] = useState(0);
  const [users, setUsers] = useState<User[]>();
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shouldStartRound, setShouldStartRound] = useState(false);

  // Conectar a los websockets
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("Connection opened");
      getRound();
      getUsers();
      getRoundStatus();
    },
    onMessage: (event) => {
      const { type } = JSON.parse(event.data);
      if (type !== "on-user-count-changed" && type !== "on-round-count-changed")
        return;
      getRound();
      getUsers();
      getRoundStatus();
    },
    shouldReconnect: (closeEvent) => true,
  });

  // Obtener ronda actual
  async function getRound() {
    const response = await fetch("http://localhost:3000/api/round").then(
      (res) => {
        return res.json();
      }
    );

    setRound(response);
  }

  // Obtener usuarios
  const getUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");

    setUsers(response.data);
  };

  // Pasar a la siguiente ronda
  async function plusOne() {
    await axios.post("http://localhost:3000/api/round", { round: round + 1 });
  }

  const getRoundStatus = async () => {
    const status = await axios.get("http://localhost:3000/api/round/status");
    setIsRoundInProgress(status.data);
  };

  // Comenzar la ronda
  const startRound = async () => {
    setTimeLeft(10);
    setShouldStartRound(true);
  };

  const endRound = async () => {
    axios.post("http://localhost:3000/api/round/end");
  };

  useEffect(() => {
    if (shouldStartRound) {
      const startRound = async () => {
        const status = await axios.post(
          "http://localhost:3000/api/round/start"
        );
        setIsRoundInProgress(status.data);
        setShouldStartRound(false);
      };
      startRound();
    }
  }, [shouldStartRound]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (timeLeft > 1) {
  //       setTimeLeft((prev) => {
  //         if (prev === 0) {
  //           setIsRoundInProgress(false);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     } else if (isRoundInProgress) {
  //       setIsRoundInProgress(false);
  //       endRound();
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [isRoundInProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeLeft > 1) {
        setTimeLeft((prev) => prev - 1);
      } else if (timeLeft === 1 && isRoundInProgress) {
        setIsRoundInProgress(false);
        endRound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <main className="p-4 min-h-screen bg-neutral-100">
      {/* Ronda */}
      <Card className="text-center m-2 max-w-[350px]">
        <CardHeader>
          <CardTitle>Ronda actual</CardTitle>
        </CardHeader>
        <CardContent className="text-4xl text-center my-2">
          {round + 1}
        </CardContent>
        <CardFooter className="flex justify-around">
          {/* Botón para comenzar la ronda */}
          <Button onClick={startRound} disabled={isRoundInProgress}>
            Comenzar ronda
          </Button>
          {/* Botón para pasar a la siguiente ronda */}
          <Button onClick={plusOne} disabled={isRoundInProgress}>
            Siguiente ronda
          </Button>
        </CardFooter>
      </Card>

      {/* Timepo de la ronda actual */}
      <Card className="text-center m-2 max-w-[350px]">
        <CardHeader>
          <CardTitle>Temporizador de la ronda acutal</CardTitle>
        </CardHeader>
        <CardContent className="text-4xl text-center my-2">
          {isRoundInProgress ? timeLeft : "Esperando a que empiece la ronda"}
        </CardContent>
      </Card>

      {/* Usuarios */}
      <Card className="m-2 max-w-[500px]">
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Usuarios conectados: {users ? users.length : 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de los usuarios.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Respuestas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.answers.join(", ")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
