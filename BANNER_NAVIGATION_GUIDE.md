# Hướng Dẫn Sử Dụng Banner và HeaderSlider với Điều Hướng

## 1. Banner Component

### Props có thể tùy chỉnh:

```jsx
<Banner
  title="Tiêu đề banner" // Tiêu đề hiển thị
  description="Mô tả sản phẩm" // Mô tả hiển thị
  buttonText="Mua Ngay" // Text trên nút bấm
  navigationPath="/all-products" // Đường dẫn chuyển hướng
  categoryFilter="tai-nghe" // Category để lọc (có thể null)
  leftImage={assets.jbl_soundbox_image} // Hình ảnh bên trái
  rightImageMd={assets.md_controller_image} // Hình ảnh bên phải (desktop)
  rightImageSm={assets.sm_controller_image} // Hình ảnh bên phải (mobile)
/>
```

### Ví dụ sử dụng:

#### Banner cho tai nghe:

```jsx
<Banner
  title="Tai Nghe Chất Lượng Cao"
  description="Trải nghiệm âm thanh tuyệt vời với tai nghe premium"
  buttonText="Xem Tai Nghe"
  navigationPath="/all-products"
  categoryFilter="tai-nghe"
/>
```

#### Banner cho laptop:

```jsx
<Banner
  title="Laptop Gaming Mạnh Mẽ"
  description="Sức mạnh tối đa cho công việc và giải trí"
  buttonText="Xem Laptop"
  navigationPath="/all-products"
  categoryFilter="laptop"
/>
```

#### Banner chuyển đến trang khác:

```jsx
<Banner
  title="Về Chúng Tôi"
  description="Tìm hiểu câu chuyện của chúng tôi"
  buttonText="Tìm Hiểu Thêm"
  navigationPath="/about-us"
  categoryFilter={null}
/>
```

## 2. HeaderSlider Component

Slider đã được cập nhật với các thuộc tính điều hướng trong mảng `sliderData`:

```jsx
const sliderData = [
  {
    id: 1,
    title: "Tiêu đề slide",
    offer: "Ưu đãi đặc biệt",
    buttonText1: "Mua Ngay",
    buttonText2: "Tìm Hiểu Thêm",
    imgSrc: assets.header_headphone_image,
    navigationPath1: "/all-products", // Đường dẫn cho nút 1
    categoryFilter1: "tai-nghe", // Category cho nút 1
    navigationPath2: "/all-products", // Đường dẫn cho nút 2
    categoryFilter2: "tai-nghe", // Category cho nút 2
  },
];
```

## 3. Cách thức hoạt động

### Điều hướng với category:

- Khi `categoryFilter` được cung cấp, nút sẽ chuyển đến: `/all-products?category=tai-nghe`
- Trang all-products sẽ tự động lọc sản phẩm theo category này

### Điều hướng không có category:

- Khi `categoryFilter` là `null`, nút sẽ chuyển đến đường dẫn được chỉ định trực tiếp
- Ví dụ: `/about-us`, `/cart`, `/checkout`

## 4. Các category có thể sử dụng

Dựa trên assets có sẵn, các category phổ biến:

- `"tai-nghe"` - Tai nghe, earphone
- `"laptop"` - Laptop, máy tính xách tay
- `"gaming"` - Sản phẩm gaming (controller, console)
- `"camera"` - Máy ảnh, camera
- `"smartphone"` - Điện thoại thông minh
- `"smartwatch"` - Đồng hồ thông minh

## 5. Tùy chỉnh hình ảnh

Bạn có thể sử dụng bất kỳ hình ảnh nào từ `assets`:

- `assets.apple_earphone_image`
- `assets.asus_laptop_image`
- `assets.bose_headphone_image`
- `assets.cannon_camera_image`
- `assets.garmin_watch_image`
- Và nhiều hình ảnh khác...

## 6. Lưu ý quan trọng

1. **Import AppContext**: Đảm bảo component đã import và sử dụng `useAppContext`
2. **Category matching**: Category filter phải khớp với category trong database
3. **Image paths**: Sử dụng đúng đường dẫn hình ảnh từ assets
4. **Responsive**: Hình ảnh đã được tối ưu cho cả desktop và mobile
