import React from "react";
import axios from "axios"; // Import axios
import toast from "react-hot-toast";
import Image from "next/image";

const ProductTable = ({
  products,
  productStocks,
  formatCurrency,
  router,
  handleEditProduct,
  handleDeleteProduct,
  isAddingVariant,
  setIsAddingVariant,
  setNewVariantData,
  setSelectedProductId,
  assets,
}) => {
  return (
    <>
      <div className="hidden sm:block w-full">
        <div className="max-h-96 overflow-y-auto border border-gray-600/20 rounded-md">
          <table className="table-fixed w-full">
            <thead className="text-gray-900 text-sm text-left bg-gray-100 sticky top-0">
              <tr>
                <th className="w-48 px-4 py-3 font-medium truncate">
                  Sản Phẩm
                </th>
                <th className="w-24 px-4 py-3 font-medium truncate">Loại</th>
                <th className="w-24 px-4 py-3 font-medium truncate">Hãng</th>
                <th className="w-24 px-4 py-3 font-medium truncate">
                  Số Lượng
                </th>
                <th className="w-28 px-4 py-3 font-medium truncate">
                  Giá tiền
                </th>
                <th className="w-32 px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <React.Fragment key={index}>
                  <tr className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={product.images?.[0] || assets.placeholder_image}
                          alt="Product Image"
                          className="w-full h-full object-cover rounded"
                          width={64}
                          height={64}
                        />
                      </div>
                      <span className="truncate w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {product.category?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      {product.brand?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      {productStocks[product._id] !== undefined
                        ? productStocks[product._id]
                        : "0"}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.offerPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            key={`view-${product._id}`}
                            onClick={() =>
                              router.push(`/product/${product._id}`)
                            }
                            className="flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded-md text-sm"
                            title="Xem"
                          >
                            <span className="w-4 h-4 flex items-center">
                              <Image
                                src={assets.view}
                                alt="View"
                                className="w-full h-full object-contain"
                                width={16}
                                height={16}
                              />
                            </span>
                          </button>
                          <button
                            key={`edit-${product._id}`}
                            onClick={() => handleEditProduct(product)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                            title="Sửa"
                          >
                            <span className="w-4 h-4 flex items-center">
                              <Image
                                src={assets.fix}
                                alt="Edit"
                                className="w-full h-full object-contain"
                                width={16}
                                height={16}
                              />
                            </span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            key={`delete-${product._id}`}
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                            title="Xóa"
                          >
                            <span className="w-4 h-4 flex items-center">
                              <Image
                                src={assets.deleted}
                                alt="Delete"
                                className="w-full h-full object-contain"
                                width={16}
                                height={16}
                              />
                            </span>
                          </button>
                          <button
                            key={`add-variant-${product._id}`}
                            onClick={() => {
                              const productData = products.find(
                                (p) => p._id === product._id
                              );
                              setNewVariantData({
                                productId: product._id,
                                attributeRefs: [],
                                price: productData.price || 0,
                                offerPrice: productData.offerPrice || 0,
                                stock: "",
                                sku: "",
                                image: "",
                              });
                              setIsAddingVariant(product._id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                            title="Thêm Biến Thể"
                          >
                            <span className="w-4 h-4 flex items-center">
                              <Image
                                src={assets.variant}
                                alt="Add Variant"
                                className="w-full h-full object-contain"
                                width={16}
                                height={16}
                              />
                            </span>
                          </button>
                          <button
                            key={`view-variants-${product._id}`}
                            onClick={() => {
                              setSelectedProductId(product._id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md text-sm"
                            title="Xem Biến Thể"
                          >
                            <span className="w-4 h-4 flex items-center">
                              <Image
                                src={assets.variant}
                                alt="View Variants"
                                className="w-full h-full object-contain"
                                width={16}
                                height={16}
                              />
                            </span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="block sm:hidden w-full">
        {/* Logic card cho mobile, tương tự table */}
      </div>
    </>
  );
};

export default ProductTable;
