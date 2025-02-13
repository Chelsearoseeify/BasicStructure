import { get } from "http";
import { getPeople, getPerson } from "./_api/peopleService";
import { usePeople } from "./_hooks/usePeople";
import {
  defaultShouldDehydrateQuery,
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Person from "./_components/Person";
import { Suspense } from "react";
import PersonSkeleton from "./_components/PersonSkeleton";

export default async function Home() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });

  queryClient.prefetchQuery({
    queryKey: ["person", "1"],
    queryFn: () => getPerson("1"),
    staleTime: 10 * 1000,
  });

  return (
    <>
      <section
        style={{
          textAlign: "center",
          marginTop: 48,
          marginBottom: 40,
          padding: 100,
        }}
      >
        <div>Title</div>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<PersonSkeleton />}>
            <Person />
          </Suspense>
        </HydrationBoundary>
      </section>
    </>
  );
}
