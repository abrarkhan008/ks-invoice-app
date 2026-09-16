import React, { forwardRef } from "react";
import logo from "../assets/logo.png";
import sealSign from "../assets/ks-enterprises-seal-signature.png";
import watermark from "../assets/watermark.png";

// ---- EDIT THESE ONCE: your company name / address shown at the top ----
const COMPANY = {
  name: "K S ENTERPRISES",
  address: "Your Company Address Line, City, State - PIN Code",
  mobile: "+91 90000 00000",
  gstin: "29XXXXX0000X1Z5",
};

// One "label : value" row, numbered like the printed form.
function Row({ no, label, value, minH = 28 }) {
  return (
    <div
      className="flex border-b border-black text-[11px]"
      style={{ minHeight: minH }}
    >
      <div className="w-6 border-r border-black flex items-center justify-center font-bold text-red-600">
        {no}
      </div>
      <div className="w-[160px] border-r border-black flex items-center px-2 font-semibold uppercase">
        {label}
      </div>
      <div className="w-4 border-r border-black flex items-center justify-center">
        :
      </div>
      <div className="flex-1 flex items-center px-2 whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

const EmploymentPreview = forwardRef(function EmploymentPreview(
  { employee },
  ref,
) {
  const e = employee;

  return (
    <div
      ref={ref}
      style={{ width: 794, height: 1123 }}
      className="bg-white text-black font-sans relative"
    >
      <img
  src={watermark}
  alt=""
  className="absolute inset-0 m-auto opacity-10 pointer-events-none select-none"
  style={{ width: 420, height: 420, objectFit: "contain", zIndex: 0 }}
/>

      {/* Header: logo + company address, auto-filled every time */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b-2 border-black">
        <img src={logo} alt="logo" className="h-12 object-contain" />
        <div className="text-right">
          <div className="text-sm font-bold">{COMPANY.name}</div>
          <div className="text-[10px] text-gray-600 max-w-[380px]">
            {COMPANY.address}
          </div>
          <div className="text-[10px] text-gray-600">Mob: {COMPANY.mobile}</div>
          <div className="text-[10px] text-gray-600">
            GSTIN: {COMPANY.gstin}
          </div>
        </div>
      </div>

      {/* Card No / Working Place */}
      <div className="flex border-x border-t border-black text-[11px] mx-6 mt-4">
        <div className="flex-1 flex border-r border-black">
          <span className="px-2 py-1 font-semibold">Card No.</span>
          <span className="px-2 py-1">{e.cardNo}</span>
        </div>
        <div className="flex-1 flex">
          <span className="px-2 py-1 font-semibold">Working Place</span>
          <span className="px-2 py-1">{e.workingPlace}</span>
        </div>
      </div>

      {/* Title */}
      <div className="mx-6 border-x border-b border-black text-center py-2 font-bold text-lg tracking-wide">
        EMPLOYMENT DETAILS
      </div>

      {/* Main table + photo box */}
      <div className="mx-6 border-x border-black relative">
        <Row no={1} label="NAME" value={e.name} />
        <Row no={2} label="ADDRESS" value={e.address} minH={44} />
        <Row no={3} label="AGE & DATE OF BIRTH" value={e.ageDob} />
        <Row
          no={4}
          label="FATHER'S / HUSBAND'S NAME"
          value={e.fatherHusbandName}
        />
        <Row no={5} label="EDUCATION / QUALIFICATION" value={e.education} />
        <Row no={6} label="MARITAL STATUS" value={e.maritalStatus} />

        {/* Photo box, sits over rows 1-3 on the right like the sample form */}
        <div
          className="absolute border border-black bg-white flex items-center justify-center overflow-hidden"
          style={{ top: 2, right: 2, width: 108, height: 128 }}
        >
          {e.photo ? (
            <img src={e.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-gray-400">PHOTO</span>
          )}
        </div>

        {/* Family details */}
        <div className="flex border-b border-black text-[11px]">
          <div className="w-6 border-r border-black flex items-center justify-center font-bold text-red-600">
            7
          </div>
          <div className="w-[160px] border-r border-black flex items-center px-2 font-semibold uppercase">
            FAMILY DETAILS
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 border-r border-black flex items-center px-2 font-bold">
              Name
            </div>
            <div className="w-[110px] flex items-center px-2 font-bold">
              Age / DOB
            </div>
          </div>
        </div>
        {e.family.map((row) => (
          <div
            key={row.label}
            className="flex border-b border-black text-[11px]"
          >
            <div className="w-6 border-r border-black" />
            <div className="w-[160px] border-r border-black flex items-center px-4">
              {row.label}
            </div>
            <div className="flex-1 flex">
              <div className="flex-1 border-r border-black flex items-center px-2">
                {row.name}
              </div>
              <div className="w-[110px] flex items-center px-2">{row.age}</div>
            </div>
          </div>
        ))}
        {e.children.map((child, idx) => (
          <div
            key={`child-${idx}`}
            className="flex border-b border-black text-[11px]"
          >
            <div className="w-6 border-r border-black" />
            <div className="w-[160px] border-r border-black flex items-center px-4">
              {idx + 1}. Child
            </div>
            <div className="flex-1 flex">
              <div className="flex-1 border-r border-black flex items-center px-2">
                {child.name}
              </div>
              <div className="w-[110px] flex items-center px-2">
                {child.age}
              </div>
            </div>
          </div>
        ))}

        <Row no={8} label="NOMINEE" value={e.nominee} />
        <Row no={9} label="EMPLOYEE MOBILE NO" value={e.mobile} />
        <Row no={10} label="EMPLOYEE AADHAAR NO" value={e.aadhaar} />
      </div>

      {/* Signature of employee */}
      <div className="mx-6 border border-t-0 border-black flex justify-end items-center gap-3 px-3 py-2 text-[11px] font-bold text-red-600">
        {e.signature && (
          <img
            src={e.signature}
            alt="Employee Sign"
            className="h-10 object-contain"
          />
        )}
        <span>Signature of the Employee</span>
      </div>

      {/* Office use only */}
      <div className="mx-6 border-x border-t border-black text-center py-1 font-bold text-red-600 text-[11px] uppercase">
        Office Use Only
      </div>
      <div className="mx-6 border-x border-black">
        <Row no={1} label="DATE OF JOINING" value={e.dateOfJoining} />
        <Row no={2} label="DESIGNATION / DEPARTMENT" value={e.designation} />
        <Row no={3} label="WAGES / SALARY" value={e.wages} />
        <Row no={4} label="ESIC REG. NO." value={e.esicRegNo} />
        <Row no={5} label="EPF A/C NO." value={e.epfAcNo} />
        <Row no={6} label="BANK NAME & A/C NO." value={e.bankDetails} />
        <Row no={7} label="DATE OF LEAVING" value={e.dateOfLeaving} />
        <Row no={8} label="REASON FOR LEAVING" value={e.reasonForLeaving} />
        <Row no={9} label="REMARKS IF ANY" value={e.remarks} minH={40} />
      </div>

      {/* Footer signature */}
      <div className="mx-6 border border-t-0 border-black flex justify-between items-end px-4 py-4 text-[11px] font-bold text-red-600">
        <span>Date:</span>
        <div className="flex flex-col items-center">
          <img
            src={sealSign}
            alt="Seal & Sign"
            className="h-14 object-contain mb-1"
          />
          <span>Signature of Employer</span>
        </div>
      </div>
    </div>
  );
});

export default EmploymentPreview;
