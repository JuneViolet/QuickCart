import React from "react";
import Link from "next/link";
import { assets } from "../../assets/assets";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const pathname = usePathname();
  const menuItems = [
    {
      name: "DashBoard",
      path: "/seller/dash-board",
      icon: assets.dashboard, // Tạm dùng icon của Orders, bạn có thể thay bằng icon mới
    },
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    {
      name: "Promo Codes",
      path: "/seller/promocodes",
      icon: assets.promocode,
    },
    {
      name: "Manage C&B",
      path: "/seller/manage-categories-brands",
      icon: assets.entity,
    },
    {
      name: "Specification",
      path: "/seller/specifications",
      icon: assets.specifications,
    },
    {
      name: "Spec Templates",
      path: "/seller/specification-template",
      icon: assets.work_list,
    },
    {
      name: "Attributes",
      path: "/seller/attributes",
      icon: assets.work_list,
    },
  ];

  return (
    <div className="md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} passHref>
            <div
              className={`flex items-center py-3 px-4 gap-3 ${
                isActive
                  ? "border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90 text-orange-500"
                  : "hover:bg-gray-100/90 border-white text-gray-700"
              }`}
            >
              <Image
                src={item.icon}
                alt={`${item.name.toLowerCase().replace(/\s+/g, "_")}_icon`}
                className="w-7 h-7"
              />
              <p className="md:block hidden text-center">{item.name}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SideBar;
