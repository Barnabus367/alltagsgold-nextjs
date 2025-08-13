import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/collections',
      permanent: true,
    },
  };
};

export default function Redirect() {
  return null;
}