import { useQuery } from "@tanstack/react-query";
import { getPerson } from "../_api/peopleService";

export const usePeople = (id: string) => {
  const { data: person } = useQuery({
    queryKey: ["people", id],
    queryFn: () => getPerson(id),
  });

  console.log(person);

  return { person };
};
