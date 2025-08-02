import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import { useUser } from "@clerk/nextjs";
import { debounce } from "lodash";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
    formatCurrency,
    specifications,
    variants,
  } = useAppContext();

  const { isLoaded } = useUser();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [availablePromoCodes, setAvailablePromoCodes] = useState([]); // Danh sách mã khuyến mãi
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingFee, setShippingFee] = useState(0);
  const [isAddressSelected, setIsAddressSelected] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      console.log("Đang đợi Clerk tải dữ liệu người dùng...");
      return;
    }
    if (user) {
      fetchUserAddresses();
      fetchAvailablePromoCodes(); // Lấy danh sách mã khuyến mãi
    }
  }, [user, isLoaded]);

  const debouncedCalculateShippingFee = useCallback(
    debounce(async () => {
      if (
        !selectedAddress ||
        !selectedAddress.districtId ||
        !selectedAddress.wardCode ||
        !cartItems ||
        Object.keys(cartItems).length === 0
      ) {
        console.log("Skipping shipping fee calculation: Invalid data", {
          selectedAddress: !!selectedAddress,
          hasDistrictId: !!selectedAddress?.districtId,
          hasWardCode: !!selectedAddress?.wardCode,
          hasCartItems: !!(cartItems && Object.keys(cartItems).length > 0),
        });
        setShippingFee(0);
        return;
      }

      try {
        const totalWeight = Object.values(cartItems).reduce((sum, item) => {
          const productId = item.productId || item.key.split("_")[0];
          const variant = variants[productId]?.find(
            (v) => v._id.toString() === item.variantId
          );
          const specs = specifications[productId] || [];
          let weight = 50; // Mặc định 50g

          const weightSpec = specs.find(
            (s) => s.key.toLowerCase() === "trọng lượng"
          );

          if (weightSpec) {
            const weightValue = weightSpec.value.toLowerCase().trim();

            if (weightValue.includes("kg")) {
              // Nếu là kg, convert sang gram
              const kgValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
              if (!isNaN(kgValue)) {
                weight = Math.round(kgValue * 1000); // Convert kg to gram
              }
            } else if (weightValue.includes("g")) {
              // Nếu là gram
              const gValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
              if (!isNaN(gValue)) {
                weight = Math.round(gValue);
              }
            } else {
              // Nếu chỉ là số, assume là gram
              const numValue = parseFloat(weightValue.replace(/[^0-9.]/g, ""));
              if (!isNaN(numValue)) {
                weight = Math.round(numValue);
              }
            }
          }

          const quantity = item.quantity || 1;
          return sum + weight * quantity;
        }, 0);

        const totalValue = getCartAmount() || 0;

        const payload = {
          districtId: selectedAddress.districtId,
          wardCode: selectedAddress.wardCode,
          address: selectedAddress.area || "123 Nguyễn Chí Thanh",
          weight: Math.max(Math.round(totalWeight), 50), // Đảm bảo weight là số nguyên
          value: Math.round(totalValue), // Đảm bảo value là số nguyên
        };

        console.log("Weight calculation debug:", {
          originalTotalWeight: totalWeight,
          roundedWeight: Math.round(totalWeight),
          finalWeight: Math.max(Math.round(totalWeight), 50),
          cartItems: Object.values(cartItems).map((item) => {
            const productId = item.productId || item.key.split("_")[0];
            const specs = specifications[productId] || [];
            const weightSpec = specs.find(
              (s) => s.key.toLowerCase() === "trọng lượng"
            );
            return {
              productId,
              quantity: item.quantity,
              weightSpec: weightSpec?.value || "Not found",
            };
          }),
        });

        console.log("Sending Shipping Fee Payload:", payload);

        const token = await getToken();
        const { data } = await axios.post("/api/shipping/fee", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setShippingFee(data.data.fee || 0);
          console.log("Shipping Fee Calculated:", data.data.fee);
        } else {
          setShippingFee(0);
          console.warn("Shipping fee calculation failed:", data.message);
        }
      } catch (error) {
        console.error(
          "Calculate Shipping Fee Error:",
          error.message,
          error.response?.data
        );
        setShippingFee(0);
        if (error.response?.status >= 500) {
          toast.error(
            "Không thể tính phí vận chuyển: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    }, 1000),
    [
      selectedAddress,
      cartItems,
      variants,
      specifications,
      getCartAmount,
      getToken,
    ]
  );

  useEffect(() => {
    if (
      selectedAddress &&
      selectedAddress.districtId &&
      selectedAddress.wardCode &&
      cartItems &&
      Object.keys(cartItems).length > 0 &&
      isAddressSelected
    ) {
      debouncedCalculateShippingFee();
    }
  }, [
    selectedAddress,
    cartItems,
    isAddressSelected,
    debouncedCalculateShippingFee,
  ]);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          const defaultAddress =
            data.addresses.find((a) => a.isDefault) || data.addresses[0];
          setSelectedAddress(defaultAddress);
        } else {
          toast.info("Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ mới.");
          setSelectedAddress(null);
        }
      } else {
        toast.error(data.message || "Không thể tải địa chỉ");
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải địa chỉ:", error);
      toast.error("Lỗi khi tải địa chỉ: " + error.message);
      setSelectedAddress(null);
    }
  };

  const fetchAvailablePromoCodes = async () => {
    try {
      const token = await getToken();
      const totalAmount = getCartAmount() || 0;
      const { data } = await axios.get(
        `/api/promo/list?cartAmount=${totalAmount}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Promo Codes Response:", data); // Log để debug
      if (data.success) {
        setAvailablePromoCodes(data.promoCodes || []);
      } else {
        console.warn("Không thể tải danh sách mã khuyến mãi:", data.message);
        setAvailablePromoCodes([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải mã khuyến mãi:", error);
      setAvailablePromoCodes([]);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete("/api/user/get-address", {
        headers: { Authorization: `Bearer ${token}` },
        data: { addressId },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (selectedAddress && selectedAddress._id === addressId) {
          setSelectedAddress(data.addresses[0] || null);
          setIsAddressSelected(false);
        }
        toast.success("Địa chỉ đã được xóa");
      } else {
        toast.error(data.message || "Không thể xóa địa chỉ");
      }
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      toast.error("Lỗi khi xóa địa chỉ: " + error.message);
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const applyPromoCode = async () => {
    try {
      if (!promoCode.trim()) {
        toast.error("Vui lòng nhập hoặc chọn mã giảm giá");
        return;
      }
      const totalAmount = getCartAmount() || 0;
      const token = await getToken();
      const { data } = await axios.post(
        "/api/promo/validate",
        { code: promoCode.trim(), totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        let discountValue = 0;
        if (data.discountPercentage) {
          discountValue = (totalAmount * data.discountPercentage) / 100;
        } else if (data.discountAmount) {
          discountValue = data.discountAmount;
        }
        setDiscount(Math.min(Math.floor(discountValue), totalAmount));
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        setDiscount(0);
        toast.error(data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã:", error);
      setDiscount(0);
      toast.error("Lỗi khi áp dụng mã: " + error.message);
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = getCartAmount() || 0;
    const tax = Math.floor(subtotal * 0.02);
    const finalShippingFee =
      shippingFee !== null && shippingFee !== undefined ? shippingFee : 0;
    const total = subtotal + tax + finalShippingFee - discount;
    return Math.max(0, total);
  };

  const validateOrderData = () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return false;
    }

    const cartItemsArray = Object.entries(cartItems)
      .map(([key, item]) => ({
        product: key.split("_")[0],
        variantId: key.split("_")[1],
        quantity: item.quantity || 1,
      }))
      .filter((item) => item.quantity > 0);

    if (cartItemsArray.length === 0) {
      toast.error("Giỏ hàng trống");
      return false;
    }

    return cartItemsArray;
  };

  const debouncedCreateOrder = useCallback(
    debounce(async () => {
      try {
        const cartItemsArray = validateOrderData();
        if (!cartItemsArray) return;

        const token = await getToken();
        const subtotal = getCartAmount() || 0;
        const tax = Math.floor(subtotal * 0.02);
        const shippingFeeValue = shippingFee || 0;
        const total = subtotal + tax + shippingFeeValue - discount;

        console.log("🚀 Sending order data:", {
          address: selectedAddress._id,
          items: cartItemsArray,
          promoCode: promoCode || null,
          paymentMethod,
          amount: total,
          shippingFee: shippingFeeValue,
        });

        const response = await axios.post(
          "/api/order/create",
          {
            address: selectedAddress._id,
            items: cartItemsArray,
            promoCode: promoCode || null,
            paymentMethod,
            amount: total,
            shippingFee: shippingFeeValue,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || "Tạo đơn hàng thất bại");
        }

        const ghnTrackingCode = data.order?.trackingCode;
        if (ghnTrackingCode) {
          console.log("Mã theo dõi GHN:", ghnTrackingCode);
        } else {
          console.warn("Không tìm thấy mã GHN, sử dụng mã nội bộ");
        }

        if (paymentMethod === "vnpay" && data.order?.vnpayUrl) {
          window.location.href = data.order.vnpayUrl;
        } else {
          toast.success(data.message || "Đặt hàng thành công");
          setCartItems({});
          setPromoCode("");
          setDiscount(0);
          router.push(
            `/order-placed?trackingCode=${
              ghnTrackingCode || data.order.trackingCode
            }`
          );
        }
      } catch (error) {
        console.error("Đặt hàng lỗi:", error);
        toast.error(
          error.response?.data?.message || error.message || "Lỗi khi đặt hàng"
        );
      }
    }, 2000),
    [
      selectedAddress,
      cartItems,
      promoCode,
      paymentMethod,
      shippingFee,
      discount,
      getToken,
      router,
    ]
  );

  const createOrder = async () => {
    if (isSubmitting || !selectedAddress || getCartCount() === 0) return;
    setIsSubmitting(true);
    console.log("Sending order request at:", new Date().toISOString());
    await debouncedCreateOrder();
    setIsSubmitting(false);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsAddressSelected(true);
    setIsDropdownOpen(false);

    if (
      address.districtId &&
      address.wardCode &&
      cartItems &&
      Object.keys(cartItems).length > 0
    ) {
      console.log(
        "Address selected, shipping fee will be calculated automatically"
      );
    }
  };

  const handlePromoCodeSelect = (code) => {
    setPromoCode(code);
    setDiscount(0); // Reset discount khi chọn mã mới
  };

  const filterValidPromoCodes = (codes, totalAmount) => {
    return codes.filter((code) => {
      const amount = totalAmount || 0;
      return (
        amount >= code.minOrderValue &&
        amount <= (code.maxOrderValue || Infinity) &&
        code.isActive &&
        (!code.expiresAt || new Date() <= new Date(code.expiresAt))
      );
    });
  };

  const renderAddressDropdown = () => (
    <div className="relative inline-block w-full text-sm border">
      <button
        className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span>
          {selectedAddress
            ? `${selectedAddress.fullName}, ${selectedAddress.phoneNumber}, ${selectedAddress.area}, ${selectedAddress.ward}, ${selectedAddress.state}, ${selectedAddress.city}`
            : "Chọn địa chỉ"}
        </span>
        <svg
          className={`w-5 h-5 inline float-right transition-transform duration-200 ${
            isDropdownOpen ? "rotate-0" : "-rotate-90"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#6B7280"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isDropdownOpen && (
        <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-60 overflow-y-auto">
          {userAddresses.map((address, index) => (
            <li
              key={address._id || index}
              className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer flex justify-between items-center"
              onClick={() => handleAddressSelect(address)}
            >
              <span>
                {`${address.fullName}, ${selectedAddress.phoneNumber}, ${address.area}, ${address.ward}, ${address.state}, ${address.city}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAddress(address._id);
                }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Xóa
              </button>
            </li>
          ))}
          <li
            onClick={() => router.push("/add-address")}
            className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-orange-600 font-medium"
          >
            + Thêm địa chỉ mới
          </li>
        </ul>
      )}
    </div>
  );

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Chi Tiết Mua Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            CHỌN ĐỊA CHỈ
          </label>
          {renderAddressDropdown()}
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            PHƯƠNG THỨC THANH TOÁN
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-600">Thanh toán khi nhận hàng</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-600">Thanh toán qua VNPAY</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            MÃ GIẢM GIÁ
          </label>
          <div className="flex flex-col gap-3">
            <div className="relative inline-block w-full">
              <select
                value={promoCode}
                onChange={(e) => handlePromoCodeSelect(e.target.value)}
                className="w-full p-2.5 border text-gray-600 appearance-none"
              >
                <option value="">Chọn mã khuyến mãi</option>
                {filterValidPromoCodes(
                  availablePromoCodes,
                  getCartAmount()
                ).map((code) => (
                  <option key={code.code} value={code.code}>
                    {code.code} (
                    {code.discountPercentage
                      ? `${code.discountPercentage}%`
                      : `${code.discountAmount} VND`}
                    )
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-full p-2.5 border text-gray-600 mt-2"
                placeholder="Hoặc nhập mã thủ công"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setDiscount(0);
                }}
              />
            </div>
            <button
              onClick={applyPromoCode}
              className={`px-9 py-2 text-white transition-colors ${
                !promoCode.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Áp Dụng
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between font-medium">
            <p className="text-gray-600 uppercase">
              Mặt hàng ({getCartCount()})
            </p>
            <p>{formatCurrency(getCartAmount() || 0)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí vận chuyển</p>
            <p>{formatCurrency(shippingFee || 0)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Thuế (2%)</p>
            <p>{formatCurrency(Math.floor((getCartAmount() || 0) * 0.02))}</p>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <p className="text-gray-600">Giảm giá</p>
              <p className="text-green-600">-{formatCurrency(discount)}</p>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-3 text-lg">
            <p>Tổng</p>
            <p>{formatCurrency(calculateFinalTotal())}</p>
          </div>
        </div>

        <button
          onClick={createOrder}
          disabled={isSubmitting || !selectedAddress || getCartCount() === 0}
          className={`w-full py-3 mt-5 text-white transition-colors ${
            isSubmitting || !selectedAddress || getCartCount() === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
