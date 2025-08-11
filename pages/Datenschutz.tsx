import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/datenschutz', permanent: true },
});

export default function RedirectDatenschutz() {
  return null;
}
