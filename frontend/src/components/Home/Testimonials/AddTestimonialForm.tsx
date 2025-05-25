"use client";
import { useState } from "react";
import { createTestimonial } from "@/lib/apiService";
import { Testimonial } from "@/types/testimonial";
import { toast } from "react-toastify";

const AddTestimonialForm = () => {
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim() || !authorName.trim()) {
      toast.error("Please provide your name and review.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Omit<Testimonial, 'id' | 'created_at' | 'authorImg' | 'user'> = {
        authorName,
        authorRole,
        review,
      };
      await createTestimonial(payload);
      toast.success("Thank you for your feedback!");
      setAuthorName("");
      setAuthorRole("");
      setReview("");
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || 'Failed to submit testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          id="authorName"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="form-input w-full max-w-md"
          required
        />
      </div>
      <div>
        <label htmlFor="authorRole" className="block text-sm font-medium text-gray-700 mb-1">
          Your Role (optional)
        </label>
        <input
          id="authorRole"
          type="text"
          value={authorRole}
          onChange={(e) => setAuthorRole(e.target.value)}
          className="form-input w-full max-w-md"
        />
      </div>
      <div>
        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
          Your Feedback
        </label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="form-input w-full"
          required
        ></textarea>
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      <style jsx>{`
        .form-input {
          @apply block w-full px-3 py-2 text-sm text-dark bg-white border border-black rounded-md shadow-sm focus:outline-none hover:border-blue focus:border-blue focus:ring-blue transition-colors;
        }
        .btn-primary {
          @apply inline-flex items-center justify-center px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue transition-all duration-150 ease-in-out disabled:opacity-70;
        }
      `}</style>
    </form>
  );
};

export default AddTestimonialForm;
