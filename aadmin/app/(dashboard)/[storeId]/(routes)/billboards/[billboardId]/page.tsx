import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage = async ({
  params,
}: {
  params: { storeId: string, billboardId: string };
}) => {
  // Log the received billboardId to debug the issue
  console.log("Received billboardId:", params.billboardId);

  // Check if the billboardId is "new" (i.e., creating a new billboard)
  if (params.billboardId === "new") {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <BillboardForm initialData={null} />
        </div>
      </div>
    );
  }

  // Validate the ObjectId format
  if (!/^[a-fA-F0-9]{24}$/.test(params.billboardId)) {
    console.error("Invalid ObjectId format:", params.billboardId); // Log the invalid format
    throw new Error("Invalid ObjectId format");
  }

  // Fetch the billboard by its ObjectId (as string)
  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: params.billboardId, // Use the string directly
    },
  });

  // If no billboard is found, handle the error or return a default response
  if (!billboard) {
    return <div>Billboard not found</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;
