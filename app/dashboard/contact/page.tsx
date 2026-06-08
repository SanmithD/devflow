"use client";

import axios from "axios";
import { useState } from "react";

function ContactPage() {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("/api/contact", formData);

      console.log(response.data);
      alert("Message sent successfully!");

      setFormData({
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center my-3 justify-center px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Contact Us</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
              className="peer w-full border rounded-lg px-4 pt-6 pb-2 outline-none focus:ring-2 focus:ring-gray-300"
            />

            <label
              htmlFor="email"
              className="absolute left-3 px-1 text-gray-500 bg-[#0F0F0F] transition-all
    peer-placeholder-shown:top-4
    peer-placeholder-shown:text-base
    peer-placeholder-shown:text-gray-400
    peer-focus:-top-2.5
    peer-focus:text-sm
   peer-focus:text-white peer-focus:bg-[#0F0F0F]
    -top-2 text-xs"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder=" "
              maxLength={100}
              required
              className="peer w-full border rounded-lg px-4 pt-6 pb-2 outline-none focus:ring-2 focus:ring-gray-300"
            />

            <label
              htmlFor="subject"
              className="absolute left-3 px-1 transition-all
    peer-placeholder-shown:top-4
    peer-placeholder-shown:text-base
    peer-placeholder-shown:text-gray-400 text-white
    peer-focus:-top-2
    peer-focus:text-xs
    peer-focus:text-white peer-focus:bg-[#0F0F0F]
    -top-2 text-xs"
            >
              Subject
            </label>
            <p className="text-xs text-gray-500 mt-1.5" >Max length 100</p>
          </div>

          <div className="relative">
            <textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder=" "
              maxLength={500}
              required
              className="peer w-full border rounded-lg px-4 pt-6 pb-2 resize-none outline-none focus:ring-2 focus:ring-gray-300"
            />

            <label
              htmlFor="message"
              className="absolute left-3 px-1 transition-all
    peer-placeholder-shown:top-4
    peer-placeholder-shown:text-base
    peer-placeholder-shown:text-gray-400 text-white
    peer-focus:-top-2
    peer-focus:text-xs
    peer-focus:text-white peer-focus:bg-[#0F0F0F]
    -top-2 text-xs"
            >
              Message
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border rounded-lg py-3 font-medium hover:bg-gray-500 cursor-pointer transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;
