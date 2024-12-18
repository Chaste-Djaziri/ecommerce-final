import getBillboard from "@/actions/get-billboard";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import Billboard from "@/components/ui/billboard";
import Container from "@/components/ui/container";

export const revalidate = 0;

const HomePage = async () => {
  // Fetch featured products (this part seems fine)
  const products = await getProducts({ isFeatured: true });

  // Fetch billboard by passing a valid MongoDB ObjectId string
  const billboard = await getBillboard("0e12e5cf29ab4529b8d5c5371dae1f7b"); // This should be a valid ObjectId string
  
  return (
    <Container>
      <div className="space-y-10 pb-10">
        <Billboard data={billboard} />
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
      </div>
    </Container>
  );
};

export default HomePage;
