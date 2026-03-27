import { CollectionDetailPage } from '@/components/dashboard/drops/detail/CollectionDetailPage';

export default function CollectionDetailRoute({ params }: { params: { id: string } }) {
  return <CollectionDetailPage id={params.id} />;
}
