import { GetServerSideProps } from "next";
import { dehydrate, Hydrate, QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();

const DataComponent = () => {
  const { data } = useQuery(['test'], async () => {
    return { test: true };
  });

  if (!data) {
    return <p>loading...</p>
  }

  if ((data as any).test) {
    return <h1>hello world</h1>
  }

  return <h1>bye world</h1>
};

const SSRPage = ({ dehydratedState }) => {
  // console.log(dehydratedState);
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        <DataComponent />
      </Hydrate>
    </QueryClientProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  queryClient.setQueryData(['test'], {
    test: true
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    }
  }
};

export default SSRPage;