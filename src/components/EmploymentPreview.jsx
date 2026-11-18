import React, { forwardRef } from "react";
import logo from "../assets/logo.png";
import sealSign from "../assets/ks-enterprises-seal-signature.png";
import watermark from "../assets/watermark.png";

const COMPANY = {
  name: "K S ENTERPRISES",
  address:
    "Basavanapura Village, Chikkaiahana\nChatra Hobli, Nanjangud, Mysuru-571 302",
  mobile: "8660712660",
  gstin: "29EQSPR9307H1ZX",
  email: "ksenterprises1102@gmail.com",
};

// ---- theme (change ACCENT to your brand orange hex) ----
const INK = "#111827";
const LINE = "#374151";
const SOFT = "#f3f4f6";
const ACCENT = "#e8751a";
const NO_COLOR = "#b91c1c";

const cell = { display: "flex", alignItems: "center", padding: "6px 10px" };

function Bar({ children }) {
  return (
    <div
      data-keep
      style={{
        background: INK,
        color: "#fff",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 1.5,
        padding: "6px 0",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

// numbered "label : value" row
function Row({ no, label, value, minH = 32 }) {
  return (
    <div
      data-keep
      style={{
        display: "grid",
        gridTemplateColumns: "36px 190px 1fr",
        minHeight: minH,
        borderBottom: `1px solid ${LINE}`,
        fontSize: 11.5,
      }}
    >
      <div
        style={{
          ...cell,
          justifyContent: "center",
          padding: "6px 0",
          background: SOFT,
          borderRight: `1px solid ${LINE}`,
          color: NO_COLOR,
          fontWeight: 700,
        }}
      >
        {no}
      </div>
      <div
        style={{
          ...cell,
          background: SOFT,
          borderRight: `1px solid ${LINE}`,
          fontWeight: 600,
          fontSize: 10.5,
          letterSpacing: 0.3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ ...cell, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {value}
      </div>
    </div>
  );
}

// family table row
function FamilyRow({ no, label, name, age, head }) {
  const base = {
    display: "grid",
    gridTemplateColumns: "36px 190px 1fr 140px",
    minHeight: head ? 28 : 28,
    borderBottom: `1px solid ${LINE}`,
    fontSize: 11.5,
  };
  return (
    <div data-keep style={base}>
      <div
        style={{
          ...cell,
          justifyContent: "center",
          padding: "6px 0",
          background: SOFT,
          borderRight: `1px solid ${LINE}`,
          color: NO_COLOR,
          fontWeight: 700,
        }}
      >
        {no}
      </div>
      <div
        style={{
          ...cell,
          background: SOFT,
          borderRight: `1px solid ${LINE}`,
          fontWeight: head ? 600 : 400,
          fontSize: head ? 10.5 : 11.5,
          textTransform: head ? "uppercase" : "none",
          paddingLeft: head ? 10 : 22,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...cell,
          borderRight: `1px solid ${LINE}`,
          fontWeight: head ? 700 : 400,
        }}
      >
        {name}
      </div>
      <div style={{ ...cell, fontWeight: head ? 700 : 400 }}>{age}</div>
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
      style={{
        width: 794,
        minHeight: 1123,
        background: "#fff",
        color: INK,
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "28px 28px 28px 28px",
      }}
    >
      {/* watermark */}
      <img
        src={watermark}
        alt=""
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          height: 420,
          objectFit: "contain",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* HEADER */}
        <div
          data-keep
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 10,
            borderBottom: `3px solid ${ACCENT}`,
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{ width: 230, height: 100, objectFit: "contain" }}
          />
          <div style={{ textAlign: "right", lineHeight: 1.5 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{COMPANY.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700 }}>
              GSTIN : {COMPANY.gstin}
            </div>
            <div style={{ fontSize: 10, whiteSpace: "pre-line" }}>
              {COMPANY.address}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700 }}>
              Mob: {COMPANY.mobile}
            </div>
            <div style={{ fontSize: 10 }}>Email: {COMPANY.email}</div>
          </div>
        </div>

        {/* TITLE */}
        <div
          data-keep
          style={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: 19,
            letterSpacing: 3,
            margin: "14px 0 10px",
          }}
        >
          EMPLOYMENT DETAILS
        </div>

        {/* CARD NO / WORKING PLACE */}
        <div
          data-keep
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: `1px solid ${LINE}`,
            borderBottom: "none",
            background: SOFT,
            fontSize: 11.5,
          }}
        >
          <div style={{ ...cell, borderRight: `1px solid ${LINE}` }}>
            <b style={{ marginRight: 8 }}>Card No.</b>
            <span>{e.cardNo}</span>
          </div>
          <div style={cell}>
            <b style={{ marginRight: 8 }}>Working Place</b>
            <span>{e.workingPlace}</span>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div style={{ border: `1px solid ${LINE}`, borderBottom: "none" }}>
          <Bar>Personal Details</Bar>

          {/* rows 1-6 + photo column */}
          <div data-keep style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <Row no={1} label="Name" value={e.name} />
              <Row no={2} label="Address" value={e.address} minH={56} />
              <Row no={3} label="Age & Date of Birth" value={e.ageDob} />
              <Row
                no={4}
                label="Father's / Husband's Name"
                value={e.fatherHusbandName}
              />
              <Row
                no={5}
                label="Education / Qualification"
                value={e.education}
              />
              <Row no={6} label="Marital Status" value={e.maritalStatus} />
            </div>
            <div
              style={{
                width: 150,
                borderLeft: `1px solid ${LINE}`,
                borderBottom: `1px solid ${LINE}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 8,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 136,
                  border: `1px solid ${LINE}`,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {e.photo ? (
                  <img
                    src={e.photo}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>PHOTO</span>
                )}
              </div>
              <span
                style={{
                  fontSize: 8.5,
                  color: "#6b7280",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Passport Size Photo
              </span>
            </div>
          </div>

          {/* family */}
          <FamilyRow
            head
            no={7}
            label="Family Details"
            name="Name"
            age="Age / DOB"
          />
          {e.family.map((row) => (
            <FamilyRow
              key={row.label}
              label={row.label}
              name={row.name}
              age={row.age}
            />
          ))}
          {e.children.map((child, idx) => (
            <FamilyRow
              key={`child-${idx}`}
              label={`d) Child ${idx + 1}`}
              name={child.name}
              age={child.age}
            />
          ))}

          <Row no={8} label="Nominee" value={e.nominee} />
          <Row no={9} label="Employee Mobile No" value={e.mobile} />
          <Row no={10} label="Employee Aadhaar No" value={e.aadhaar} />
        </div>

        {/* EMPLOYEE SIGNATURE */}
        <div
          data-keep
          style={{
            border: `1px solid ${LINE}`,
            borderTop: "none",
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 24px",
          }}
        >
          <div
            style={{
              width: 190,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                height: 44,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                borderBottom: `1px solid ${LINE}`,
                marginBottom: 4,
              }}
            >
              {e.signature && (
                <img
                  src={e.signature}
                  alt="Employee Sign"
                  style={{ height: 40, maxWidth: 170, objectFit: "contain" }}
                />
              )}
            </div>
            <span style={{ color: NO_COLOR }}>Signature of the Employee</span>
          </div>
        </div>

        {/* OFFICE USE ONLY */}
        <div
          style={{
            marginTop: 14,
            border: `1px solid ${LINE}`,
            borderBottom: "none",
          }}
        >
          <Bar>Office Use Only</Bar>
          <Row no={1} label="Date of Joining" value={e.dateOfJoining} />
          <Row no={2} label="Designation / Department" value={e.designation} />
          <Row no={3} label="Wages / Salary" value={e.wages} />
          <Row no={4} label="ESIC Reg. No." value={e.esicRegNo} />
          <Row no={5} label="EPF A/C No." value={e.epfAcNo} />
          <Row no={6} label="Bank Name & A/C No." value={e.bankDetails} />
          <Row no={7} label="Date of Leaving" value={e.dateOfLeaving} />
          <Row no={8} label="Reason for Leaving" value={e.reasonForLeaving} />
          <Row no={9} label="Remarks if Any" value={e.remarks} minH={48} />
        </div>

        {/* FOOTER: moves down automatically, never split */}
        <div
          data-keep
          style={{
            marginTop: "auto",
            border: `1px solid ${LINE}`,
            borderTop: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "14px 20px 10px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <span style={{ color: NO_COLOR }}>Date:</span>
          <div style={{ textAlign: "center" }}>
            <img
              src={sealSign}
              alt="Seal & Sign"
              style={{
                height: 56,
                objectFit: "contain",
                display: "block",
                margin: "0 auto 4px",
              }}
            />
            <span style={{ color: NO_COLOR }}>Signature of Employer</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EmploymentPreview;
