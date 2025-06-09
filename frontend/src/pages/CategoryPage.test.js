import { describe, it, expect } from "vitest";
import { getSortedProducts } from "./CategoryPage";

describe("getSortedProducts", () => {
  const products = [
    { name: "Bike B", price: 200, createdAt: "2023-01-02" },
    { name: "Bike A", price: 100, createdAt: "2023-01-01" },
  ];

  it("sorts alphabetically A-Z", () => {
    const result = getSortedProducts(products, "az");
    expect(result[0].name).toBe("Bike A");
    expect(result[1].name).toBe("Bike B");
  });

  it("sorts alphabetically Z-A", () => {
    const result = getSortedProducts(products, "za");
    expect(result[0].name).toBe("Bike B");
    expect(result[1].name).toBe("Bike A");
  });

  it("sorts by ascending price", () => {
    const result = getSortedProducts(products, "price-asc");
    expect(result[0].price).toBe(100);
    expect(result[1].price).toBe(200);
  });

  it("sorts by descending price", () => {
    const result = getSortedProducts(products, "price-desc");
    expect(result[0].price).toBe(200);
    expect(result[1].price).toBe(100);
  });
});
