import React from "react";

const PromoTable = ({ promos, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Mã</th>
            <th className="py-3 px-6 text-left">Giảm Giá</th>
            <th className="py-3 px-6 text-left">Hết Hạn</th>
            <th className="py-3 px-6 text-left">Lượt Sử Dụng</th>
            <th className="py-3 px-6 text-center">Hành Động</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {promos.map((promo) => (
            <tr key={promo._id} className="border-b">
              <td className="py-3 px-6">{promo.code}</td>
              <td className="py-3 px-6">
                {promo.discount < 1
                  ? `${promo.discount * 100}%`
                  : `$${promo.discount}`}
              </td>
              <td className="py-3 px-6">
                {promo.expiresAt
                  ? new Date(promo.expiresAt).toLocaleDateString()
                  : "Không có"}
              </td>
              <td className="py-3 px-6">
                {promo.usedCount}/{promo.maxUses || "Không giới hạn"}
              </td>
              <td className="py-3 px-6 text-center">
                <button
                  onClick={() => onEdit(promo)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(promo._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromoTable;
