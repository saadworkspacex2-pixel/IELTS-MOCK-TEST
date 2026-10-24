export default function Loading() {
  return <div className="min-h-screen bg-transparent px-5 pt-28"><div className="mx-auto max-w-6xl space-y-6"><div className="shimmer h-10 w-1/3 rounded" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((n) => <div key={n} className="card rounded-xl p-6"><div className="shimmer h-5 w-2/3 rounded" /><div className="shimmer mt-4 h-3 w-full rounded" /><div className="shimmer mt-2 h-3 w-4/5 rounded" /></div>)}</div></div></div>;
}
