"use client";
import React from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const AboutUsContent = () => {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About TechTrend – Your Gateway to the Future of Technology
          </h1>
          <p className="text-gray-600 text-lg">
            Khám phá chúng tôi là ai, sứ mệnh của chúng tôi và lý do tại sao
            TechTrend là đối tác đáng tin cậy của bạn trong lĩnh vực công nghệ.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-8">
          {/* Text Content */}
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 mb-4">
              TechTrend được thành lập với niềm đam mê công nghệ và sự đổi mới.
              Chúng tôi tin rằng công nghệ nên được mọi người tiếp cận, và mục
              tiêu của chúng tôi là mang những tiện ích mới nhất đến trong tầm
              tay bạn. Từ điện thoại thông minh đến máy chơi game như
              PlayStation 5, chúng tôi cung cấp nhiều loại sản phẩm chất lượng
              cao với mức giá cạnh tranh.
            </p>
            <p className="text-gray-600 mb-4">
              Sứ mệnh của chúng tôi là giúp bạn đi trước xu hướng công nghệ,
              nâng cao trải nghiệm kỹ thuật số của bạn và khám phá các thiết bị
              giúp cuộc sống của bạn trở nên tiện lợi và thú vị hơn. Tại
              TechTrend, chúng tôi không chỉ là một cửa hàng – chúng tôi là đối
              tác công nghệ của bạn, cung cấp dịch vụ khách hàng đặc biệt và bảo
              hành đáng tin cậy.
            </p>
            <button
              onClick={() => (window.location.href = "/all-products")}
              className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition"
            >
              Explore Our Products
            </button>
          </div>
          {/* Image */}
          <div className="md:w-1/2">
            <Image
              src={assets.placeholder_image}
              alt="TechTrend Team"
              className="w-full h-64 object-cover rounded-lg"
              width={600}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Innovation
              </h3>
              <p className="text-gray-600">
                We bring you the latest and most innovative tech products to
                keep you ahead of the curve.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Customer First
              </h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We offer top-notch support
                and reliable warranties.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Quality
              </h3>
              <p className="text-gray-600">
                We only offer high-quality products from trusted brands to
                ensure your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsContent;
