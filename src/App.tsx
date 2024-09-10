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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Switch } from "./components/ui/switch";

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
  const [answerBankStatus, setAnswerBankStatus] = useState(true);
  const [answers, setAnswers] = useState<string[]>([
    "Dulce",
    "Dulce",
    "Dulce",
    "Dulce",
    "Dulce",
    "Dulce",
    "Dulce",
    "Dulce",
  ]);

  // Conectar a los websockets
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("Connection opened");
      getRound();
      getUsers();
      getRoundStatus();
      // TODO: is this necessary?
      getAnswersBankStatus();
    },
    onMessage: (event) => {
      const { type } = JSON.parse(event.data);
      if (type !== "on-user-count-changed" && type !== "on-round-count-changed")
        return;
      getRound();
      getUsers();
      getRoundStatus();
      getAnswersBankStatus();
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
    setTimeLeft(60);
    setShouldStartRound(true);
  };

  // Terminar la ronda
  const endRound = async () => {
    axios.post("http://localhost:3000/api/round/end");
  };

  // Guardar las respuestas
  const handleSelectChange = (value: string, index: number) => {
    const auxArray = answers;
    auxArray[index] = value;
    setAnswers(auxArray);
  };

  // Enviar las respuestas
  const sendAnswers = async () => {
    await axios.post("http://localhost:3000/api/answers", {
      answerBank: answers,
    });
  };

  // Obtener el estado del banco de respuestas
  const getAnswersBankStatus = async () => {
    const status = await axios.get("http://localhost:3000/api/answers/status");
    setAnswerBankStatus(status.data);
  };

  const setAnswerBankStatusToServer = async () => {
    await axios.post("http://localhost:3000/api/answers/status", {
      status: !answerBankStatus,
    });

    setAnswerBankStatus(!answerBankStatus);
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
    <main className="p-8 min-h-screen bg-neutral-100 flex justify-center items-center">
      <div>
        <section className="grid grid-cols-1 gap-4 max-w-[1500px] md:grid-cols-2 lg:grid-cols-3">
          {/* Configuración del quiz */}
          <Card className="text-center w-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center text-center my-2 flex-col md:flex-row">
              <div>
                {/* Cantidad de usuarios */}
                <h4 className="text-lg">Cantidad de usuarios</h4>
                <div className="flex gap-4 justify-center">
                  <Card className="w-20 h-20 flex justify-center items-center text-4xl font-bold cursor-pointer">
                    4
                  </Card>
                  <Card className="w-20 h-20 flex justify-center items-center text-4xl font-bold border-2 border-black cursor-pointer">
                    8
                  </Card>
                </div>
              </div>
              {/* Opción de respuestas*/}
              <div className="max-w-[200px] flex items-center mx-auto md:flex-col">
                <h4 className="text-lg">¿Mostrar respuestas verdaderas?</h4>
                <div className="flex justify-center">
                  <Switch
                    className="w-10 mt-4"
                    checked={!answerBankStatus}
                    onClick={setAnswerBankStatusToServer}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ronda */}
          {/* TODO: limite de rondas */}
          <Card className="text-center w-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Ronda actual</CardTitle>
            </CardHeader>
            <CardContent className="text-6xl font-bold text-center my-2">
              {round + 1}
            </CardContent>
            <CardFooter className="flex justify-center">
              {/* Botón para comenzar la ronda */}
              <Button
                onClick={startRound}
                disabled={isRoundInProgress}
                className="m-1"
              >
                Comenzar ronda
              </Button>
              {/* Botón para pasar a la siguiente ronda */}
              <Button
                onClick={plusOne}
                disabled={isRoundInProgress}
                className="m-1"
              >
                Siguiente ronda
              </Button>
            </CardFooter>
          </Card>

          {/* Timepo de la ronda actual */}
          <Card className="text-center w-full md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Temporizador de la ronda acutal</CardTitle>
            </CardHeader>
            <CardContent
              className={`my-2 max-w-[400px] mx-auto ${
                isRoundInProgress ? "text-6xl font-bold" : "text-4xl"
              }`}
            >
              {isRoundInProgress
                ? timeLeft
                : "Esperando a que empiece la ronda"}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 mt-4 md:grid-cols-2 max-w-[1500px]">
          {/* Usuarios */}
          <Card className="w-full">
            <CardHeader className="text-center">
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
                    {Array.from({ length: 8 }).map((_, index) => (
                      <TableHead key={index + length}>{index + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        {user.answers.map((answer, index) => {
                          return (
                            <TableCell key={index + answer}>{answer}</TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Banco de respuestas */}
          <Card className="text-center w-full">
            <CardHeader>
              <CardTitle>Banco de respuestas</CardTitle>
              <CardDescription>
                Las respuestas por defecto son <i>Dulce</i>
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-[500px] mx-auto">
              <ul>
                {answers.map((answer, index) => {
                  return (
                    <li
                      key={index + answer}
                      className="flex justify-between my-1"
                    >
                      <span>Usuario {index + 1}: </span>
                      <Select
                        name={`usuario-[index]`}
                        defaultValue="Dulce"
                        onValueChange={(value) => {
                          handleSelectChange(value, index);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecciona una respuesta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sabor</SelectLabel>
                            <SelectItem value="Dulce">Dulce</SelectItem>
                            <SelectItem value="Picante">Picante</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter className="w-full flex justify-end">
              <Button onClick={sendAnswers}>Guardar respuestas</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default App;
