import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/agb', permanent: true },
});

export default function RedirectAGB() {
  return null;
}
