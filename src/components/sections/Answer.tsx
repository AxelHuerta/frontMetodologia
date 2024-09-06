import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";

type Props = {
  name: string;
  answer: string;
  loading: boolean;
};

function Answer(props: Readonly<Props>) {
  const { name, answer, loading } = props;

  return (
    <div className="flex items-center justify-between py-1 px-4 mx-4 my-2 border-2 border-neutral-300 rounded-lg">
      {loading && (
        <>
          <Skeleton className="w-10 h-10 rounded-full mx-4" />
          <Skeleton className="w-full h-4" />
        </>
      )}

      {!loading && (
        <>
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <p className="ml-2">{name}</p>
          </div>
          <p className="ml-2">{answer}</p>
        </>
      )}
    </div>
  );
}

export default Answer;
