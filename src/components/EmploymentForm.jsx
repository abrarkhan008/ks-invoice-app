import React, { useRef } from "react";
import MicButton from "./MicButton.jsx";

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 bg-white focus-within:border-ksorange">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 py-2 outline-none text-sm bg-transparent"
        />
        {type === "text" && <MicButton onText={(text) => onChange(text)} />}
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="flex items-start gap-2 border border-gray-300 rounded-lg px-2 bg-white focus-within:border-ksorange">
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex-1 py-2 outline-none text-sm bg-transparent resize-none"
        />
        <MicButton
          className="mt-1"
          onText={(text) => onChange((value ? value + " " : "") + text)}
        />
      </div>
    </div>
  );
}

// Photo picker: opens the phone's camera/gallery, converts the picture to a
// base64 data-url so it can be saved to localStorage and drawn into the PDF.
function PhotoUpload({ value, onChange }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        Passport Size Photo
      </label>
      <div className="flex items-center gap-3">
        <div className="w-20 h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={value}
              alt="Employee"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-gray-400 text-center px-1">
              No Photo
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold bg-ksorange text-white rounded-lg"
          >
            📷 Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold bg-ksdark text-white rounded-lg"
          >
            🖼️ Gallery
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-2 text-xs font-semibold bg-gray-200 text-gray-700 rounded-lg"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
function SignatureUpload({ value, onChange }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        Employee Signature
      </label>
      <div className="flex items-center gap-3">
        <div className="w-28 h-14 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={value}
              alt="Signature"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-gray-400">No Signature</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold bg-ksorange text-white rounded-lg"
          >
            📷 Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold bg-ksdark text-white rounded-lg"
          >
            🖼️ Gallery
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
export default function EmploymentForm({ employee, setEmployee }) {
  const update = (patch) => setEmployee({ ...employee, ...patch });

  const updateFamilyRow = (idx, patch) =>
    update({
      family: employee.family.map((row, i) =>
        i === idx ? { ...row, ...patch } : row,
      ),
    });
  const addChild = () =>
    update({ children: [...employee.children, { name: "", age: "" }] });

  const updateChild = (idx, patch) =>
    update({
      children: employee.children.map((c, i) =>
        i === idx ? { ...c, ...patch } : c,
      ),
    });

  const removeChild = (idx) =>
    update({ children: employee.children.filter((_, i) => i !== idx) });
  return (
    <div className="space-y-5">
      {/* Card basics */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">Card Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Card No"
            value={employee.cardNo}
            onChange={(v) => update({ cardNo: v })}
            placeholder="001"
          />
          <Field
            label="Working Place"
            value={employee.workingPlace}
            onChange={(v) => update({ workingPlace: v })}
          />
        </div>
      </section>

      {/* Personal details + photo */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Personal Details
        </h3>
        <PhotoUpload
          value={employee.photo}
          onChange={(v) => update({ photo: v })}
        />
        <Field
          label="Name"
          value={employee.name}
          onChange={(v) => update({ name: v })}
        />
        <TextAreaField
          label="Address"
          value={employee.address}
          onChange={(v) => update({ address: v })}
        />
        <Field
          label="Age & Date of Birth"
          value={employee.ageDob}
          onChange={(v) => update({ ageDob: v })}
          placeholder="24 yrs / 01-01-2000"
        />
        <Field
          label="Father's / Husband's Name"
          value={employee.fatherHusbandName}
          onChange={(v) => update({ fatherHusbandName: v })}
        />
        <Field
          label="Education / Qualification"
          value={employee.education}
          onChange={(v) => update({ education: v })}
        />
        <Field
          label="Marital Status"
          value={employee.maritalStatus}
          onChange={(v) => update({ maritalStatus: v })}
        />
      </section>

      {/* Family details */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">Family Details</h3>
        {employee.family.map((row, idx) => (
          <div key={row.label} className="grid grid-cols-2 gap-3 mb-1">
            <Field
              label={row.label}
              value={row.name}
              onChange={(v) => updateFamilyRow(idx, { name: v })}
            />
            <Field
              label="Age / DOB"
              value={row.age}
              onChange={(v) => updateFamilyRow(idx, { age: v })}
            />
          </div>
        ))}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-500 mb-2">
            d) Children's Name
          </label>
          {employee.children.map((child, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-center"
            >
              <Field
                label={`${idx + 1}.`}
                value={child.name}
                onChange={(v) => updateChild(idx, { name: v })}
              />
              <Field
                label="Age / DOB"
                value={child.age}
                onChange={(v) => updateChild(idx, { age: v })}
              />
              <button
                type="button"
                onClick={() => removeChild(idx)}
                className="text-red-500 text-xs font-bold px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addChild}
            className="text-xs font-semibold text-ksorange"
          >
            + Add Child
          </button>
        </div>
      </section>

      {/* Nominee / contact */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Nominee & Contact
        </h3>
        <SignatureUpload
          value={employee.signature}
          onChange={(v) => update({ signature: v })}
        />
        <Field
          label="Nominee"
          value={employee.nominee}
          onChange={(v) => update({ nominee: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Employee Mobile No"
            value={employee.mobile}
            onChange={(v) => update({ mobile: v })}
          />
          <Field
            label="Employee Aadhaar No"
            value={employee.aadhaar}
            onChange={(v) => update({ aadhaar: v })}
          />
        </div>
      </section>

      {/* Office use only */}
      <section className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ksorange mb-3">
          Office Use Only
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Date of Joining"
            type="date"
            value={employee.dateOfJoining}
            onChange={(v) => update({ dateOfJoining: v })}
          />
          <Field
            label="Designation / Department"
            value={employee.designation}
            onChange={(v) => update({ designation: v })}
          />
          <Field
            label="Wages / Salary"
            value={employee.wages}
            onChange={(v) => update({ wages: v })}
          />
          <Field
            label="ESIC Reg. No"
            value={employee.esicRegNo}
            onChange={(v) => update({ esicRegNo: v })}
          />
          <Field
            label="EPF A/C No"
            value={employee.epfAcNo}
            onChange={(v) => update({ epfAcNo: v })}
          />
          <Field
            label="Bank Name & A/C No"
            value={employee.bankDetails}
            onChange={(v) => update({ bankDetails: v })}
          />
          <Field
            label="Date of Leaving"
            type="date"
            value={employee.dateOfLeaving}
            onChange={(v) => update({ dateOfLeaving: v })}
          />
          <Field
            label="Reason for Leaving"
            value={employee.reasonForLeaving}
            onChange={(v) => update({ reasonForLeaving: v })}
          />
        </div>
        <TextAreaField
          label="Remarks if Any"
          value={employee.remarks}
          onChange={(v) => update({ remarks: v })}
        />
      </section>
    </div>
  );
}
