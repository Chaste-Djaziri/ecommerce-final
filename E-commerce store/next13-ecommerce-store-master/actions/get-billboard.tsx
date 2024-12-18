import { Billboard } from "@/types";
import { ObjectId } from "mongodb"; // Import the ObjectId class

const URL = `${process.env.NEXT_PUBLIC_API_URL}/billboards`;

const getBillboard = async (id: string): Promise<Billboard> => {
  // Ensure the id is a valid ObjectId before passing it to the API
  const objectId = new ObjectId(id); // Convert string to ObjectId
  
  const res = await fetch(`${URL}/${objectId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch billboard data");
  }

  return res.json();
};

export default getBillboard;
