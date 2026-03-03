import { useState } from "react";
import { Link } from "react-router";

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  shippingFrequency: string;
  primaryLanes: string;
  shipmentType: string;
  promptingReview: string;
  consent: boolean;
  smsConsent: boolean;
}

interface FormErrors {
  companyName?: string;
  contactName?: string;
  email?: string;
  shippingFrequency?: string;
  primaryLanes?: string;
  consent?: string;
  phone?: string;
}

export function Review() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    shippingFrequency: "",
    primaryLanes: "",
    shipmentType: "",
    promptingReview: "",
    consent: false,
    smsConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Required.";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email.";
    }

    if (!formData.shippingFrequency) {
      newErrors.shippingFrequency = "Required.";
    }

    if (!formData.primaryLanes.trim()) {
      newErrors.primaryLanes = "Required.";
    }

    if (!formData.consent) {
      newErrors.consent = "Required.";
    }

    if (formData.smsConsent && !formData.phone.trim()) {
      newErrors.phone = "Required for SMS.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const intakeUrl = import.meta.env.VITE_FW_INTAKE_URL;
      
      if (!intakeUrl) {
        throw new Error("Intake endpoint not configured.");
      }

      const response = await fetch(intakeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Submission failed.");
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-4 sm:px-6 py-5 sm:py-6">
          <Link to="/" className="text-base sm:text-lg text-[var(--forged-ivory)]">
            Freightwright
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-md text-center">
            <h2 className="mb-4">Submitted.</h2>
            <p className="mb-2">Confirmation sent to your email.</p>
            <p className="text-sm text-[var(--muted-text)]">
              Reply to add detail or attach documents.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 py-5 sm:py-6">
        <Link to="/" className="text-base sm:text-lg text-[var(--forged-ivory)]">
          Freightwright
        </Link>
      </header>

      <main className="flex-1 flex justify-center px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="w-full max-w-2xl pt-8 sm:pt-12">
          <div className="mb-10 sm:mb-12">
            <h2 className="mb-3">Request Review</h2>
            <p className="text-[var(--muted-text)]">
              Review for structure and fit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="companyName" className="block mb-2 text-[var(--muted-text)]">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                />
                {errors.companyName && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contactName" className="block mb-2 text-[var(--muted-text)]">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                />
                {errors.contactName && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.contactName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-[var(--muted-text)]">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-[var(--muted-text)]">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                />
                {errors.phone && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
              <div>
                <label htmlFor="shippingFrequency" className="block mb-2 text-[var(--muted-text)]">
                  Shipping Frequency *
                </label>
                <select
                  id="shippingFrequency"
                  name="shippingFrequency"
                  value={formData.shippingFrequency}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-[var(--forged-charcoal)] border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                >
                  <option value="" className="bg-[var(--forged-charcoal)]">Select frequency</option>
                  <option value="occasionally" className="bg-[var(--forged-charcoal)]">Occasionally</option>
                  <option value="monthly" className="bg-[var(--forged-charcoal)]">Monthly</option>
                  <option value="weekly" className="bg-[var(--forged-charcoal)]">Weekly</option>
                  <option value="multiple-per-week" className="bg-[var(--forged-charcoal)]">Multiple per week</option>
                </select>
                {errors.shippingFrequency && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.shippingFrequency}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="shipmentType" className="block mb-2 text-[var(--muted-text)]">
                  Shipment Type
                </label>
                <select
                  id="shipmentType"
                  name="shipmentType"
                  value={formData.shipmentType}
                  onChange={handleChange}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-[var(--forged-charcoal)] border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors"
                >
                  <option value="" className="bg-[var(--forged-charcoal)]">Select type</option>
                  <option value="distributor" className="bg-[var(--forged-charcoal)]">Distributor</option>
                  <option value="retail" className="bg-[var(--forged-charcoal)]">Retail</option>
                  <option value="warehouse-transfer" className="bg-[var(--forged-charcoal)]">Warehouse transfer</option>
                  <option value="mixed" className="bg-[var(--forged-charcoal)]">Mixed</option>
                  <option value="other" className="bg-[var(--forged-charcoal)]">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="primaryLanes" className="block mb-2 text-[var(--muted-text)]">
                  Primary Lanes *
                </label>
                <textarea
                  id="primaryLanes"
                  name="primaryLanes"
                  value={formData.primaryLanes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Atlanta to Charlotte, Miami to Savannah"
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] placeholder:text-[#4a4f54] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors resize-none"
                />
                {errors.primaryLanes && (
                  <p className="mt-2 text-xs text-[var(--muted-text)]">
                    {errors.primaryLanes}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="promptingReview" className="block mb-2 text-[var(--muted-text)]">
                  What's prompting the review?
                </label>
                <textarea
                  id="promptingReview"
                  name="promptingReview"
                  value={formData.promptingReview}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3.5 sm:px-4 py-3 sm:py-3 bg-transparent border border-[#34383C] text-[var(--foreground)] focus:outline-none focus:ring-0 focus:border-[#4a4f54] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4 pt-2 sm:pt-4">
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-0.5 sm:mt-1 w-4 h-4 border border-[#34383C] bg-transparent checked:bg-[var(--burnished-bronze)] focus:outline-none focus:ring-0 accent-[var(--burnished-bronze)] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-[var(--muted-text)] group-hover:text-[var(--body-text)] transition-colors">
                    You may contact me about this submission. *
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-2 ml-7 text-xs text-[var(--muted-text)]">
                    {errors.consent}
                  </p>
                )}
              </div>

              {formData.phone && (
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="smsConsent"
                      checked={formData.smsConsent}
                      onChange={handleChange}
                      className="mt-0.5 sm:mt-1 w-4 h-4 border border-[#34383C] bg-transparent checked:bg-[var(--burnished-bronze)] focus:outline-none focus:ring-0 accent-[var(--burnished-bronze)] cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm text-[var(--muted-text)] group-hover:text-[var(--body-text)] transition-colors">
                      You may text me about this submission.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {submitError && (
              <p className="text-xs text-[var(--muted-text)] pt-2">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-10 sm:px-12 py-3.5 sm:py-4 bg-[var(--burnished-bronze)] text-[var(--forged-charcoal)] transition-all border-b-2 border-transparent hover:border-[#6d4f2a] disabled:opacity-50 disabled:cursor-not-allowed disabled:border-transparent mt-8"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}