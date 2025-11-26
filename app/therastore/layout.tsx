import { TheraStoreHeader } from '@/components/TheraStoreHeader';

export default function TheraStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TheraStoreHeader />
      <main>{children}</main>
    </>
  );
}







