export default function Card(): JSX.Element {
  return (
    <div className="relative col-span-1 w-72 h-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md " >
      <div className="flex flex-col justify-between align-center h-60 p-12">
         <h1>CARD ICON</h1>
         <p>CARD DESCRIPTION</p>
      </div>

    </div>
  );
}