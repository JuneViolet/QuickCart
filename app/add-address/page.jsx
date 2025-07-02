// "use client";
// import { assets } from "@/assets/assets";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { useAppContext } from "@/context/AppContext";
// import axios from "axios";
// import toast from "react-hot-toast";

// const AddAddress = () => {
//   const { getToken, router } = useAppContext();

//   const [address, setAddress] = useState({
//     fullName: "",
//     phoneNumber: "",
//     pincode: "",
//     area: "",
//     city: "",
//     state: "",
//     ward: "",
//   });
//   const [provinces, setProvinces] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [wards, setWards] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [provinceCode, setProvinceCode] = useState("");
//   const [districtId, setDistrictId] = useState("");

//   useEffect(() => {
//     const fetchProvinces = async () => {
//       setLoading(true);
//       try {
//         const { data } = await axios.get("/api/provinces");
//         console.log("Provinces Response:", data);
//         if (data.success && Array.isArray(data.data)) {
//           setProvinces(data.data);
//           console.log("Provinces Set:", data.data);
//         } else {
//           throw new Error("Invalid data from /api/provinces");
//         }
//       } catch (error) {
//         console.error(
//           "Fetch Provinces Error:",
//           error.message,
//           error.response?.data
//         );
//         const staticProvinces = [
//           {
//             name: "Hồ Chí Minh",
//             code: "79",
//           },
//         ];
//         setProvinces(staticProvinces);
//         console.log("Provinces Set (Fallback):", staticProvinces);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProvinces();
//   }, []);

//   const handleProvinceChange = async (e) => {
//     const province = e.target.value;
//     console.log("Selected Province:", province);
//     const selectedProvince = provinces.find((p) => p.name === province);
//     console.log("Found Province in Data:", selectedProvince);
//     setProvinceCode(selectedProvince?.code || "");
//     setAddress({ ...address, city: province, state: "", ward: "" });
//     console.log("Updated Address:", {
//       ...address,
//       city: province,
//       state: "",
//       ward: "",
//     });
//     setDistricts([]);
//     setWards([]);

//     if (selectedProvince?.code) {
//       try {
//         const { data } = await axios.get(
//           `/api/districts?province=${selectedProvince.code}`
//         );
//         console.log("Districts Response:", data);
//         if (data.success && Array.isArray(data.data)) {
//           setDistricts(data.data);
//         }
//       } catch (error) {
//         console.error(
//           "Fetch Districts Error:",
//           error.message,
//           error.response?.data
//         );
//         setDistricts([{ name: "Quận 1", id: "760" }]);
//       }
//     }
//   };

//   const handleDistrictChange = async (e) => {
//     const district = e.target.value;
//     const selectedDistrict = districts.find((d) => d.name === district);
//     setDistrictId(selectedDistrict?.id || "");
//     setAddress({ ...address, state: district, ward: "" });
//     setWards([]);

//     if (selectedDistrict?.id) {
//       try {
//         const { data } = await axios.get(
//           `/api/wards?district=${selectedDistrict.id}`
//         );
//         console.log("Wards Response:", data);
//         if (data.success && Array.isArray(data.data)) {
//           setWards(data.data);
//         }
//       } catch (error) {
//         console.error(
//           "Fetch Wards Error:",
//           error.message,
//           error.response?.data
//         );
//         setWards([{ name: "Phường Bến Nghé" }, { name: "Phường Bến Thành" }]);
//       }
//     }
//   };

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     if (
//       !address.fullName ||
//       !address.phoneNumber ||
//       !address.area ||
//       !address.city ||
//       !address.state
//     ) {
//       toast.error("Vui lòng điền đầy đủ thông tin!");
//       return;
//     }
//     if (!/^\d{10,11}$/.test(address.phoneNumber)) {
//       toast.error("Số điện thoại phải từ 10-11 chữ số!");
//       return;
//     }

//     try {
//       const token = await getToken();
//       const { data } = await axios.post(
//         "/api/user/add-address",
//         { address },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         router.push("/cart");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
//         <form onSubmit={onSubmitHandler} className="w-full">
//           <p className="text-2xl md:text-3xl text-gray-500">
//             Thêm Vận chuyển{" "}
//             <span className="font-semibold text-orange-600">Địa Chỉ</span>
//           </p>
//           <div className="space-y-3 max-w-sm mt-10">
//             <input
//               className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//               type="text"
//               placeholder="Tên đầy đủ"
//               onChange={(e) =>
//                 setAddress({ ...address, fullName: e.target.value })
//               }
//               value={address.fullName}
//             />
//             <input
//               className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//               type="text"
//               placeholder="Số điện thoại"
//               onChange={(e) =>
//                 setAddress({ ...address, phoneNumber: e.target.value })
//               }
//               value={address.phoneNumber}
//             />
//             <input
//               className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//               type="text"
//               placeholder="Mã bưu điện"
//               onChange={(e) =>
//                 setAddress({ ...address, pincode: e.target.value })
//               }
//               value={address.pincode}
//             />
//             <textarea
//               className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
//               rows={4}
//               placeholder="Địa chỉ (Khu vực và Đường phố)"
//               onChange={(e) => setAddress({ ...address, area: e.target.value })}
//               value={address.area}
//             />
//             <div className="flex space-x-3">
//               <select
//                 className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//                 value={address.city}
//                 onChange={handleProvinceChange}
//                 disabled={loading}
//               >
//                 <option value="">
//                   {loading ? "Đang tải tỉnh/thành..." : "Chọn Tỉnh/Thành phố"}
//                 </option>
//                 {Array.isArray(provinces) && provinces.length > 0 ? (
//                   provinces.map((province, index) => (
//                     <option
//                       key={`${province.name}-${index}`}
//                       value={province.name}
//                     >
//                       {province.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option disabled>Không có dữ liệu tỉnh/thành</option>
//                 )}
//               </select>
//               <select
//                 className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//                 value={address.state}
//                 onChange={handleDistrictChange}
//                 disabled={!address.city || loading}
//               >
//                 {console.log(
//                   "District Dropdown Disabled:",
//                   !address.city || loading,
//                   "City:",
//                   address.city,
//                   "Loading:",
//                   loading
//                 )}
//                 <option value="">Chọn Quận/Huyện</option>
//                 {Array.isArray(districts) && districts.length > 0 ? (
//                   districts.map((district, index) => (
//                     <option
//                       key={`${district.name}-${index}`}
//                       value={district.name}
//                     >
//                       {district.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option disabled>Chọn tỉnh trước</option>
//                 )}
//               </select>
//               <select
//                 className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
//                 value={address.ward || ""}
//                 onChange={(e) =>
//                   setAddress({ ...address, ward: e.target.value })
//                 }
//                 disabled={!address.state || loading}
//               >
//                 <option value="">Chọn Phường/Xã</option>
//                 {Array.isArray(wards) && wards.length > 0 ? (
//                   wards.map((ward, index) => (
//                     <option key={`${ward.name}-${index}`} value={ward.name}>
//                       {ward.name}
//                     </option>
//                   ))
//                 ) : (
//                   <option disabled>Chọn quận trước</option>
//                 )}
//               </select>
//             </div>
//           </div>
//           <div className="max-w-sm w-full flex flex-col mt-6 space-y-3">
//             <button
//               type="submit"
//               className="bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase"
//             >
//               Lưu Địa Chỉ
//             </button>
//             <button
//               type="button"
//               onClick={() => router.push("/cart")}
//               className="border border-orange-600 text-orange-600 py-3 hover:bg-orange-50 uppercase"
//             >
//               Quay lại giỏ hàng
//             </button>
//           </div>
//         </form>

//         <Image
//           className="md:mr-16 mt-16 md:mt-0"
//           src={assets.my_location_image}
//           alt="my_location_image"
//           width="auto"
//           height="auto"
//         />
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default AddAddress;
"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddAddress = () => {
  const { getToken, router } = useAppContext();

  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
    ward: "",
    districtId: "", // Thêm để lưu mã GHN
    wardCode: "", // Thêm để lưu mã GHN
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/provinces");
        if (data.success && Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          throw new Error("Invalid data from /api/provinces");
        }
      } catch (error) {
        console.error("Fetch Provinces Error:", error.message);
        setProvinces([]); // Fallback nếu cần
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e) => {
    const province = e.target.value;
    const selectedProvince = provinces.find((p) => p.name === province);
    setAddress({
      ...address,
      city: province,
      state: "",
      ward: "",
      districtId: "",
      wardCode: "",
    });
    setDistricts([]);
    setWards([]);

    if (selectedProvince?.code) {
      try {
        const { data } = await axios.get(
          `/api/provinces/districts?province=${selectedProvince.code}`
        );
        if (data.success && Array.isArray(data.data)) {
          setDistricts(data.data);
        }
      } catch (error) {
        console.error("Fetch Districts Error:", error.message);
        setDistricts([]);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const district = e.target.value;
    const selectedDistrict = districts.find((d) => d.name === district);
    setAddress({
      ...address,
      state: district,
      ward: "",
      districtId: selectedDistrict?.id || "",
      wardCode: "",
    });
    setWards([]);

    if (selectedDistrict?.id) {
      try {
        const { data } = await axios.get(
          `/api/provinces/wards?district=${selectedDistrict.id}`
        );
        if (data.success && Array.isArray(data.data)) {
          setWards(data.data);
        }
      } catch (error) {
        console.error("Fetch Wards Error:", error.message);
        setWards([]);
      }
    }
  };

  const handleWardChange = (e) => {
    const ward = e.target.value;
    const selectedWard = wards.find((w) => w.name === ward);
    setAddress({ ...address, ward, wardCode: selectedWard?.code || "" });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (
      !address.fullName ||
      !address.phoneNumber ||
      !address.area ||
      !address.city ||
      !address.state
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!/^\d{10,11}$/.test(address.phoneNumber)) {
      toast.error("Số điện thoại phải từ 10-11 chữ số!");
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/add-address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Thêm Vận chuyển{" "}
            <span className="font-semibold text-orange-600">Địa Chỉ</span>
          </p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Tên đầy đủ"
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              value={address.fullName}
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Số điện thoại"
              onChange={(e) =>
                setAddress({ ...address, phoneNumber: e.target.value })
              }
              value={address.phoneNumber}
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Mã bưu điện"
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
              value={address.pincode}
            />
            <textarea
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
              rows={4}
              placeholder="Địa chỉ (Khu vực và Đường phố)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
            />
            <div className="flex space-x-3">
              <select
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                value={address.city}
                onChange={handleProvinceChange}
                disabled={loading}
              >
                <option value="">
                  {loading ? "Đang tải tỉnh/thành..." : "Chọn Tỉnh/Thành phố"}
                </option>
                {Array.isArray(provinces) && provinces.length > 0 ? (
                  provinces.map((province, index) => (
                    <option
                      key={`${province.name}-${index}`}
                      value={province.name}
                    >
                      {province.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có dữ liệu tỉnh/thành</option>
                )}
              </select>
              <select
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                value={address.state}
                onChange={handleDistrictChange}
                disabled={!address.city || loading}
              >
                <option value="">Chọn Quận/Huyện</option>
                {Array.isArray(districts) && districts.length > 0 ? (
                  districts.map((district, index) => (
                    <option
                      key={`${district.name}-${index}`}
                      value={district.name}
                    >
                      {district.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Chọn tỉnh trước</option>
                )}
              </select>
              <select
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                value={address.ward}
                onChange={handleWardChange}
                disabled={!address.state || loading}
              >
                <option value="">Chọn Phường/Xã</option>
                {Array.isArray(wards) && wards.length > 0 ? (
                  wards.map((ward, index) => (
                    <option key={`${ward.name}-${index}`} value={ward.name}>
                      {ward.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Chọn quận trước</option>
                )}
              </select>
            </div>
          </div>
          <div className="max-w-sm w-full flex flex-col mt-6 space-y-3">
            <button
              type="submit"
              className="bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase"
            >
              Lưu Địa Chỉ
            </button>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="border border-orange-600 text-orange-600 py-3 hover:bg-orange-50 uppercase"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </form>

        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
          width="auto"
          height="auto"
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
