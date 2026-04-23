import { useEffect, useState } from "react";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const data = ["Laptop", "Mobile", "Shoes"];
    setProducts(data);
  }, []);

  return (
    <div>
      <h2>Products Page 🛒</h2>

      <ul>
        {products.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default Products;