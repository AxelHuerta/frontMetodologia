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
import { Check } from "lucide-react";

// Definir el tipo de usuario
type User = {
  id: number;
  name: string;
  answers: string[];
};

const WS_URL = "ws://localhost:3000/ws";
const btnLimitOfUsersStyles =
  "w-20 h-20 flex justify-center items-center text-4xl font-bold cursor-pointer";
const ROUND_TIME = 60;

function App() {
  const [round, setRound] = useState(0);
  const [users, setUsers] = useState<User[]>();
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shouldStartRound, setShouldStartRound] = useState(false);
  const [answerBankStatus, setAnswerBankStatus] = useState(true);
  const [limitOfUsers, setLimitOfUsers] = useState(8);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [isUsersSaved, setIsUsersSaved] = useState(false);
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
      getAnswersBankStatus();
      getLimitOfUsers();
    },
    onMessage: (event) => {
      const { type } = JSON.parse(event.data);
      if (type !== "on-user-count-changed" && type !== "on-round-count-changed")
        return;
      getRound();
      getUsers();
      getRoundStatus();
      getAnswersBankStatus();
      getLimitOfUsers();
    },
    shouldReconnect: () => true,
  });

  /**
   * Obtiene la ronda actual desde la API y actualiza el estado.
   *
   * @async
   * @function getRound
   * @returns {Promise<void>} Una promesa que se resuelve cuando la ronda actual se ha obtenido y el estado se ha actualizado.
   */
  async function getRound() {
    const response = await fetch("http://localhost:3000/api/round").then(
      (res) => {
        return res.json();
      }
    );

    setRound(response);

    if (response >= 11) {
      setIsFinalRound(true);
    } else {
      setIsFinalRound(false);
    }
  }

  /**
   * Obtiene la lista de usuarios desde la API y actualiza el estado.
   *
   * @async
   * @function getUsers
   * @returns {Promise<void>} Una promesa que se resuelve cuando la lista de usuarios se ha obtenido y el estado se ha actualizado.
   */
  const getUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");
    setUsers(response.data);
  };

  /**
   * Envía el valor de la ronda al servidor.
   *
   * @async
   * @function setRoundToServer
   * @param {number} value - El valor de la ronda a enviar.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  async function setRoundToServer(value: number) {
    await axios.post("http://localhost:3000/api/round", { round: value });
  }

  /**
   * Obtiene el estado actual de la ronda desde el servidor y actualiza el estado.
   *
   * @async
   * @function getRoundStatus
   * @returns {Promise<void>} Una promesa que se resuelve cuando el estado de la ronda se ha obtenido y el estado se ha actualizado.
   */
  const getRoundStatus = async () => {
    const status = await axios.get("http://localhost:3000/api/round/status");
    setIsRoundInProgress(status.data);
  };

  /**
   * Inicia una nueva ronda, estableciendo el tiempo restante y marcando que la ronda debe comenzar.
   *
   * @async
   * @function startRound
   * @returns {Promise<void>} Una promesa que se resuelve cuando la ronda ha comenzado.
   */
  const startRound = async () => {
    setTimeLeft(ROUND_TIME);
    setShouldStartRound(true);
  };

  /**
   * Termina la ronda actual enviando una solicitud al servidor.
   *
   * @async
   * @function endRound
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  const endRound = async () => {
    axios.post("http://localhost:3000/api/round/end");
  };

  /**
   * Maneja el cambio de selección de respuestas, actualizando el estado con la nueva respuesta seleccionada.
   *
   * @function handleSelectChange
   * @param {string} value - El valor de la respuesta seleccionada.
   * @param {number} index - El índice de la respuesta en el array.
   */
  const handleSelectChange = (value: string, index: number) => {
    const auxArray = answers;
    auxArray[index] = value;
    setAnswers(auxArray);
  };

  /**
   * Envía las respuestas al servidor.
   *
   * @async
   * @function sendAnswers
   * @returns {Promise<void>} Una promesa que se resuelve cuando las respuestas se han enviado.
   */
  const sendAnswers = async () => {
    await axios.post("http://localhost:3000/api/answers", {
      answerBank: answers,
    });
  };

  /**
   * Obtiene el estado del banco de respuestas desde el servidor y actualiza el estado.
   *
   * @async
   * @function getAnswersBankStatus
   * @returns {Promise<void>} Una promesa que se resuelve cuando el estado del banco de respuestas se ha obtenido y el estado se ha actualizado.
   */
  const getAnswersBankStatus = async () => {
    const status = await axios.get("http://localhost:3000/api/answers/status");
    setAnswerBankStatus(status.data);
  };

  /**
   * Envía el estado del banco de respuestas al servidor y actualiza el estado local.
   *
   * @async
   * @function setAnswerBankStatusToServer
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  const setAnswerBankStatusToServer = async () => {
    await axios.post("http://localhost:3000/api/answers/status", {
      status: !answerBankStatus,
    });

    setAnswerBankStatus(!answerBankStatus);
  };

  /**
   * Obtiene el límite de usuarios desde el servidor y actualiza el estado.
   *
   * @async
   * @function getLimitOfUsers
   * @returns {Promise<void>} Una promesa que se resuelve cuando el límite de usuarios se ha obtenido y el estado se ha actualizado.
   */
  const getLimitOfUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users/limit");
    setLimitOfUsers(response.data);
  };

  /**
   * Envía el nuevo límite de usuarios al servidor y actualiza el estado local.
   *
   * @async
   * @function setLimitOfUsersToServer
   * @param {number} limit - El nuevo límite de usuarios.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  const setLimitOfUsersToServer = async (limit: number) => {
    await axios.post("http://localhost:3000/api/users/limit", {
      limit: limit,
    });

    setLimitOfUsers(limit);
  };

  /**
   * Guarda los usuarios en la base de datos.
   *
   * @async
   * @function saveUsers
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  const saveUsers = async () => {
    await axios.post("http://localhost:3000/api/users/save");

    setIsUsersSaved(true);
    setTimeout(() => {
      setIsUsersSaved(false);
    }, 4000);
  };

  /**
   * Limpia el array de usuarios en el servidor.
   *
   * @async
   * @function cleanUsers
   * @returns {Promise<void>} Una promesa que se resuelve cuando la solicitud se completa.
   */
  const cleanUsers = async () => {
    await axios.post("http://localhost:3000/api/users/clean-users-array");
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
                  <Card
                    className={
                      btnLimitOfUsersStyles +
                      (limitOfUsers === 4 ? "border-2 border-black " : "")
                    }
                    onClick={() => {
                      setLimitOfUsersToServer(4);
                      setLimitOfUsers(4);
                    }}
                  >
                    4
                  </Card>
                  <Card
                    className={
                      btnLimitOfUsersStyles +
                      (limitOfUsers === 8 ? "border-2 border-black " : "")
                    }
                    onClick={() => {
                      setLimitOfUsersToServer(8);
                      setLimitOfUsers(8);
                    }}
                  >
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
          <Card className="text-center w-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Ronda actual</CardTitle>
            </CardHeader>
            <CardContent className="text-6xl font-bold text-center my-2">
              {round + 1}
            </CardContent>
            <CardFooter className="flex justify-center">
              {/* Btn para comenzar la ronda */}
              <Button
                onClick={startRound}
                disabled={isRoundInProgress}
                className="m-1"
              >
                Comenzar ronda
              </Button>

              {/* Btn para pasar a la siguiente ronda */}
              {!isFinalRound && (
                <Button
                  onClick={() => {
                    setRoundToServer(round + 1);
                  }}
                  disabled={isRoundInProgress}
                  className="m-1"
                >
                  Siguiente ronda
                </Button>
              )}

              {/* TODO: feedback */}
              {/* Btn para reiniciar el conteo y guardar los datos en la DB */}
              {isFinalRound && (
                <Button
                  onClick={() => {
                    saveUsers();
                    cleanUsers();
                    setRoundToServer(0);
                  }}
                >
                  Reiniciar conteo
                </Button>
              )}
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

        <section className="grid gap-4 mt-4 grid-cols-1 max-w-[1500px]">
          {/* Usuarios */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Usuarios conectados: {users ? users.length : 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tabla de usuarios */}
              <Table>
                <TableCaption>Lista de los usuarios.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    {Array.from({ length: 12 }).map((_, index) => (
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
              {/* Botón para guardar los usuarios */}
              {users && users.length > 0 && (
                <div className="text-right my-4">
                  <Button onClick={saveUsers} disabled={isUsersSaved}>
                    {isUsersSaved ? (
                      <>
                        Guardado <Check className="pl-2" />
                      </>
                    ) : (
                      "Guardar datos"
                    )}
                  </Button>
                </div>
              )}
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
