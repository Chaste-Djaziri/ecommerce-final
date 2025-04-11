// ✅ Fixes the import issue — use type-only import
import type { Billboard as BillboardType } from "@/types";

// ✅ Rename the component to avoid conflict with type name
interface BillboardProps {
  data: BillboardType | null;
}

const BillboardComponent: React.FC<BillboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="w-full h-[300px] bg-neutral-200 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No billboard data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
      <div
        style={{ backgroundImage: `url(${data.imageUrl})` }}
        className="rounded-xl relative aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover"
      >
        <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8">
          <div className="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs">
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillboardComponent;
