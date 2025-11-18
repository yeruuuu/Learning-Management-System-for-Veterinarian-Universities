import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createClassroom } from '../services/api';

const ClassroomForm = ({
  initialValues = {},
  onSubmit: submitProp,
  onCancelPath = "/classrooms",
  submitLabel = "Create Classroom",
  showHeader = true, 
}) => {
  const navigate = useNavigate();
  const { role } = useContext(RoleContext);
  const { user } = useAuth();

  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(initialValues.title || "");
    setDescription(initialValues.description || "");
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "teacher") {
      toast.error("Only teachers can create classrooms");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      if (submitProp) {
        await submitProp({ title, description });
      } else {
        await api.post(`/api/classrooms/create/`, { title, description });
        navigate("/classrooms");
      }
      toast.success(submitProp ? "Saved" : "Classroom created");
    } catch (error) {
      toast.error("Failed to save classroom");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen">
      {showHeader && (
        <>
          <div className="ml-8 mt-2">
            <Link
              to={onCancelPath}
              className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
            >
              <ArrowLeft className="size-5" />
              Back
            </Link>
          </div>
          <div className="px-8">
            <h2 className="font-bold text-3xl pt-2">{submitLabel}</h2>
          </div>
        </>
      )}

      <form className="max-w-3xl mx-8 mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Title</label>
          <input
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Classroom title"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-cookie-darkbrown font-medium">Description</label>
          <textarea
            className="rounded-md p-2 bg-cookie-lightcream border border-cookie-darkbrown text-cookie-darkbrown min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the classroom"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn bg-cookie-darkbrown text-cookie-white border border-cookie-darkbrown"
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ClassroomForm;