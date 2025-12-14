import { TheraStoreHeader } from '@/components/TheraStoreHeader';

export default function TheraStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <TheraStoreHeader />
      <main>{children}</main>
    </div>
  );
}







