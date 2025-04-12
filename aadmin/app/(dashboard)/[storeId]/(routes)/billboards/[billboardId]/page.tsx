import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage = async ({
  params,
}: {
  params: { storeId: string; billboardId: string };
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

  // Validate the UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(params.billboardId)) {
    console.error("Invalid UUID format:", params.billboardId);
    return <div>Billboard not found</div>;
  }

  // Fetch the billboard by its UUID
  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: params.billboardId, // Use the UUID string directly
    },
  });

  // If no billboard is found, handle the error
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