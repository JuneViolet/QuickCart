"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);

      fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setResults(data);
          }
        })
        .catch((err) => {
          setError("Có lỗi xảy ra khi tìm kiếm.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Kết quả tìm kiếm cho: "{query}"
      </h1>

      {loading && <p>Đang tìm kiếm...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && results.length > 0 ? (
        <ul>
          {results.map((item) => (
            <li key={item._id} className="mb-4 border-b pb-2">
              <Link
                href={`/product/${item._id}`}
                className="text-lg font-semibold hover:text-gray-900"
              >
                {item.name}
              </Link>
              <p>{item.description || "Không có mô tả"}</p>
              <p className="text-green-600">Giá: ${item.offerPrice}</p>
            </li>
          ))}
        </ul>
      ) : !loading && !error ? (
        <p>Không tìm thấy kết quả nào cho "{query}".</p>
      ) : null}
    </div>
  );
}
