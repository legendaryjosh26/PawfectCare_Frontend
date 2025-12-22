import React, { useState, useEffect } from "react";
import Delete from "../../assets/Pet-Page-Image/Delete.svg";
import Edit from "../../assets/Pet-Page-Image/Edit.svg";
import { useNavigate } from "react-router-dom";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import NotificationModal from "../../Components/Modals/NotificationModal";

function PetPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPets, setLoadingPets] = useState(true);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    size: "",
    gender: "",
    weight: "",
    medical_status: [],
    otherMedical: "",
    color: "",
    status: "Available",
    image: "",
    imageFile: null,
  });

  const { apiClient, logout } = useAuth();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoadingPets(true);
      const res = await apiClient.get("/pets/getAllPets");
      const data = res.data;
      if (Array.isArray(data)) setPets(data);
      else if (Array.isArray(data.pets)) setPets(data.pets);
      else setPets([]);
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      setLoadingPets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let medicalHistory = [...formData.medical_status];
      if (
        medicalHistory.includes("Other") &&
        formData.otherMedical.trim() !== ""
      ) {
        medicalHistory = medicalHistory.filter((m) => m !== "Other");
        medicalHistory.push(`Other: ${formData.otherMedical.trim()}`);
      }

      const payload = {
        name: formData.name,
        breed: formData.breed,
        size: formData.size,
        gender: formData.gender,
        weight: formData.weight,
        color: formData.color,
        status: formData.status,
        medical_status: medicalHistory.join(", "),
        image: formData.image,
      };

      const url = editingPet
        ? `/pets/updatePet/${editingPet.pet_id}`
        : `/pets/addPet`;

      const method = editingPet ? "put" : "post";

      await apiClient[method](url, payload); // POST/PUT via instance[web:18]

      await fetchPets();
      closeForm();

      setNotification({
        isOpen: true,
        type: "success",
        message: editingPet
          ? "Pet updated successfully!"
          : "Pet added successfully!",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setNotification({
        isOpen: true,
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;

    try {
      // keep PUT if your backend uses PUT for soft delete
      const res = await apiClient.put(`/pets/deletePet/${petToDelete.pet_id}`); // or .delete if your route is DELETE[web:31]
      const data = res.data;

      if (data.success) {
        setPets((prev) =>
          prev.filter((pet) => pet.pet_id !== petToDelete.pet_id)
        );
        setNotification({
          isOpen: true,
          type: "success",
          message: data?.message || "Pet deleted successfully!",
        });
      } else {
        throw new Error(data?.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setNotification({
        isOpen: true,
        type: "error",
        message: error.message || "Failed to delete pet!",
      });
    } finally {
      setShowDeleteModal(false);
      setPetToDelete(null);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openForm = (pet = null) => {
    if (pet) {
      let medicalArr = pet.medical_status
        ? pet.medical_status.split(",").map((m) => m.trim())
        : [];
      let otherMedicalText = "";

      medicalArr = medicalArr.filter((m) => {
        if (m.startsWith("Other:")) {
          otherMedicalText = m.replace("Other:", "").trim();
          return false;
        }
        return true;
      });

      if (otherMedicalText) medicalArr.push("Other");

      setEditingPet(pet);
      setFormData({
        name: pet.name || "",
        breed: pet.breed || "",
        size: pet.size || "",
        gender: pet.gender || "",
        weight: pet.weight || "",
        medical_status: medicalArr,
        otherMedical: otherMedicalText,
        color: pet.color || "",
        status: pet.status || "Available",
        image: pet.imageUrl || pet.image || "",
        imageFile: null,
      });
    } else {
      setEditingPet(null);
      setFormData({
        name: "",
        breed: "",
        size: "",
        gender: "",
        weight: "",
        medical_status: [],
        otherMedical: "",
        color: "",
        status: "Available",
        image: "",
        imageFile: null,
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPet(null);
    setFormData({
      name: "",
      breed: "",
      size: "",
      gender: "",
      weight: "",
      medical_status: [],
      otherMedical: "",
      color: "",
      status: "Available",
      image: "",
      imageFile: null,
    });
  };

  const openDeleteModal = (pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  // Filter pets based on search query
  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={logout} />

        {/* Page Header with Search and Add Button */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Pet Management
                </h2>
                <p className="text-sm text-gray-600">
                  Manage and monitor all pets in the system (
                  {filteredPets.length} pets)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2.5 pl-10 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent
                             text-sm"
                  />
                  <svg
                    className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Add Pet Button */}
                <button
                  onClick={() => openForm()}
                  className="px-6 py-2.5 bg-[#560705] text-white text-sm font-semibold rounded-lg 
                           shadow-sm hover:bg-[#703736] hover:shadow-md transition-all duration-200 
                           active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#560705] focus:ring-offset-2
                           whitespace-nowrap"
                >
                  + Add Pet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Table */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Breed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Medical
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingPets ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-200" />
                              <div className="h-4 w-24 bg-gray-200 rounded" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-5 w-20 bg-gray-200 rounded-full" />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : filteredPets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No pets found matching your search"
                          : "No pets available"}
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map((pet) => (
                      <tr
                        key={pet.pet_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={pet.imageUrl || pet.image}
                              className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-100"
                              alt={pet.name}
                            />
                            <span className="font-medium text-gray-900">
                              {pet.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pet.breed}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pet.size}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pet.gender}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pet.color}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pet.weight} KG
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {pet.medical_status}
                        </td>
                        <td className="px-6 py-4">
                          {pet.status === "Available" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unavailable
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => openForm(pet)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="Edit Pet"
                            >
                              <img src={Edit} alt="Edit" className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(pet)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Delete Pet"
                            >
                              <img
                                src={Delete}
                                alt="Delete"
                                className="h-5 w-5"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
                aria-hidden="true"
                onClick={closeForm}
              ></div>

              {/* Center modal */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                {/* Modal Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingPet ? "Edit Pet" : "Add New Pet"}
                    </h3>
                    <button
                      onClick={closeForm}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Pet Name & Breed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="e.g., Max, Bella"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Breed <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="breed"
                          placeholder="e.g., Golden Retriever"
                          value={formData.breed}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Size & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                          required
                        >
                          <option value="">Select Size</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Color & Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          name="color"
                          placeholder="e.g., Brown, White"
                          value={formData.color}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (KG)
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                weight: Math.max(
                                  (parseFloat(formData.weight) || 0) - 0.1,
                                  0
                                ).toFixed(1),
                              })
                            }
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            name="weight"
                            step="0.1"
                            value={formData.weight}
                            onChange={handleChange}
                            className="flex-1 px-4 py-2.5 text-center outline-none border-none
                                     [&::-webkit-outer-spin-button]:appearance-none 
                                     [&::-webkit-inner-spin-button]:appearance-none 
                                     [-moz-appearance:textfield]"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                weight: (
                                  (parseFloat(formData.weight) || 0) + 0.1
                                ).toFixed(1),
                              })
                            }
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Medical Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Status
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Vaccinated",
                          "Dewormed",
                          "Spayed/Neutered",
                          "Other",
                        ].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg 
                                       hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              name="medical_status"
                              value={option}
                              checked={formData.medical_status?.includes(
                                option
                              )}
                              onChange={(e) => {
                                const { value, checked } = e.target;
                                let updatedMedical = [
                                  ...(formData.medical_status || []),
                                ];
                                if (checked) updatedMedical.push(value);
                                else
                                  updatedMedical = updatedMedical.filter(
                                    (item) => item !== value
                                  );
                                setFormData({
                                  ...formData,
                                  medical_status: updatedMedical,
                                });
                              }}
                              className="h-4 w-4 text-[#560705] border-gray-300 rounded 
                                         focus:ring-[#560705] cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>

                      {formData.medical_status?.includes("Other") && (
                        <input
                          type="text"
                          name="otherMedical"
                          placeholder="Please specify other medical condition"
                          value={formData.otherMedical || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              otherMedical: e.target.value,
                            })
                          }
                          className="mt-3 w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                        />
                      )}
                    </div>

                    {/* Status Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                      >
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>

                    {/* Upload Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                      </label>
                      <div className="flex items-center space-x-4">
                        {formData.image && (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg ring-2 ring-gray-200"
                          />
                        )}
                        <label
                          className="flex-1 flex flex-col items-center px-4 py-6 bg-gray-50 
                                       border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                                       hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm 
                               font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-[#560705] text-white text-sm font-semibold rounded-lg 
                               hover:bg-[#703736] focus:outline-none focus:ring-2 focus:ring-offset-2 
                               focus:ring-[#560705] disabled:opacity-50 disabled:cursor-not-allowed 
                               transition-all duration-200 active:scale-95 flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingPet ? "Update Pet" : "Add Pet"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
                aria-hidden="true"
                onClick={cancelDelete}
              ></div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Pet
                      </h3>
                      <p className="text-sm text-gray-600">
                        Are you sure you want to delete{" "}
                        <strong className="font-semibold text-gray-900">
                          {petToDelete?.name}
                        </strong>
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm 
                             font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg 
                             hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-red-500 transition-all duration-200 active:scale-95"
                  >
                    Delete Pet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
      />
    </div>
  );
}

export default PetPage;
