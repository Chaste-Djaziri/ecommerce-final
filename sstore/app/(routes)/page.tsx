import getBillboard from "@/actions/get-billboard";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import BillboardComponent from "@/components/ui/billboard";
import Container from "@/components/ui/container";

export const revalidate = 0;

const HomePage = async () => {
  // Fetch featured products (this part seems fine)
  const products = await getProducts({ isFeatured: true });

  // Fetch billboard by passing a valid MongoDB ObjectId string
  const billboard = await getBillboard("40710b61-7aee-4f44-aff5-62c742d3bca3"); // This should be a valid ObjectId string
  
  return (
    <Container>
      <div className="space-y-10 pb-10">
        <BillboardComponent data={billboard} />
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
