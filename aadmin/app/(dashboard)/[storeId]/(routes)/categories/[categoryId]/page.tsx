// app/(dashboard)/[storeId]/(routes)/categories/[categoryId]/page.tsx

import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
  params,
}: {
  params: { categoryId: string; storeId: string };
}) => {
  try {
    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    // Creating a new category: pass null as initialData
    if (params.categoryId === "new") {
      return (
        <div className="flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryForm
              initialData={null} // ✅ FIXED: required prop
              billboards={billboards}
            />
          </div>
        </div>
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(params.categoryId)) {
      throw new Error(`Invalid categoryId: ${params.categoryId}`);
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CategoryForm
            initialData={category}
            billboards={billboards}
          />
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("CategoryPage error:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <h1 className="text-red-500">Error: {error.message}</h1>
        </div>
      </div>
    );
  }
};

export default CategoryPage;
