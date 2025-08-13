import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/products',
      permanent: true,
    },
  };
};

export default function Redirect() {
  return null;
}