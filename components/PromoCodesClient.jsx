"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import PromoTable from "@/components/PromoTable";
import PromoForm from "@/components/PromoForm";
import toast from "react-hot-toast";

const PromoCodesClient = ({ initialPromos, token }) => {
  const [promos, setPromos] = useState(initialPromos || []);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const fetchPromos = async () => {
    try {
      const { data } = await axios.get("/api/promos/manage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setPromos(data.promos || []);
      } else {
        toast.error(data.message || "Failed to fetch promo codes");
      }
    } catch (error) {
      toast.error(error.message || "Error fetching promo codes");
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa mã khuyến mãi này?")) {
      try {
        const promo = promos.find((p) => p._id === id);
        const { data } = await axios.delete("/api/promos/manage", {
          headers: { Authorization: `Bearer ${token}` },
          data: { code: promo.code },
        });
        if (data.success) {
          toast.success("Promo code deleted successfully");
          fetchPromos();
        } else {
          toast.error(data.message || "Failed to delete promo code");
        }
      } catch (error) {
        toast.error(error.message || "Error deleting promo code");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      const method = editingPromo ? "put" : "post";
      const url = "/api/promo/manage";
      const body = {
        code: formData.code,
        discount: parseFloat(formData.discount),
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt)
          : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        isActive: formData.isActive === "true" || formData.isActive === true,
      };
      const { data } = await axios[method](url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(
          editingPromo
            ? "Promo code updated successfully"
            : "Promo code added successfully"
        );
        setShowForm(false);
        setEditingPromo(null);
        fetchPromos();
      } else {
        toast.error(data.message || "Failed to save promo code");
      }
    } catch (error) {
      toast.error(error.message || "Error saving promo code");
    }
  };

  useEffect(() => {
    if (initialPromos.length === 0) {
      fetchPromos();
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản Lý Mã Khuyến Mãi</h1>
      <button
        onClick={() => {
          setShowForm(true);
          setEditingPromo(null);
        }}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Thêm Mã Khuyến Mãi
      </button>
      <PromoTable promos={promos} onEdit={handleEdit} onDelete={handleDelete} />
      {showForm && (
        <PromoForm
          initialData={editingPromo}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingPromo(null);
          }}
        />
      )}
    </div>
  );
};

export default PromoCodesClient;
