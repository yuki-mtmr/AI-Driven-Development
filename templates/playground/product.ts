const products = [
    { id: 1, name: "商品A", price: 1000, stock: 10 },
    { id: 2, name: "商品B", price: 2000, stock: 20 },
    { id: 3, name: "商品C", price: 3000, stock: 30 },
    { id: 4, name: "商品D", price: 4000, stock: 40 },
    { id: 5, name: "商品E", price: 5000, stock: 50 },
];

export const getNameById = (productId: number): string | undefined => {
    const product = products.find(product => product.id === productId);
    return product?.name;
};

export const getPriceByName = (productName: string): number | undefined => {
    const product = products.find(product => product.name === productName);
    return product?.price;
};

// 使用例
const productId = 1;
const productName = getNameById(productId);
console.log(`ID ${productId} の商品名: ${productName}`); // "ID 1 の商品名: 商品A" と表示されます

// 存在しないIDの場合
const invalidId = 99;
const notFoundName = getNameById(invalidId);
console.log(`ID ${invalidId} の商品名: ${notFoundName}`); // "ID 99 の商品名: undefined" と表示されます

// getPriceByNameの使用例
const name = "商品B";
const price = getPriceByName(name);
console.log(`商品名 ${name} の価格: ${price}`); // "商品名 商品B の価格: 2000" と表示されます

// 存在しない商品名の場合
const invalidName = "商品Z";
const notFoundPrice = getPriceByName(invalidName);
console.log(`商品名 ${invalidName} の価格: ${notFoundPrice}`); // "商品名 商品Z の価格: undefined" と表示されます
