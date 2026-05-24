export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  void params;
  return (
    <main className="p-8">
      <h1 className="font-display text-3xl text-gold">Trip Detail</h1>
    </main>
  );
}
