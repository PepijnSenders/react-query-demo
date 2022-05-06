import { GetServerSideProps } from "next";
import { Suspense, useEffect, useState } from "react";
import { dehydrate, Hydrate, QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();

const DataComponent = () => {
  const { data } = useQuery(['test'], async () => {
    return { test: true };
  });
  const { data: asyncData } = useQuery(['async'], async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ test: 'hello world' });
      }, 2000);
    })
  }, {
    suspense: true
  })

  // if (!asyncData) {
  //   return <p>loading...</p>
  // }

  return <p>{(asyncData as any).test}</p>
};

const MountGuard = ({children}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true)
  }, []);

  if (!show) {
    return null;
  }

  return <>{children}</>
};

const SSRPage = ({ dehydratedState }) => {
  // console.log(dehydratedState);
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        <Suspense fallback={<p>loading with suspense...</p>}>
          <DataComponent />
        </Suspense>
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