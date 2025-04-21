import AboutUsContent from "@/components/AboutUsContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Giới thiệu về TechTrend - Đối tác công nghệ của bạn",
  description:
    "Tìm hiểu về TechTrend, đối tác đáng tin cậy của bạn trong lĩnh vực công nghệ. Khám phá sứ mệnh, giá trị và cam kết đổi mới của chúng tôi.",
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AboutUsContent />
      <Footer />
    </div>
  );
}
